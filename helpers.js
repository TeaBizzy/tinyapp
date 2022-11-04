// _________________________________________________________________________ //
// *----------------------------- Information -----------------------------* //

// Contains generic helper functions to be used anywhere in the project.

// _________________________________________________________________________ //
// *------------------------------ Functions ------------------------------* //

/*
  Generates a random string consisting of upper and lower case letters
  String length is determined by the given argument, default length of 6
  Returns a string
*/
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

/* 
  Returns the user object from the database by matching email
  Returns undefined if no user exists with the provided email
*/ 
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

/*
  Returns all url objects from the database if the given userID matches
  Returns empty object if no matches are found
*/
const getUrlsByUserID = function(userID, database) {
  const result = {};
  for (const url in database) {
    if (database[url].userID === userID) {
      result[url] = database[url];
    }
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString, getUrlsByUserID };