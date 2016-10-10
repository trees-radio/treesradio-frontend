import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import ax from 'utils/ax';
import moment from 'moment';
import _ from 'lodash';


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
    if (!this.data.feedback_users || !this.data.feedback_users.likes) {
      return false;
    }
    if (this.data.feedback_users.likes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get disliked() {
    if (!this.data.feedback_users || !this.data.feedback_users.dislikes) {
      return false;
    }
    if (this.data.feedback_users.dislikes.includes(profile.user.uid)) {
      return true;
    } else {
      return false;
    }
  }

  @computed get grabbed() {
    if (!this.data.feedback_users || !this.data.feedback_users.grabs) {
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

}
