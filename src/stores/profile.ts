import { autorun, computed, observable, action } from "mobx";
import toast from "../utils/toast";
import { auth, db } from "../libs/fbase";
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
import epoch from "../utils/epoch";
import username from "../libs/username";
import { send } from "../libs/events";
import rank, { getSettingsForRank } from "../libs/rank";
import disposable from "disposable-email";
// const startup = epoch();
import app from "./app";
import * as localforage from "localforage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { User } from "@firebase/auth-types";

export interface Profile {
    setInit(val: boolean): void;
    setUser(user: string): void;
    setProfile(profile: any): void;
    setPresenceRef(ref: any): void;
    setPresenceInterval(interval: any): void;
    setIpRef(ref: any): void;
    setRankAndPermissions(rank: string, permissions: string[]): void;
    connected: boolean;
    user: string;
    username: string;
    profile: any;
    init: boolean;
    private: any;
    privateInit: boolean;
    hideBlazeBot: boolean;
    hypeBoom: boolean;
    desktopNotifications: boolean;
    rank: string;
    rankPermissions: any;
    registeredEpoch: number;
    banData: any;
    silenceData: any;
    notifications: boolean;
    showmuted: boolean;
    autoplay: boolean;
    lastchat: number;
    canAutoplay: boolean;
    loggedIn: boolean;
    uid: boolean;
    unverified: boolean;
    noName: boolean;
    banned: boolean;
    silenced: boolean;
    getToken(): any;
    safeUsername: string;   
    eventsPath: string;
    secondsRegistered: number;
    updateUsername(username: string): void;
    resendVerificationResult: any;
    resendVerificationLoading: boolean;
    resendVerification(): void;
    isAdmin: boolean;
    setAvatar(url: string): void;
    avatarURL: any;
    clearAvatar(): void;
    changePassword(password: string): any;
    changeEmail(email: string): any;
}

