// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www/lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'aJ48lw'
  }
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};


// ________________________________________________________________________ //
// *----------------------------- Middleware -----------------------------* //

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


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
  if (!urlDatabase[id]) {
    res.status(500);
    res.send('This short URL doesn\'t exist!');
    return;
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// Lists all available short URLs and their long URL counterparts
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    res.send('Error Please login to view URLs');
    return;
  }
  const user = users[userID];
  const templateVars = {
    user,
    urls: getUrlsByUserID(userID)
  };
  res.render('urls_index', templateVars);
});

// Adds a new short URL (key) and long URL (value) pair to the urlDatabase object
// Redirects the client to view the new short URL
app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
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
  urlDatabase[newID] = newURL;
  res.redirect(`/urls/${newID}`);
});

// NOTE: Must be placed ABOVE the routing for 'urls/:id'
// Displays the form for the client to create a new short url
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user: users[userID]
  };
  res.render('urls_new', templateVars);
});

// Displays the specified short URL for the client
app.get('/urls/:id', (req, res) => {
  // Gets the id parameter from the request
  const id = req.params.id;
  const userID = req.cookies['user_id'];
  const user = users[userID];

  if (!userID) {
    res.send('Please login to view URLs!');
    return;
  }
  
  if(urlDatabase[id].userID !== userID) {
    res.send('This URL belongs to someone else');
    return;
  }

  // We can access the full URL from our database with the id
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    user,
    id,
    longURL
  };

  res.render('urls_show.ejs', templateVars);
});

// Edits the urlDatabase at key 'id' with the new longURL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Deletes the specified id (short URL), from the urlDatabase
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
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
  const key = 'user_id';
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  // Check if the user exists
  if (!user) {
    res.status(403);
    res.send('Error, no user with that e-mail exists!');
    return;
  }

  // Checks that the password is valid
  if (user.password !== password) {
    res.status(403);
    res.send('Error, invalid password');
    return;
  }

  res.cookie(key, user.id);
  res.redirect('/urls');
});

// Logs the user out
app.post('/logout', (req, res) => {
  // TODO: Perhaps change this to find the cookie with this name.
  const cookie = 'user_id';
  res.clearCookie(cookie);
  res.redirect('/login');
});

// Shows registration page
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
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
  const password = req.body.password;

  // Check for empty email / password
  if (!email || !password) {
    res.status(400);
    res.send('Error, e-mail and password can\'t be blank. We should probably redirect to a warning??');
    return;
  }

  // Check if email is already register to a user
  if (getUserByEmail(email)) {
    res.status(400);
    res.send(`User: ${email} already exists!`);
    return;
  }

  const newUser = {
    id,
    email,
    password
  };
  users[id] = newUser;

  const cookie = 'user_id';
  res.cookie(cookie, id);

  res.redirect('/urls');
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


// ______________________________________________________________________________ //
// *----------------------------- Helper Functions -----------------------------* //

// TODO: Might make sense to refactor these into another file?

const generateRandomString = function(length = 6) {
  let randStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; i++) {
    let randIndex = Math.random() * characters.length;
    randIndex = Math.floor(randIndex);
    randStr += characters[randIndex];
  }
  
  return randStr;
};

const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const getUrlsByUserID = function(userID) {
  const result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};