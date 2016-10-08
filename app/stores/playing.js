import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
// import profile from 'stores/profile';
import ax from 'utils/ax';
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
    info: {}
  };

  @computed get titleRepeat() {
    if (this.data.info.title) {
      var arr = [];
      for (var i = 0; i < 3; i++) {
        arr.push(this.data.info.title);
      }
      return arr.join(' --- ');
    } else {
      return false;
    }
  }


}
