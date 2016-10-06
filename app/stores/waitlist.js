import {observable, computed} from 'mobx';
import fbase from 'libs/fbase';
import ax from 'utils/ax';
import profile from 'stores/profile';
import toast from 'utils/toast';

export default new class Waitlist {
  constructor() {
    fbase.database().ref('waitlist').orderByKey().on('value', snap => {
      var list = [];
      snap.forEach(waiter => {
        var data = waiter.val();
        list.push(data);
      });
      this.list = list;
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
}
