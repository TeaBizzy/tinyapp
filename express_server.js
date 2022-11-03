// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const { getUserByEmail, generateRandomString, getUrlsByUserID } = require('./helpers');
const urlsDatabase = require('./databases/urls');
const usersDatabase = require('./databases/users');
const app = express();
const PORT = 8080; // default port 8080
const saltRounds = 10;

app.set('view engine', 'ejs');


// ________________________________________________________________________ //
// *----------------------------- Middleware -----------------------------* //

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1, key2, key3']
}));


// _____________________________________________________________________ //
// *----------------------------- Routing -----------------------------* //

// Home page, displays 'Hello!' to the client
// TODO: Implement a proper home page, or just redirect the client
app.get('/', (req, res) => {
  res.send('Hello!');
});

// Redirects the user to the long URL of the matching 'id' key
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!urlsDatabase[id]) {
    res.status(500);
    res.send('This short URL doesn\'t exist!');
    return;
  }
  const longURL = urlsDatabase[id].longURL;
  res.redirect(longURL);
});

// Lists all available short URLs and their long URL counterparts
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.send('Error Please login to view URLs');
    return;
  }
  const user = usersDatabase[userID];
  const templateVars = {
    user,
    urls: getUrlsByUserID(userID, urlsDatabase)
  };
  res.render('urls_index', templateVars);
});

// Adds a new short URL (key) and long URL (value) pair to the urlDatabase object
// Redirects the client to view the new short URL
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.send('You must be logged in to shorten URLs!');
    return;
  }
  const longURL = req.body.longURL;
  const newID = generateRandomString();
  const newURL = {
    longURL,
    userID
  };
  urlsDatabase[newID] = newURL;
  res.redirect(`/urls/${newID}`);
});

// NOTE: Must be placed ABOVE the routing for 'urls/:id'
// Displays the form for the client to create a new short url
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user: usersDatabase[userID]
  };
  res.render('urls_new', templateVars);
});

// Displays the specified short URL for the client
app.get('/urls/:id', (req, res) => {
  // Gets the id parameter from the request
  const id = req.params.id;
  const userID = req.session.user_id;
  const user = usersDatabase[userID];

  if (!userID) {
    res.send('Please login to view URLs!');
    return;
  }

  if (urlsDatabase[id].userID !== userID) {
    res.send('This URL belongs to someone else');
    return;
  }

  // We can access the full URL from our database with the id
  const longURL = urlsDatabase[id].longURL;
  const templateVars = {
    user,
    id,
    longURL
  };

  res.render('urls_show.ejs', templateVars);
});

// Edits the urlDatabase at key 'id' with the new longURL
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const longURL = req.body.longURL;

  if (!userID) {
    res.send('You need to be logged in to edit a URL');
    return;
  }

  if (!urlsDatabase[id]) {
    res.send('That URL doesn\'t exist!');
    return;
  }

  if (urlsDatabase[id].userID !== userID) {
    res.send('You do not own this URL!');
    return;
  }

  urlsDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Deletes the specified id (short URL), from the urlDatabase
app.delete('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;

  if (!userID) {
    res.send('You need to be logged in to delete a URL');
    return;
  }

  if (!urlsDatabase[id]) {
    res.send('That URL doesn\'t exist!');
    return;
  }

  if (urlsDatabase[id].userID !== userID) {
    res.send('You do not own this URL!');
    return;
  }

  delete urlsDatabase[id];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  // Redirect if user is already logged in
  if (userID) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user: undefined
  };
  res.render('login', templateVars);
});

// Logs the user in
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);

  // Check if the user exists
  if (!user) {
    res.status(403);
    res.send('Error, no user with that e-mail exists!');
    return;
  }

  bcrypt.compare(password, user.hashedPassword)
    .then((isValid) => {
      if (isValid) {
        console.log(isValid);
        req.session.user_id = user.id;
        res.redirect('/urls');
        return;
      } else {
        res.status(403);
        res.send('Error, invalid email or password');
      }
    });
});

// Logs the user out
app.post('/logout', (req, res) => {
  // TODO: Perhaps change this to find the cookie with this name.
  req.session = null;
  res.redirect('/login');
});

// Shows registration page
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = usersDatabase[userID];
  // Redirect if user is already logged in
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user
  };
  res.render('registration', templateVars);
});

// Registers a new user
app.post('/register', (req, res) => {
  // Create new user obj and append it to the users database
  const id = generateRandomString();
  const email = req.body.email;
  let password = req.body.password;
  
  // Check for empty email / password
  if (!email || !password) {
    res.status(400);
    res.send('Error, e-mail and password can\'t be blank. We should probably redirect to a warning??');
    return;
  }
  
  // Check if email is already register to a user
  if (getUserByEmail(email, usersDatabase)) {
    res.status(400);
    res.send(`User: ${email} already exists!`);
    return;
  }
  // TODO: Change salt rounds to a varaible
  bcrypt.hash(password, saltRounds).then((hashedPassword) => {
    const newUser = {
      id,
      email,
      hashedPassword
    };
    usersDatabase[id] = newUser;
    req.session.user_id = id;
    res.redirect('/urls');
  });
});

// A route for testing...
// TODO: We should remove this!
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


// _______________________________________________________________________ //
// *----------------------------- Listening -----------------------------* //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});