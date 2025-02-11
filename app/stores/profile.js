import { autorun, computed, observable } from "mobx";
import toast from "utils/toast";
import fbase, {auth} from "libs/fbase";
import { 
    ref, 
    onValue, 
    set, 
    remove, 
    push, 
    child,
    get,
    onDisconnect,
} from "firebase/database";
import epoch from "utils/epoch";
import username from "libs/username";
import { send } from "libs/events";
import rank, { getSettingsForRank } from "libs/rank";
import disposable from "disposable-email";
// const startup = epoch();
import app from "stores/app";
import * as localforage from "localforage";
import { signInWithEmailAndPassword } from "firebase/auth";

export default new (class Profile {
    constructor() {
        this.init = false;
       auth.onAuthStateChanged(user => {
            this.user = user;
            if (user !== null) {
                const connectedRef = ref(fbase, ".info/connected");
                onValue(connectedRef, snap => {
                    if (snap.val() === true) {
                        auth.updateCurrentUser(auth.currentUser);
                        clearInterval(this.presenceInterval);
                        
                        // Create references
                        const userPresenceRef = ref(fbase, `presence/${this.user.uid}`);
                        const connectionRef = push(child(userPresenceRef, "connections"));
                        
                        // Save this for cleanup
                        this.presenceRef = connectionRef;
                        
                        // Handle disconnect
                        onDisconnect(connectionRef).remove();
                        
                        // Set initial data
                        set(connectionRef, {
                            timestamp: epoch(),
                            uid: this.user.uid
                        });
                        
                        // Set connected status
                        set(child(connectionRef, "connected"), epoch());
                        
                        // Update timestamp periodically
                        this.presenceInterval = setInterval(() => {
                            set(child(connectionRef, "timestamp"), epoch());
                        }, 10000);
                        
                        // Handle IP tracking
                        if (this.ipRef) {
                            remove(this.ipRef);
                        }
                        
                        this.ipRef = ref(fbase, `private/${this.user.uid}/ip/${connectionRef.key}`);
                        set(this.ipRef, app.ipAddress);
                        onDisconnect(this.ipRef).remove();
                    }
                });
                onDisconnect(ref(fbase, `presence/${this.user.uid}`)).remove();
                onValue(ref(fbase, `presence/${this.user.uid}`), snap => {
                    if (snap.val() === null) {
                        this.profile = snap.val() || {};
                    };
                });

                send("hello");

                // this.stopPrivateSync = fbase

                //     .ref("private")
                //     .child(user.uid)
                //     .on("value", snap => {
                //         this.private = snap.val() || {};
                //         this.privateInit = true;
                //     });

                // this.stopRegistrationSync = fbase

                //     .ref("registered")
                //     .child(user.uid)
                //     .on("value", snap => {
                //         this.registeredEpoch = snap.val() || epoch();
                //     });

                // this.stopBanSync = fbase

                //     .ref("bans")
                //     .child(user.uid)
                //     .on("value", snap => (this.banData = snap.val()));

                // this.stopSilenceSync = fbase

                //     .ref("bans")
                //     .child(user.uid)
                //     .on("value", snap => (this.silenceData = snap.val()));
            } else {
                this.stopProfileSync && this.stopProfileSync();
                this.stopPrivateSync && this.stopPrivateSync();
                this.stopRegistrationSync && this.stopRegistrationSync();
                this.stopBanSync && this.stopBanSync();
                this.stopSilenceSync && this.stopSilenceSync();

                clearInterval(this.presenceInterval);
            }

            //desktop notification check
            this.determineDesktopNotifications()
        });

        // self username handling
        autorun(() => {
            if (this.user) {
                username(this.user.uid).then(username => {
                    this.username = username;
                    this.init = true;
                });
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

    @computed get connected() {
        return app.connected;
    }

    @observable user = null;
    @observable username = undefined;
    @observable profile = null;
    @observable init = false;

    @observable private = null;
    @observable privateInit = false;
    @observable hideBlazeBot = false;
    @observable hypeBoom = true;
    @observable desktopNotifications = false;

    @observable rank = null;
    @observable rankPermissions = {};

    @observable registeredEpoch = null;
    @observable banData = null;
    @observable silenceData = null;

    @observable notifications = true;
    @observable showmuted = false;

    @observable autoplay = false;

    @observable lastchat = epoch();

    @computed get canAutoplay() {
        return this.rank && this.rank !== "User";
    }

    determineDesktopNotifications() {
        localforage.getItem("desktopnotify").then((result) => {
            let userEnabled = (result === 1);
            let notify = false;

            if (userEnabled && Notification.permission === "granted") {
                notify = true;
            } else if (userEnabled) {
                toast.error("Desktop notifications need your permission. Please re-enable from the menu.");
            }

            localforage.setItem("desktopnotify", notify ? 1 : 0);
            this.desktopNotifications = notify;
        });
    }

    setDesktopNotifications(enabled) {
        this.desktopNotifications = enabled;
        localforage.setItem("desktopnotify", enabled ? 1 : 0);
    }

    // TODO can probably move these top functions to a lib
    login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
            .then(() => true)
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
                        msg = `An unknown error occurred while trying to log you in :/`;
                        break;
                }
                toast.error(msg);
                return false;
            });
    }

    logout() {
        return auth.signOut();
    }

    async register(email, password) {
        if (disposable.validate(email)) {
            auth
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
                    setTimeout(() => {
                        this.logout();
                    }, 10000);
                });
        } else {
            toast.error(`You may not use "disposable" email addresses for TreesRadio`);
        }
    }

    sendPassReset(email) {
        return auth
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
        return auth.currentUser.getToken(true); //returns promise with token
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

    @computed get isAdmin() {
        return this.rankPermissions.admin === true;
    }

    setAvatar(url) {
        if (!url) {
            return false;
        }
        const avatar = ref(fbase, `avatars/${this.user.uid}`);
        set(avatar, url);
    }

    @computed get avatarURL() {
        const avatar = ref(fbase, `avatars/${this.user.uid}`);
        return  get(avatar).then(snap => snap.val().toString());
    }

    clearAvatar() {
        const avatar = ref(fbase, `avatars/${this.user.uid}`);
        return set(avatar, null);
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
})();
