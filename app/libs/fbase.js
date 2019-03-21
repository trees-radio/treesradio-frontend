import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const FB_ENV = {
  apiKey: "AIzaSyBqtjxpWp17r6wfOTxF4WvzV6_MgRN-zwk",
  authDomain: "treesradio-live.firebaseapp.com",
  databaseURL: "https://treesradio-live.firebaseio.com",
  storageBucket: "treesradio-live.appspot.com"
};

firebase.initializeApp(FB_ENV);

export default firebase;
