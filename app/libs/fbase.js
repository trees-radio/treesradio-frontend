import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: process.env.FIREBASE_URL,
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_AUTH,
  storageBucket: process.env.FIREBASE_BUCKET
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getDatabase(app);

// Export the initialized instances
export { auth, db };
export default db;