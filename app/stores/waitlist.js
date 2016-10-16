import {observable, computed} from 'mobx';
import fbase from 'libs/fbase';
import ax from 'utils/ax';
import profile from 'stores/profile';
import toast from 'utils/toast';
import playing from 'stores/playing';
import chat from 'stores/chat';

export default new class Waitlist {
  constructor() {
    fbase.database().ref('waitlist').orderByKey().on('value', (snap) => {
      var list = [];
      snap.forEach(user => {
        var data = user.val();
        list.push(data);
      });
      this.list = list;
      // console.log('waitlist', list);
    });
  }

  @observable list = [];

  join() {
    if (!profile.user) {
      toast.error("You must be logged in to join the waitlist!");
      return;
    }
    ax.post('/waitlist/join').then(resp => {
      if (resp.data.success === true) {
        toast.success("You have joined the waitlist.");
      } else if (resp.data.error) {
        toast.error(resp.data.error);
      }
    });
  }

  @observable bigButtonLoading = false;

  bigButton() {
    this.bigButtonLoading = true;
    if (!profile.user) {
      toast.error("You must be logged in to push the big button!");
      return;
    }
    if (this.isPlaying) {
      chat.sendMsg('/skip', () => this.bigButtonLoading = false);
    } else if (this.inWaitlist) {
      ax.post('/waitlist/leave').then(resp => {
        if (resp.data.success === true) {
          toast.success("You have joined the waitlist.");
        } else if (resp.data.error) {
          toast.error(resp.data.error);
        }
        this.bigButtonLoading = false;
      });
    } else {
      ax.post('/waitlist/join').then(resp => {
        if (resp.data.success === true) {
          toast.success("You have joined the waitlist.");
        } else if (resp.data.error) {
          toast.error(resp.data.error);
        }
        this.bigButtonLoading = false;
      });
    }
  }

  @computed get inWaitlist() {
    if (!profile.user) {
      return false;
    }
    if (this.isPlaying) {
      return true;
    }
    return this.list.some(w => w.uid == profile.user.uid);
  }

  @computed get isPlaying() {
    if (playing.data.playing && playing.data.info.user === profile.safeUsername) {
      return true;
    }
  }
}
