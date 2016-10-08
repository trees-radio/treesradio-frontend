import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import ax from 'utils/ax';


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

}
