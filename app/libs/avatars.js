import {observable, computed} from 'mobx';
import fbase from 'libs/fbase';
import moment from 'moment';

export default new class Avatars {
  constructor() {

  }

  defaultAvatar(username) {
    return `//tr-avatars.herokuapp.com/avatars/50/${username}.png`;
  }

  @observable users = {};
  @observable attemptedUsers = {};

  loadAvatar(username) {
    var defaultAvatar = this.defaultAvatar(username);
    if (!this.users[username]) {
      this.users[username] = defaultAvatar;
    }
    var hasDefault = this.users[username] === defaultAvatar;

    if (hasDefault) {
      var threshold = moment.unix().subtract(1, 'minutes');
      var hasNoAttempt = !this.attemptedUsers[username];
      var attemptBeforeThreshold = moment.unix(this.attemptedUsers[username]).isBefore(threshold);

      if (hasNoAttempt || attemptBeforeThreshold) {
        fbase.database().ref('avatars').child(username).once('value', (snap) => {
          var avatar = snap.val();
          // console.log('avatar', avatar);
          if (avatar) {
            var image = new Image();
            image.onload = () => {
              // console.log('avatar chosen');
              this.users[username] = avatar;
            }
            image.onerror = (e) => {
              // console.log('avatar error', e);
              this.error = true;
            }
            image.src = avatar;
          }
        });
        this.attemptedUsers[username] = moment.unix();
      }
    }
  }



}
