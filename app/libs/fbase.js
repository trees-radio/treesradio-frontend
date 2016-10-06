
import firebase from 'firebase';

const FB_ENV = {
  apiKey: process.env.FBASE_API,
  authDomain: `${process.env.FBASE}.firebaseapp.com`,
  databaseURL: `https://${process.env.FBASE}.firebaseio.com`,
  storageBucket: `${process.env.FBASE}.appspot.com`,
};

console.log("FBENV", FB_ENV);

firebase.initializeApp(FB_ENV);

export default firebase;
