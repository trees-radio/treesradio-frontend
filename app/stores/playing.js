import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import ax from 'utils/ax';
import moment from 'moment';
import _ from 'lodash';

const PLAYER_SYNC_CAP = 20; //seconds on end of video to ignore syncing
const PLAYER_SYNC_SENSITIVITY = 30; //seconds

export default new class Playing {
  constructor() {
    this.fbase = fbase;
    fbase.database().ref('playing').on('value', (snap) => {
      var data = snap.val();
      if (data) {
        this.data = data;
      }
    });
  }

  @observable data = {
    info: {},
    feedback: {},
    feedback_users: {
      likes: [],
      dislikes: [],
      grabs: []
    }
  };

  @computed get liked() {
    if (!this.data.feedback_users || !this.data.feedback_users.likes || !profile.user) {
      return false;
    }
    if (this.data.feedback_users.likes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get disliked() {
    if (!this.data.feedback_users || !this.data.feedback_users.dislikes || !profile.user) {
      return false;
    }
    if (this.data.feedback_users.dislikes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get grabbed() {
    if (!this.data.feedback_users || !this.data.feedback_users.grabs || !profile.user) {
      return false;
    }
    if (this.data.feedback_users.grabs.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get humanDuration() {
    var mo = moment.duration(this.data.info.duration, 'milliseconds');
    var str = `${_.padStart(mo.minutes(), 2, '0')}:${_.padStart(mo.seconds(), 2, '0')}`;
    if (mo.hours() > 0) {
      str = `${_.padStart(mo.hours(), 2, '0')}:`+str;
    }
    return str;
  }

  @computed get humanCurrent() {
    var mo = moment.duration(this.playerSeconds, 'seconds');
    var str = `${_.padStart(mo.minutes(), 2, '0')}:${_.padStart(mo.seconds(), 2, '0')}`;
    if (mo.hours() > 0) {
      str = `${_.padStart(mo.hours(), 2, '0')}:`+str;
    }
    return str;
  }

  @computed get elapsed() {
    if (!this.data.time || !this.data.info.duration || !this.data.playing) {
      return 0;
    }
    return this.data.info.duration - this.data.time;
  }

  @computed get fraction() {
    if (!this.data.time || !this.data.info.duration) {
      return 0;
    }
    return this.elapsed / this.data.info.duration;
  }

  @observable playerProgress = 0; //fraction (0.12, 0.57, etc.)

  @observable playerDuration = 0; //seconds

  @computed get playerSeconds() {
    return this.playerDuration * this.playerProgress;
  }

  @computed get shouldSync() {
    if (!this.data.time || !this.data.info.duration || !this.data.playing) {
      return false;
    }
    var serverSeconds = this.elapsed / 1000;
    var durationSeconds = this.data.info.duration / 1000;
    var cap = durationSeconds - PLAYER_SYNC_CAP;
    if (serverSeconds > cap) {
      return false;
    }
    var slow = serverSeconds - 30;
    var fast = serverSeconds + 30;
    var player = this.playerSeconds;
    console.log('player', this.playerSeconds, 'server', serverSeconds);
    if (player < slow || player > fast) {
      return true;
    }
  }
}
