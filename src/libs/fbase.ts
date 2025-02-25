import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import { FirebaseAuth } from "@firebase/auth-types";
import { FirebaseDatabase } from "@firebase/database-types";
import { FirebaseApp } from "@firebase/app-compat";

const firebaseConfig = {
  databaseURL: import.meta.env.VITE_FIREBASE_URL,
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET
};

// Initialize Firebase
const app: FirebaseApp = firebase.initializeApp(firebaseConfig);

// Initialize services
const auth: FirebaseAuth = firebase.auth();
const db: FirebaseDatabase = firebase.database();

export function getDatabaseRef(ref?: string) {
  return db.ref(ref);
}

// Export the initialized instances
export { auth, db };
export default app;