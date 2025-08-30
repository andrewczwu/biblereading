const { initializeApp, cert } = require('firebase-admin/app');
require('dotenv').config();

// Path to your service account key file
const serviceAccount = require('./biblereading-pkey.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

module.exports = { admin, db };