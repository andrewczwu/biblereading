const admin = require('firebase-admin');
require('dotenv').config();

// Path to your service account key file
const serviceAccount = require('../biblereading-pkey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
// If you need to specify a specific database, use:
// const db = admin.firestore(process.env.FIRESTORE_DATABASE_ID || '(default)');

module.exports = { admin, db };