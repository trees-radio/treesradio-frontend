import {observable, action, computed, toJS} from 'mobx';
// import ax from 'utils/ax';
import firebase from 'firebase';

import Online from 'stores/online';
import Chat from 'stores/chat';

import toast from 'utils/toast';

const FB_ENV = {
  apiKey: process.env.FBASE_API,
  authDomain: `${process.env.FBASE}.firebaseapp.com`,
  databaseURL: `https://${process.env.FBASE}.firebaseio.com`,
  storageBucket: `${process.env.FBASE}.appspot.com`,
};

// console.log(FB_ENV);

export default new class FirebaseSetup {
  constructor() {
    firebase.initializeApp(FB_ENV);
    this.online = new Online(firebase);
    this.chat = new Chat(firebase);

    firebase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        this.init = true;
        this.connected = true;
      } else {
        this.connected = false;
      }
    });

    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
      if (user !== null) {
        firebase.database().ref(`users/${user.uid}`).on('value', (snap) => {
          var profile = snap.val();
          this.profile = profile;
          this.profileInit = true;
          firebase.database().ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true && this.profile && this.profile.username) {
              firebase.database().ref(`presence/${profile.username}/connections`).push(true).onDisconnect().remove();
              firebase.database().ref(`presence/${profile.username}/lastOnline`).onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
            }
          });
        });
      }
    });

    // this.init = true;
  }

  @observable connected = false;
  @observable init = false;

  @observable user = null;
  @observable profile = null;
  @observable profileInit = false;

  login(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
      // console.log('user', user);
    }).catch((error) => {
      // Handle Errors here.
      // var errorCode = error.code;
      // var errorMessage = error.message;
      // console.log(error);
      toast.error(error.message);
      // ...
    });
  }

  logout() {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }, function(error) {
      // An error happened.
      toast.error(error.message);
    });
  }

  @computed get noName() {
    // console.log(this.profile);
    return this.user !== null && this.profileInit === true && (this.profile === null || !this.profile.username);
  }

  getToken() {
    return firebase.auth().currentUser.getToken(true); //returns promise with token
  }

  @computed get safeUsername() {
    if (this.profile === null) {
      return undefined;
    } else {
      return this.profile.username;
    }
  }

  register(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
      // console.log('registration error', error);
      toast.error(error.message);
    }).then(user => {
      //something
    })
  }

  sendPassReset(email) {
    firebase.auth().sendPasswordResetEmail(email).catch((error) => {
      toast.error(error.message);
      this.resetPassError = error.message;
      this.stopResettingPassword();
    }).then(() => {
      toast.success(`Success! An email with instructions has been sent to ${email}.`)
      this.stopResettingPassword();
    });
  }
}
