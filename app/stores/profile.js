import {observable, computed, autorun} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import epoch from 'utils/epoch';
import username from 'libs/username';
import {send} from 'libs/events';

const startup = epoch();

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

          send('hello');

          fbase.database().ref('.info/connected').on('value', snap => {
            if (snap.val() === true) {
              let presenceRef = fbase.database().ref(`presence/${user.uid}`);
              let timestamp = epoch();
              let updateRef = presenceRef.child('connections').push({timestamp, username: user.displayName, uid: user.uid});
              updateRef.onDisconnect().remove();
              this.presenceInterval = setInterval(() => updateRef.child('timestamp').set(epoch()), 60*1000);
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
        clearInterval(this.presenceInterval);
        // this.playlists.uninit();
      }
    });


    // self username handling
    autorun(() => {
      if (this.user) {
        username(this.user.uid).then(username => this.username = username);
      } else {
        this.username = undefined;
      }
    });
  }

  @observable connected = false;
  @observable init = false;

  @observable user = null;
  @observable username = undefined;
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

  @computed get unverified() {
    if (this.user && this.user.emailVerified) {
      return false;
    } else {
      return true;
    }
  }

  @computed get noName() {
    if (this.user !== null && this.profileInit === true) {
      const noLegacyUsername =  this.profile === null || !this.profile.username;
      const noUsername = !this.username;

      if (noLegacyUsername && noUsername) {
        if (epoch() > startup + 3) {
          return true;
        } else {
          return this.noName;
        }
      } else if (!noLegacyUsername && noUsername) {
        const legacyUsername = this.profile.username;
        this.updateUsername(legacyUsername);
      }

      return false;
    }
    return !this.user.displayName;
  }

  getToken() {
    return fbase.auth().currentUser.getToken(true); //returns promise with token
  }

  @computed get safeUsername() {
    if (this.user === null) {
      return undefined;
    } else {
      return this.username;
    }
  }

  @computed get eventsPath() {
    if (this.profile === null) {
      return false;
    } else {
      return `user_events/${this.user.uid}`;
    }
  }

  register(email, password) {
    fbase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
      // console.log('registration error', error);
      toast.error(error.message);
    }).then(user => {
      //something
    });
  }

  sendPassReset(email) {
    fbase.auth().sendPasswordResetEmail(email).catch((error) => {
      toast.error(error.message);
      this.resetPassError = error.message;
      this.stopResettingPassword();
    }).then(() => {
      toast.success(`Success! An email with instructions has been sent to ${email}.`);
      this.stopResettingPassword();
    });
  }

  updateUsername(username) {
    if (this.user === null) {
      return false;
    } else {
      send('username_set', {username});
    }
  }

  reloadUser() {
    return this.user.reload().then(() => {
      const user = fbase.auth().currentUser;
      this.user = user;
      return user;
    });
  }

  @observable resendVerificationResult = null;
  @observable resendVerificationLoading = false;

  resendVerification() {
    if (this.user) {
      this.resendVerificationLoading = true;
      this.user.sendEmailVerification().then(() => {
        this.resendVerificationResult = true;
        this.resendVerificationLoading = false;
      });
    }
  }
}
