import {observable} from "mobx";
import {getDatabaseRef} from "./fbase";
import moment from "moment";

// DEPRECATED, DO NOT USE. REMOVE IF NO LONGER USED.

export default new (class Avatars {
  error = false;
  errorMsg: string | Event = "";

  constructor() {}

  defaultAvatar(username: string) {
    return `//tr-avatars.herokuapp.com/avatars/50/${username}.png`;
  }

  @observable accessor users = new Map<string, string>();
  @observable accessor attemptedUsers: {[key: string]: any} = {};

  loadAvatar(username: string) {
    var defaultAvatar = this.defaultAvatar(username);
    if (!this.users.has(username)) {
      this.users.set(username, defaultAvatar);
    }
    var hasDefault = this.users.get(username) === defaultAvatar;

    var delay = hasDefault ? 15 : 30;

    var threshold = moment.unix(Date.now() / 1000).subtract(delay, "seconds");
    var hasNoAttempt = !this.attemptedUsers[username];
    var attemptBeforeThreshold = moment.unix(this.attemptedUsers[username]).isBefore(threshold);

    if (hasNoAttempt || attemptBeforeThreshold) {
      getDatabaseRef("avatars")
        .child(username)
        .once("value", snap => {
          var avatar = snap.val();
          if (avatar) {
            var image = new Image();
            image.onload = () => {
              this.users.set(username, avatar);
            };
            image.onerror = e => {
              this.error = true;
              this.errorMsg = e;
            };
            image.src = avatar;
          }
        });
      this.attemptedUsers[username] = moment.unix(Date.now()/1000);
    }
  }
})();
