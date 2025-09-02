const admin = require('firebase-admin');
const secretsManager = require('./secrets');
require('dotenv').config();

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  if (!admin.apps.length) {
    try {
      // Try to get service account from Google Cloud Secret Manager
      const serviceAccount = await secretsManager.getFirebaseServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✓ Firebase initialized with service account from Secret Manager');
    } catch (error) {
      console.warn('Failed to retrieve service account from Secret Manager, falling back to local file:', error.message);
      /*
      // Fallback to local service account file for development
      try {
        const serviceAccount = require('../biblereading-pkey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✓ Firebase initialized with local service account file');
      } catch (localError) {
        console.error('Failed to initialize Firebase with local service account:', localError);
        throw localError;
      }
        */
    }
  }
}

// Initialize Firebase synchronously for immediate use
let initPromise = null;
function ensureFirebaseInitialized() {
  if (!initPromise) {
    initPromise = initializeFirebase();
  }
  return initPromise;
}

// Export functions and initialized instances
module.exports = { 
  admin, 
  ensureFirebaseInitialized,
  get db() {
    // Lazy initialization of db to ensure Firebase is initialized first
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized. Call ensureFirebaseInitialized() first.');
    }
    return admin.firestore();
  }
};