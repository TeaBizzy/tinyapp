// _________________________________________________________________________ //
// *----------------------------- Information -----------------------------* //
/*
  Contains all registered users.
  NOTE: This database is stateless and will reset on server shutdown.

  Sample users are present by default for testing.
*/

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    hashedPassword: '$2a$10$RjPsqMmLyPDCk6nJdHdJEeEntcAtV7NXW0.uLLHU13hXdOo3aKigW'  // plaintext = purple-monkey-dinosaur
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    hashedPassword: '$2a$10$S8KvzcfA4Aj5edoCz4Erlexjq5BhPii.MlQLgZxW7/BxFnZMSo36.'  // plaintext = dishwasher-funk
  }
};

module.exports = { users };