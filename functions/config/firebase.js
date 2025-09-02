const admin = require('firebase-admin');

// In Cloud Functions, Firebase Admin is already initialized
// We just need to export the admin instance and db accessor
module.exports = {
  admin,
  get db() {
    return admin.firestore();
  }
};