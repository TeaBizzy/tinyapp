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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// Must be placed ABOVE the routing for 'urls/:id'
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  // Gets the id parameter from the request
  const id = req.params.id;

  // We can access the full URL from our database with the id
  const longURL = urlDatabase[id];
  const templateVars = {id, longURL};

  res.render('urls_show.ejs', templateVars);
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


// _______________________________________________________________________ //
// *----------------------------- Listening -----------------------------* //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});