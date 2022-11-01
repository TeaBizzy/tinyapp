// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www/lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


// ________________________________________________________________________ //
// *----------------------------- Middleware -----------------------------* //

app.use(express.urlencoded({extended: true}));


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
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// Lists all available short URLs and their long URL counterparts
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// Adds a new short URL (key) and long URL (value) pair to the urlDatabase object
// Redirects the client to view the new short URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const newID = generateRandomString(6);
  urlDatabase[newID] = longURL;
  res.redirect(`/urls/${newID}`);
});

// NOTE: Must be placed ABOVE the routing for 'urls/:id'
// Displays the form for the client to create a new short url
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Displays the specified short URL for the client
app.get('/urls/:id', (req, res) => {
  // Gets the id parameter from the request
  const id = req.params.id;

  // We can access the full URL from our database with the id
  const longURL = urlDatabase[id];
  const templateVars = {id, longURL};

  res.render('urls_show.ejs', templateVars);
});

// Deletes the specified id (short URL), from the urlDatabase
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
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

const generateRandomString = function(length = 5) {
  let randStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; i++) {
    let randIndex = Math.random() * characters.length;
    randIndex = Math.floor(randIndex);
    randStr += characters[randIndex];
  }
  
  return randStr;
};