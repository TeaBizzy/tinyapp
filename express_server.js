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


// Redirects the user to the long URL of the matching 'id' key
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!urlsDatabase[id]) {
    res.status(500);
    return res.send('This short URL doesn\'t exist!');
  }
  const longURL = urlsDatabase[id].longURL;
  res.redirect(longURL);
});

// Lists all available short URLs and their long URL counterparts
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send('Error Please login to view URLs');
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
    return res.send('You must be logged in to shorten URLs!');
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
    return res.redirect('/login');
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
    return res.send('Please login to view URLs!');
  }

  if (urlsDatabase[id].userID !== userID) {
    return res.send('This URL belongs to someone else');
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
    return res.send('You need to be logged in to edit a URL');
  }

  if (!urlsDatabase[id]) {
    return res.send('That URL doesn\'t exist!');
  }

  if (urlsDatabase[id].userID !== userID) {
    return res.send('You do not own this URL!');
  }

  urlsDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Deletes the specified id (short URL), from the urlDatabase
app.delete('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;

  if (!userID) {
    return res.send('You need to be logged in to delete a URL');
  }

  if (!urlsDatabase[id]) {
    return res.send('That URL doesn\'t exist!');
  }

  if (urlsDatabase[id].userID !== userID) {
    return res.send('You do not own this URL!');
  }

  delete urlsDatabase[id];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  // Redirect if user is already logged in
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = {user: undefined};
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
    return res.send('Error, no user with that e-mail exists!');
  }

  bcrypt.compare(password, user.hashedPassword)
    .then((isValid) => {
      if (isValid) {
        req.session.user_id = user.id;
        return res.redirect('/urls');
      } else {
        res.status(403);
        res.send('Error, invalid email or password');
      }
    });
});

// Logs the user out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Shows registration page
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = usersDatabase[userID];
  // Redirect if user is already logged in
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {user};
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
    return res.send('Error, e-mail and password can\'t be blank.');
  }
  
  // Check if email is already register to a user
  if (getUserByEmail(email, usersDatabase)) {
    res.status(400);
    return res.send(`User: ${email} already exists!`);
  }
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

// Handles all invalid paths, redirects to /login
app.get('/*', (req, res) => {
  res.redirect('/login');
});


// _______________________________________________________________________ //
// *----------------------------- Listening -----------------------------* //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});