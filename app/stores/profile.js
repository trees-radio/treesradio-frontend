import {observable, computed, autorun} from "mobx";
import toast from "utils/toast";
import fbase from "libs/fbase";
import epoch from "utils/epoch";
import username from "libs/username";
import {send} from "libs/events";
import rank, {getSettingsForRank} from "libs/rank";
// const startup = epoch();
import app from "stores/app";

export default new class Profile {
  constructor() {
    fbase.auth().onAuthStateChanged(user => {
      this.user = user;
      if (user !== null) {
        this.stopProfileSync = fbase.database().ref("users").child(user.uid).on("value", snap => {
          var profile = snap.val() || {};
          this.profile = profile;
          this.init = true;

          send("hello");

          fbase.database().ref(".info/connected").on("value", snap => {
            if (snap.val() === true) {
              clearInterval(this.presenceInterval); //stop any previous intervals
              this.presenceRef && this.presenceRef.remove(); //remove any previous presence nodes we still know about

              let presenceRef = fbase.database().ref(`presence/${user.uid}`);
              let timestamp = epoch();
              this.presenceRef = presenceRef.child("connections").push({timestamp, uid: user.uid});

              this.presenceRef.onDisconnect().remove();
              this.presenceInterval = setInterval(
                () => this.presenceRef.child("timestamp").set(epoch()),
                10000
              );

              this.ipRef && this.ipRef.remove();
              this.ipRef = fbase
                .database()
                .ref("private")
                .child(user.uid)
                .child("ip")
                .child(this.presenceRef.key);
              
              this.ipRef.set(app.ipAddress);
              this.ipRef.onDisconnect().remove();
            }
          });
        });

        this.stopPrivateSync = fbase.database().ref("private").child(user.uid).on("value", snap => {
          var priv = snap.val() || {};
          this.private = priv;
          this.privateInit = true;
        });

        this.stopRegistrationSync = fbase
          .database()
          .ref("registered")
          .child(user.uid)
          .on("value", snap => {
            this.registeredEpoch = snap.val() || epoch();
          });

        this.stopBanSync = fbase
          .database()
          .ref("bans")
          .child(user.uid)
          .on("value", snap => (this.banData = snap.val()));

        this.stopSilenceSync = fbase
          .database()
          .ref("bans")
          .child(user.uid)
          .on("value", snap => (this.silenceData = snap.val()));
      } else {
        this.stopProfileSync && this.stopProfileSync();
        this.stopPrivateSync && this.stopPrivateSync();
        this.stopRegistrationSync && this.stopRegistrationSync();
        this.stopBanSync && this.stopBanSync();
        this.stopSilenceSync && this.stopSilenceSync();

        clearInterval(this.presenceInterval);
      }
    });

    // self username handling
    autorun(() => {
      if (this.user) {
        username(this.user.uid).then(username => (this.username = username));
      } else {
        this.username = undefined;
      }
    });

    // permissions handling
    autorun(async () => {
      if (this.user) {
        this.rank = await rank(this.user.uid);

        this.rankPermissions = await getSettingsForRank(this.rank);
      } else {
        this.rank = null;
        this.rankPermissions = {};
      }
    });
  }

  @computed
  get connected() {
    return app.connected;
  }

  @observable user = null;
  @observable username = undefined;
  @observable profile = null;
  @observable init = false;

  @observable private = null;
  @observable privateInit = false;

  @observable rank = null;
  @observable rankPermissions = {};

  @observable registeredEpoch = null;
  @observable banData = null;
  @observable silenceData = null;

  @observable notifications = true;
  @observable showmuted = false;

  // TODO can probably move these top functions to a lib
  login(email, password) {
    fbase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => {
        // Convert old profile into new datastore.
        let oldranks = [
            'User',
            'Mod',
            'Senior Mod',
            'Dev',
            'Admin'
        ];
        fbase.database.ref('moderator').child(user.uid).on(
          'value',
          snap => {
            fbase.database.ref('ranks').child(user.uid).set(oldranks[snap.val()]);
            snap.remove();
          } 
        );
        fbase.database.ref('users').child(user.uid).on(
          "value",
          snap => {
            fbase.database.ref('usernames').child(user.uid).set(
              snap.val().username
            );
            fbase.database.ref('avatar').child(user.uid).set(
              snap.val().avatar
            );
            snap.remove();
          }
        );
        
      })
      .catch(error => {
        let msg = `Unknown error: ${error.code}`;
        switch (error.code) {
          case "auth/email-already-in-use":
            msg = `An account already exists with the email address ${email}`;
            break;
          case "auth/invalid-email":
            msg = `You entered an invalid email address.`;
            break;
          case "auth/operation-not-allowed":
            msg = `Registration is currently disabled.`;
            break;
          case "auth/weak-password":
            msg = `Your chosen password is too weak. Please use a stronger password`;
            break;
          case undefined:
            return;
        }
        toast.error(msg);
      });
  }

  logout() {
    return fbase.auth().signOut();
  }

  register(email, password) {
    fbase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(error => {
        let msg = `Unknown error: ${error.code}`;
        switch (error.code) {
          case "auth/invalid-email":
            msg = `You entered an invalid email address.`;
            break;
          case "auth/user-disabled":
            msg = `That user account is disabled.`;
            break;
          case "auth/user-not-found":
            msg = `No user account found for this login`;
            break;
          case "auth/wrong-password":
            msg = `That's the wrong password for that account!`;
            break;
          case undefined:
          return;
        }
        toast.error(msg);
      })
      .then(user => {
        user.sendEmailVerification();
      });
  }

  sendPassReset(email) {
    return fbase
      .auth()
      .sendPasswordResetEmail(email)
      .catch(error => {
        let msg = `Unknown error: ${error.code}`;
        switch (error.message) {
          case "auth/invalid-email":
            msg = `You entered an invalid email address.`;
            break;
          case "auth/user-not-found":
            msg = `No user account found for this login.`;
            break;
          case undefined:
            return;
        }
        toast.error(msg);
        return false;
      })
      .then(() => {
        toast.success(`Success! An email with instructions has been sent to ${email}.`);
        return true;
      });
  }

  @computed
  get loggedIn() {
    return !!this.user;
  }

  @computed
  get uid() {
    if (!this.user) {
      return false;
    } else {
      return this.user.uid;
    }
  }

  @computed
  get unverified() {
    if (this.user && this.user.emailVerified) {
      return false;
    } else {
      return true;
    }
  }

  @computed
  get noName() {
    if (this.user !== null && this.init === true) {
      const noLegacyUsername = this.profile === null || !this.profile.username;
      const noUsername = !this.username;

      if (noLegacyUsername && noUsername) {
        return true;
      } else if (!noLegacyUsername && noUsername) {
        const legacyUsername = this.profile.username;
        this.updateUsername(legacyUsername);
      }

      return false;
    }
    // profile isn't initialized yet. Fixes #644
    return false;
  }

  @computed
  get banned() {
    if (!this.banData) return false;
    if (this.banData.forever === true) return true;
    const now = Date.now() / 1000;
    if (this.banData.time > now) return true;
    return false;
  }

  @computed
  get silenced() {
    if (!this.silenceData) return false;
    if (this.silenceData.forever === true) return true;
    const now = Date.now() / 1000;
    if (this.silenceData.time > now) return true;
    return false;
  }

  getToken() {
    return fbase.auth().currentUser.getToken(true); //returns promise with token
  }

  @computed
  get safeUsername() {
    if (this.user === null) {
      return undefined;
    } else {
      return this.username;
    }
  }

  @computed
  get eventsPath() {
    if (this.profile === null) {
      return false;
    } else {
      return `user_events/${this.user.uid}`;
    }
  }

  @computed
  get secondsRegistered() {
    return app.APP_EPOCH - this.registeredEpoch;
  }

  updateUsername(username) {
    if (this.user === null) {
      return false;
    } else {
      send("username_set", {username}).then(() => location.reload());
    }
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

  @computed
  get isAdmin() {
    return this.rankPermissions.admin === true;
  }

  setAvatar(url) {
    if (!url) {
      return false;
    }
    return fbase.database().ref("avatars").child(this.user.uid).set(url);
  }

  clearAvatar() {
    return fbase.database().ref("avatars").child(this.uid).remove();
  }

  changePassword(password) {
    return this.user
      .updatePassword(password)
      .then(() => {
        toast.success("Password updated successfully!");
        return true;
      })
      .catch(e => {
        let msg = `Unknown error: ${e.code}`;
        switch (e.code) {
          case "weak-password":
            msg = `That password is too weak!`;
            break;
          case "auth/requires-recent-login":
            msg = `Changing your password requires a recent login, log out and log back in before trying again.`;
            break;
        }
        toast.error(msg);
        return false;
      });
  }

  changeEmail(email) {
    return this.user
      .updateEmail(email)
      .then(() => {
        toast.success("Email changed successfully!");
        return true;
      })
      .catch(e => {
        let msg = `Unknown error: ${e.code}`;
        switch (e.code) {
          case "auth/invalid-email":
            msg = `You entered an invalid email address.`;
            break;
          case "auth/email-already-in-use":
            msg = `${email} is already in use by another account.`;
            break;
          case "auth/requires-recent-login":
            msg = `Changing your email requires a recent login, log out and log back in before trying again.`;
            break;
          case undefined:
            return;
        }
        toast.error(msg);
        return false;
      });
  }
}();
