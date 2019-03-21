import {observable, asMap} from "mobx";
import fbase from "libs/fbase";
import moment from "moment";

// DEPRECATED, DO NOT USE. REMOVE IF NO LONGER USED.

export default new class Avatars {
  constructor() {}

  defaultAvatar(username) {
    return `//tr-avatars.herokuapp.com/avatars/50/${username}.png`;
  }

  @observable users = asMap({});
  @observable attemptedUsers = {};

  loadAvatar(username) {
    var defaultAvatar = this.defaultAvatar(username);
    if (!this.users.has(username)) {
      this.users.set(username, defaultAvatar);
    }
    var hasDefault = this.users.get(username) === defaultAvatar;

    var delay = hasDefault ? 15 : 30;

    var threshold = moment.unix().subtract(delay, "seconds");
    var hasNoAttempt = !this.attemptedUsers[username];
    var attemptBeforeThreshold = moment.unix(this.attemptedUsers[username]).isBefore(threshold);

    if (hasNoAttempt || attemptBeforeThreshold) {
      fbase
        .database()
        .ref("avatars")
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
      this.attemptedUsers[username] = moment.unix();
    }
  }
}();
