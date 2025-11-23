import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: Check if Firebase config is properly loaded
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing'
});

// Check if any required config is missing
const missingConfig = Object.entries(firebaseConfig).filter(([key, value]) => !value);
if (missingConfig.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingConfig.map(([key]) => key));
  console.error('Please set the following environment variables in your .env.local file:');
  missingConfig.forEach(([key]) => {
    console.error(`  VITE_${key.toUpperCase()}=your_value_here`);
  });
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app; 