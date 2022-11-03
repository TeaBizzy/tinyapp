// ___________________________________________________________________________ //
// *----------------------------- Configuration -----------------------------* //

const { expect } = require('chai');
const { it } = require('mocha');
const { getUserByEmail } = require('../helpers');


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