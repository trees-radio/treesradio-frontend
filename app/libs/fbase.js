import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const FB_ENV = {
  apiKey: "AIzaSyB_w_sx6mMUQil5nWhn0sd5CjgOtDFGICw",
  authDomain: "treesradio-staging.firebaseapp.com",
  databaseURL: "https://treesradio-staging.firebaseio.com",
  storageBucket: "treesradio-live.appspot.com"
};

firebase.initializeApp(FB_ENV);

export default firebase;
