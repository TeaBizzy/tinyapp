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
const PORT = 8080;
const saltRounds = 10;

app.set('view engine', 'ejs');

// ________________________________________________________________________ //
// *----------------------------- Middleware -----------------------------* //

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1, key2, key3']
}));

// _____________________________________________________________________ //
// *----------------------------- Routing -----------------------------* //

// ________________________________ //
// *------ Short Link Route ------* //

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

// ________________________________ //
// *-------- /urls Routes --------* //

// Lists all URLs owned by the user
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;

  if (!isLoggedIn) {
    return res.send('Error Please login to view URLs');
  }

  const user = usersDatabase[userID];
  const templateVars = {
    user,
    urls: getUrlsByUserID(userID, urlsDatabase)
  };

  res.render('urls_index', templateVars);
});

// Adds a new short URL (key) and long URL (value) to the database, redirects to view the new URL
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;

  if (!isLoggedIn) {
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

// Displays the form to create a new url
// NOTE: Must be placed ABOVE the routing for 'urls/:id'
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;

  if (!isLoggedIn) {
    return res.redirect('/login');
  }

  const templateVars = { user: usersDatabase[userID] };
  res.render('urls_new', templateVars);
});

// Displays the desired URL
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;
  
  if (!isLoggedIn) {
    return res.send('Please login to view URLs!');
  }
  
  if (urlsDatabase[id].userID !== userID) {
    return res.send('This URL belongs to someone else');
  }
  
  const longURL = urlsDatabase[id].longURL;
  const user = usersDatabase[userID];
  const templateVars = {
    user,
    id,
    longURL
  };

  res.render('urls_show.ejs', templateVars);
});

// Edits the url database at key 'id' to the submitted long url
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;
  
  if (!isLoggedIn) {
    return res.send('You need to be logged in to edit a URL');
  }

  if (!urlsDatabase[id]) {
    return res.send('That URL doesn\'t exist!');
  }
  
  if (urlsDatabase[id].userID !== userID) {
    return res.send('You do not own this URL!');
  }
  
  const longURL = req.body.longURL;
  urlsDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Deletes the specified id (short URL), from the urlDatabase
app.delete('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;

  if (!isLoggedIn) {
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

// _________________________________ //
// *-------- /login Routes --------* //

// Displays the login page
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const isLoggedIn = userID ? true : false;

  if (isLoggedIn) {
    return res.redirect('/urls');
  }
  
  const templateVars = { user: undefined };
  res.render('login', templateVars);
});

// Logs the user in
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);
  const isValidUser = user ? true : false;
  const isPasswordEmpty = password ? false : true;
  const isEmailEmpty = email ? false : true;

  if (isEmailEmpty || isPasswordEmpty) {
    res.status(400);
    return res.send('Error, e-mail and password can\'t be blank.');
  }

  if (!isValidUser) {
    res.status(403);
    return res.send('Error, no user with that e-mail exists!');
  }

  // Creates the session cookie
  bcrypt.compare(password, user.hashedPassword)
    .then((isValid) => {
      if (isValid) {
        req.session.user_id = user.id;
        return res.redirect('/urls');
      }

      res.status(403);
      res.send('Error, invalid email or password');
    });
});

// _________________________________ //
// *-------- /logout Route --------* //

// Logs the user out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// ________________________________ //
// *------ /register Routes ------* //

// Shows registration page
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = usersDatabase[userID];
  const isLoggedIn = userID ? true : false;

  if (isLoggedIn) {
    return res.redirect('/urls');
  }

  const templateVars = { user };
  res.render('registration', templateVars);
});

// Registers a new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const isPasswordEmpty = password ? false : true;
  const isEmailEmpty = email ? false : true;
  const isExistingEmail = getUserByEmail(email, usersDatabase) ? true : false;
  
  if (isEmailEmpty || isPasswordEmpty) {
    res.status(400);
    return res.send('Error, e-mail and password can\'t be blank.');
  }
  
  if (isExistingEmail) {
    res.status(400);
    return res.send(`User: ${email} already exists!`);
  }
  
  // Create new user obj and append it to the users database
  bcrypt.hash(password, saltRounds).
    then((hashedPassword) => {
      const id = generateRandomString();
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

// ________________________________ //
// *-------- Other Routes --------* //

// Handles all invalid paths, redirects to /login
app.get('/*', (req, res) => {
  res.redirect('/login');
});

// _______________________________________________________________________ //
// *----------------------------- Listening -----------------------------* //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});