export default new (class Profile {
    @action
    setInit(val: boolean) {
        this.init = val;
    }

    @action
    stopProfileSync() {
        // Add logic to stop profile synchronization
    }

    @action
    setUser(user: User) {
        this.user = user;
    }

    @action
    setProfile(profile: any) {
        this.profile = profile;
    }

    @action
    setPresenceRef(ref: any) {
        this.presenceRef = ref;
    }

    @action
    setPresenceInterval(interval: Timer) {
        this.presenceInterval = interval;
    }

    @action
    setIpRef(ref: any) {
        this.ipRef = ref;
    }

    @action
    setRankAndPermissions(rank: string, permissions: any) {
        this.rank = rank;
        this.rankPermissions = permissions;
    }

    constructor() {
        this.setInit(false);
        auth.onAuthStateChanged(user => {
            if (user !== null) {
                this.setUser(user);
                const connectedRef = ref(db, ".info/connected");
                onValue(connectedRef, snap => {
                    if (snap.val() === true && this.presenceInterval) {
                        auth.updateCurrentUser(auth.currentUser);
                        clearInterval(this.presenceInterval as number);

                        // Create references
                        const userPresenceRef = ref(db, `presence/${this.user?.uid}`);
                        const connectionRef = push(child(userPresenceRef, "connections"));

                        // Save this for cleanup
                        this.setPresenceRef(connectionRef);

                        // Handle disconnect
                        onDisconnect(connectionRef).remove();

                        // Set initial data
                        set(connectionRef, {
                            timestamp: epoch(),
                            uid: this.user?.uid
                        });

                        // Set connected status
                        set(child(connectionRef, "connected"), epoch());

                        // Update timestamp periodically
                        const presenceInterval = setInterval(() => {
                            set(child(connectionRef, "timestamp"), epoch());
                        }, 10000);

                        this.setPresenceInterval(presenceInterval);

                        // Handle IP tracking
                        if (this.ipRef) {
                            remove(this.ipRef);
                        }

                        this.setIpRef(ref(db, `private/${this.user?.uid}/ip/${connectionRef.key}`));
                        set(this.ipRef, app.ipAddress);
                        onDisconnect(this.ipRef).remove();
                    }
                });
                onDisconnect(ref(db, `presence/${this.user?.uid}`)).remove();
                onValue(ref(db, `presence/${this.user?.uid}`), snap => {
                    if (snap.val() === null) {
                        this.setProfile(snap.val() || {});
                    };
                });

                send("hello");

            } else {
                this.stopProfileSync && this.stopProfileSync();

                clearInterval(this.presenceInterval as number);
            }

            //desktop notification check
            this.determineDesktopNotifications()
        });

        // self username handling
        autorun(() => {
            if (this.user) {
                const userStore = username(this.user.uid)
                if (userStore) 
                    userStore.then(username => {
                        this.username = username;
                        this.init = true;
                    });
            } else {
                this.username = undefined;
            }
        });

        // permissions handling
        autorun(async () => {
            if (this.user && this.rank) {
                this.setRankAndPermissions(await rank(this.user?.uid),await getSettingsForRank(this.rank));
            } else {
                this.setRankAndPermissions("", {});
            }
        });
    }

    @computed get connected() {
        return app.connected;
    }

    @observable accessor user: User | null = null;
    @observable accessor username: string | undefined = undefined;
    @observable accessor profile: any = null;
    @observable accessor init: boolean = false;

    @observable accessor private: any = null;
    @observable accessor privateInit: any = false;
    @observable accessor hideBlazeBot = false;
    @observable accessor hypeBoom = true;
    @observable accessor desktopNotifications = false;

    @observable accessor rank: string | null = null;
    @observable accessor rankPermissions: any = {};

    @observable accessor registeredEpoch: number | null = null;
    @observable accessor banData: any = null;
    @observable accessor silenceData: any = null;

    @observable accessor notifications = true;
    @observable accessor showmuted = false;

    @observable accessor autoplay = false;

    @observable accessor lastchat = epoch();
    @observable accessor presenceRef: any = null;
    @observable accessor presenceInterval: Timer | NodeJS.Timeout | string | number | undefined = undefined;
    @observable accessor ipRef: any = null;

    @computed get canAutoplay() {
        return this.rank && this.rank !== "User";
    }

    @action
    determineDesktopNotifications() {
        localforage.getItem("desktopnotify").then((result) => {
            let userEnabled = (result === 1);
            let notify = false;

            if (userEnabled && Notification.permission === "granted") {
                notify = true;
            } else if (userEnabled) {
                toast(
                    "Desktop notifications are enabled, but your browser has not granted permission to show them. Please enable notifications in your browser settings.",
                    { type: "error" });
            }

            localforage.setItem("desktopnotify", notify ? 1 : 0);
            this.desktopNotifications = notify;
        });
    }

    @action
    setDesktopNotifications(enabled: boolean) {
        this.desktopNotifications = enabled;
        localforage.setItem("desktopnotify", enabled ? 1 : 0);
    }

    // TODO can probably move these top functions to a lib
    login(email: string, password: string) {
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
                toast(msg, {
                    type: "error"
                });
                return false;
            });
    }

    logout() {
        return auth.signOut();
    }

    async register(email: string, password: string) {
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
                    toast(msg, { type: "error" });
                })
                .then(user => {
                    if (user) {
                        user.user?.sendEmailVerification();
                    }
                    setTimeout(() => {
                        this.logout();
                    }, 10000);
                });
        } else {
            toast(`You may not use "disposable" email addresses for TreesRadio`, {type: "error"});
        }
    }

    sendPassReset(email: string) {
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
                toast(msg, {type: "error"});
                return false;
            })
            .then(() => {
                toast(`Success! An email with instructions has been sent to ${email}.`,{type: "success"});
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
        return auth?.currentUser?.getIdToken(true); //returns promise with token
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
            return `user_events/${this.user?.uid}`;
        }
    }

    @computed get secondsRegistered() {
        return app.APP_EPOCH - (this.registeredEpoch || epoch());
    }

    updateUsername(username: string) {
        if (this.user !== null) {
            const sent = send("username_set", { username })
            if (sent) sent.then(() => location.reload());
        }
    }

    @observable accessor resendVerificationResult: boolean = false;
    @observable accessor resendVerificationLoading = false;

    @action
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

    setAvatar(url: string) {
        if (!url) {
            return false;
        }
        const avatar = ref(db, `avatars/${this.user?.uid}`);
        set(avatar, url);
    }

    @computed get avatarURL() {
        const avatar = ref(db, `avatars/${this.user?.uid}`);
        return get(avatar).then(snap => snap.val().toString());
    }

    clearAvatar() {
        const avatar = ref(db, `avatars/${this.user?.uid}`);
        return set(avatar, null);
    }

    changePassword(password: string) {
        if (!this.user) {
            return false;
        }
        return this.user
            .updatePassword(password)
            .then(() => {
                toast("Password updated successfully!", { type: "success" });
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
                toast(msg, { type: "error" });
                return false;
            });
    }

    changeEmail(email: string) {
        if (!this.user) {
            return false;
        }
        return this.user
            .updateEmail(email)
            .then(() => {
                toast("Email changed successfully!", { type: "success" });
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
                toast(msg, { type: "error" });
                return false;
            });
    }
})();
