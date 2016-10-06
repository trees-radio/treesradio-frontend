import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import {hookAuth, unhookAuth} from 'utils/ax';

export default new class Profile {
  constructor() {
    fbase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        this.init = true;
        this.connected = true;
      } else {
        this.connected = false;
      }
    });

    fbase.auth().onAuthStateChanged((user) => {
      this.user = user;
      if (user !== null) {
        fbase.database().ref('users').child(user.uid).on('value', snap => {
          var profile = snap.val() || {};
          this.profile = profile;
          this.profileInit = true;

          hookAuth(this.getToken);

          fbase.database().ref('.info/connected').on('value', snap => {
            if (snap.val() === true && this.profile && this.profile.username) {
              fbase.database().ref(`presence/${profile.username}/connections`).push(true).onDisconnect().remove();
              fbase.database().ref(`presence/${profile.username}/lastOnline`).onDisconnect().set(fbase.database.ServerValue.TIMESTAMP);
            }
          });
        });

        fbase.database().ref('private').child(user.uid).on('value', snap => {
          var priv = snap.val() || {};
          this.private = priv;
          this.privateInit = true;
          // this.playlists.init(priv.selectedPlaylist);
        });

      } else {
        // this.playlists.uninit();
        unhookAuth();
      }
    });
  }

  @observable connected = false;
  @observable init = false;

  @observable user = null;
  @observable profile = null;
  @observable profileInit = false;

  @observable private = null;
  @observable privateInit = false;

  login(email, password) {
    fbase.auth().signInWithEmailAndPassword(email, password).then(user => {
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
    fbase.auth().signOut().then(function() {
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
    return fbase.auth().currentUser.getToken(true); //returns promise with token
  }

  @computed get safeUsername() {
    if (this.profile === null) {
      return undefined;
    } else {
      return this.profile.username;
    }
  }

  register(email, password) {
    fbase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
      // console.log('registration error', error);
      toast.error(error.message);
    }).then(user => {
      //something
    })
  }

  sendPassReset(email) {
    fbase.auth().sendPasswordResetEmail(email).catch((error) => {
      toast.error(error.message);
      this.resetPassError = error.message;
      this.stopResettingPassword();
    }).then(() => {
      toast.success(`Success! An email with instructions has been sent to ${email}.`)
      this.stopResettingPassword();
    });
  }
}
