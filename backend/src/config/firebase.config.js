import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// You'll need to set FIREBASE_SERVICE_ACCOUNT_KEY environment variable
// or create a service account key file
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      // Option 1: Using service account key from environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      // Option 2: Using service account key file (for development)
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        admin.initializeApp({
          credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        });
      }
      // Option 3: Using default credentials (for production on Google Cloud)
      else {
        admin.initializeApp();
      }
    }
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

export { admin, initializeFirebase }; 