// _________________________________________________________________________ //
// *----------------------------- Information -----------------------------* //
/*
  Contains generic helper functions to be used anywhere in the project.
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

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

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