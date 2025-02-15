import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  databaseURL: import.meta.env.VITE_FIREBASE_URL,
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.database();

// Export the initialized instances
export { auth, db };
export default app;