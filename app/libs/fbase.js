import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const FB_ENV = {
  apiKey: FIREBASE_KEY,
  authDomain: FIREBASE_AUTH,
  databaseURL: FIREBASE_URL,
  storageBucket: FIREBASE_BUCKET
};

firebase.initializeApp(FB_ENV);

export default firebase;
