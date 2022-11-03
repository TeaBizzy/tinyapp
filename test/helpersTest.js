// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const { expect } = require('chai');
const { it } = require('mocha');
const { getUserByEmail, generateRandomString } = require('../helpers');


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