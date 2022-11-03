// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const { expect } = require('chai');
const { it } = require('mocha');
const { getUserByEmail, generateRandomString, getUrlsByUserID } = require('../helpers');


// ___________________________________________________________________________ //
// *------------------------------- Test Data -------------------------------* //

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLS = {
  'b2xVn2': {
    longURL: 'http://www/lighthouselabs.ca',
    userID: 'aJ48lw'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'aJ48lw'
  },
  'Rt89GT': {
    longURL: 'http://www.youtube.com.com',
    userID: 'B69t4a'
  }
};


// ___________________________________________________________________________ //
// *--------------------------------- Tests ---------------------------------* //

// ______________________________ //
// *----- getUserByEmail() -----* //
describe('getUserByEmail()', () => {

  it('should return the user object with the matching email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';

    expect(expectedUserID).to.be.equal(user['id']);
  });

  it('should return type of object if the object contains a matching email', () => {
    const user = getUserByEmail('user@example.com', testUsers);

    expect(typeof user).to.be.equal("object");
  });

  it('should return undefined if no email match is found', () => {
    const user = getUserByEmail('not-a-user@example.com', testUsers);

    expect(user).to.be.undefined;
  });

  it('should return undefined if database is undefined', () => {
    const user = getUserByEmail('user@example.com', undefined);

    expect(user).to.be.undefined;
  });
});


// ____________________________________ //
// *----- generateRandomString() -----* //
describe('generateRandomString()', () => {

  it('should return a string with a length of 4, with 4 as the argument', () => {
    const resultLength = generateRandomString(4).length;
    const expectedLength = 4;

    expect(resultLength).to.be.equal(expectedLength);
  });

  it('should return a string with a length of 6, with no argument passed', () => {
    const resultLength = generateRandomString().length;
    const expectedLength = 6;

    expect(resultLength).to.be.equal(expectedLength);
  });

  it('should return type of string, with a valid argument', () => {
    const resultType = typeof generateRandomString();
    const expectedType = 'string';

    expect(resultType).to.be.equal(expectedType);
  });

  it('should return an empty string, when argument is NaN', () => {
    const result = generateRandomString(NaN);
    const expected = '';

    expect(result).to.be.equal(expected);
  });
});


// _______________________________ //
// *----- getUrlsByUserID() -----* //
describe('getUrlsByUserID()', () => {

  it('should return an empty object if userID is invalid', () => {
    const result = getUrlsByUserID('aaaaaa', testURLS);
    const expected = {};

    expect(result).to.be.deep.equal(expected);
  });

  it('should return the correct object if userID is valid', () => {
    const result = getUrlsByUserID('aJ48lw', testURLS);
    const expected = {
      'b2xVn2': {
        longURL: 'http://www/lighthouselabs.ca',
        userID: 'aJ48lw'
      },
      '9sm5xK': {
        longURL: 'http://www.google.com',
        userID: 'aJ48lw'
      }
    };

    expect(result).to.be.deep.equal(expected);
  });

  it('should return empty object if database is undefined', () => {
    const result = getUrlsByUserID('aJ48lw', undefined);
    const expected = {};

    expect(result).to.be.deep.equal(expected);
  });
});