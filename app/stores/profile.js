import { autorun, computed, makeAutoObservable, action } from "mobx";
import toast from "utils/toast";
import fbase from "libs/fbase";
import epoch from "utils/epoch";
import username from "libs/username";
import { send } from "libs/events";
import rank, { getSettingsForRank } from "libs/rank";
import disposable from "disposable-email";
// const startup = epoch();
import app from "stores/app";
import * as localforage from "localforage";

export default new (class Profile {

    resendVerificationResult = null;
    resendVerificationLoading = false;

    setResendVerificationLoading = action;
    setResendVerificationResult = action;

    user = null;
    setUser = action;
    username = undefined;
    setUsername = action;
    profile = null;
    setProfile = action;
    init = false;
    setInit = action;
  
    private = null;
    setPrivate = action;
    privateInit = false;
    setPrivateInit = action;
    hideBlazeBot = false;
    setHideBlazeBot = action;
    hypeBoom = true;
    setHypeBoom = action;
    desktopNotifications = false;
    setDesktopNotifications = action;
    rank = null;
    setRank = action;
    rankPermissions = {};
    setRankPermissions = action;
    registeredEpoch = null;
    setRegisteredEpoch = action;
    banData = null;
    setBanData = action;
    silenceData = null;
    setSilenceData = action;
  
    notifications = true;
    setNotifications = action;
    showmuted = false;
    setShowMuted = action;
  
    autoplay = false;
    setAutoPlay = action;
  
    lastchat = epoch();
    setLastChat = action;
@action setProfile = prop => this.profile = prop;
@action setPrivate = prop => this.private = prop;
@action setPrivateInit = prop => this.privateInit = prop;
@action setHideBlazeBot = prop => this.hideBlazeBot = prop;
@action setHypeBoom = prop => this.hypeBoom = prop;
@action setDesktopNotifications = prop => this.desktopNotifications = prop;
@action setRank = prop => this.rank = prop;
@action setRankPermissions = prop => this.rankPermissions = prop;
@action setRegisteredEpoch = prop => this.registeredEpoch = prop;
@action setBanData = prop => this.banData = prop;
@action setSilenceData = prop => this.silenceData = prop;
@action setNotifications = prop => this.notifications = prop;
@action setShowMuted = prop => this.showmuted = prop;
@action setAutoPlay = prop => this.autoplay = prop;
@action setLastChat = prop => this.setLastChat = prop;

@action setUser = prop => this.user = prop;
@action setUsername = prop => this.username = prop;
@action setProfile = prop => this.profile = prop;


@action setInit = prop => this.init = prop;
@action setResendVerificationResult = prop => this.setResendVerificationResult = prop;
@action setResendVerificationLoading = prop => this.setResendVerificationLoading = prop;


  constructor() {
      makeAutoObservable(this);
    this.init = false;
    fbase.auth().onAuthStateChanged((user) => {
      this.setUser(user);
      if (user !== null) {
        fbase
          .database()
          .ref()
          .child(".info/connected")
          .on("value", (snap) => {
            if (snap.val() === true) {
              fbase.auth().updateCurrentUser(fbase.auth().currentUser);
              clearInterval(this.presenceInterval); //stop any previous intervals
              this.presenceRef && this.presenceRef.remove(); //remove any previous presence nodes we still know about

              let presenceRef = fbase
                .database()
                .ref(`presence/${this.user.uid}`);
              let timestamp = epoch();
              this.presenceRef = presenceRef
                .child("connections")
                .push({ timestamp, uid: this.user.uid });

              this.presenceRef.onDisconnect().remove(); //I have a feeling this is causing some issues.

              window.onbeforeunload = function () {
                fbase.database().ref(`presence/${this.user.uid}`).remove();
              };

              this.presenceRef.child("connected").set(epoch());
              this.presenceInterval = setInterval(() => {
                this.presenceRef.child("timestamp").set(epoch());
              }, 10000);

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
        this.stopProfileSync = fbase
          .database()
          .ref("users")
          .child(user.uid)
          .on("value", (snap) => {
            this.setProfile(snap.val() || {});
          });

        send("hello");

        this.stopPrivateSync = fbase
          .database()
          .ref("private")
          .child(user.uid)
          .on("value", (snap) => {
            this.setPrivate(snap.val() || {});
            this.setPrivateInit(true);
          });

        this.stopRegistrationSync = fbase
          .database()
          .ref("registered")
          .child(user.uid)
          .on("value", (snap) => {
            this.setRegisteredEpoch(snap.val() || epoch());
          });

        this.stopBanSync = fbase
          .database()
          .ref("bans")
          .child(user.uid)
          .on("value", (snap) => (this.setBanData(snap.val())));

        this.stopSilenceSync = fbase
          .database()
          .ref("bans")
          .child(user.uid)
          .on("value", (snap) => (this.setSilenceData(snap.val())));
      } else {
        this.stopProfileSync && this.stopProfileSync();
        this.stopPrivateSync && this.stopPrivateSync();
        this.stopRegistrationSync && this.stopRegistrationSync();
        this.stopBanSync && this.stopBanSync();
        this.stopSilenceSync && this.stopSilenceSync();

      }

      //desktop notification check
      this.determineDesktopNotifications();
    });

    // self username handling
    autorun(() => {
      if (this.user) {
        username(this.user.uid).then((username) => {
          this.setUsername(username);
          this.setInit(true);
        });
      } else {
        this.setUsername(undefined);
      }
    });

    // permissions handling
    autorun(async () => {
      if (this.user) {
        this.setRank(await rank(this.user.uid));

        this.setRankPermissions(await getSettingsForRank(this.rank));
      } else {
        this.setRank(null);
        this.setRankPermissions({});
      }
    });
  }

  @computed get connected() {
    return app.connected;
  }

  @computed get canAutoplay() {
    return this.rank && this.rank !== "User";
  }

  determineDesktopNotifications() {
    localforage.getItem("desktopnotify").then((result) => {
      let userEnabled = result === 1;
      let notify = false;

      if (userEnabled && Notification.permission === "granted") {
        notify = true;
      } else if (userEnabled) {
        toast.error(
          "Desktop notifications need your permission. Please re-enable from the menu."
        );
      }

      localforage.setItem("desktopnotify", notify ? 1 : 0);
      this.setDesktopNotifications(notify);
    });
  }

  setDesktopNotifications(enabled) {
    this.setDesktopNotifications(enabled);
    localforage.setItem("desktopnotify", enabled ? 1 : 0);
  }

  // TODO can probably move these top functions to a lib
  login(email, password) {
    return fbase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => true)
      .catch((error) => {
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
            msg = `An unknown error occurred while trying to log you in :/`;
            break;
        }
        toast.error(msg);
        return false;
      });
  }

  logout() {
    return fbase.auth().signOut();
  }

  async register(email, password) {
    if (disposable.validate(email)) {
      fbase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .catch((error) => {
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
        .then((user) => {
          user.sendEmailVerification();
          setTimeout(() => {
            this.logout();
          }, 10000);
        });
    } else {
      toast.error(
        `You may not use "disposable" email addresses for TreesRadio`
      );
    }
  }

  sendPassReset(email) {
    return fbase
      .auth()
      .sendPasswordResetEmail(email)
      .catch((error) => {
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
        toast.success(
          `Success! An email with instructions has been sent to ${email}.`
        );
        return true;
      });
  }

  @computed get loggedIn() {
    return !!this.user;
  }

  @computed get uid() {
    if (!this.user) {
      return false;
    } else {
      return this.user.uid;
    }
  }

  @computed get unverified() {
    if (this.user && this.user.emailVerified) {
      return false;
    } else {
      return true;
    }
  }

  @computed get noName() {
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

  @computed get banned() {
    if (!this.banData) return false;
    if (this.banData.forever === true) return true;
    const now = Date.now() / 1000;
    return this.banData.time > now;
  }

  @computed get silenced() {
    if (!this.silenceData) return false;
    if (this.silenceData.forever === true) return true;
    const now = Date.now() / 1000;
    return this.silenceData.time > now;
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

  @computed get secondsRegistered() {
    return app.APP_EPOCH - this.registeredEpoch;
  }

  updateUsername(username) {
    if (this.user === null) {
      return false;
    } else {
      send("username_set", { username }).then(() => location.reload());
    }
  }

  resendVerification() {
    if (this.user) {
      this.setResendVerificationLoading(true);
      this.user.sendEmailVerification().then(() => {
        this.setResendVerificationResult(true);
        this.setResendVerificationLoading(false);
      });
    }
  }

  @computed get isAdmin() {
    return this.rankPermissions.admin === true;
  }

  setAvatar(url) {
    if (!url) {
      return false;
    }
    return fbase.database().ref("avatars").child(this.user.uid).set(url);
  }

  @computed get avatarURL() {
    return fbase.database().ref("avatars").child(this.user.uid).toString();
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
      .catch((e) => {
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
      .catch((e) => {
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
})();
