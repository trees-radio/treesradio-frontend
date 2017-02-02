import {observable, computed} from 'mobx';
import axios from 'axios';
import fbase from 'libs/fbase';
import epoch from 'utils/epoch';

export default new class App {
  constructor() {
    this.getIP();
    fbase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        this.connected = true;
      } else {
        this.connected = false;
      }
    });

    setInterval(() => this.APP_EPOCH = epoch(), 1000); //keep time
  }

  @observable connected = false;
  @observable ipAddress = null;
  @observable APP_EPOCH = epoch();

  @computed get init() {
    if (this.connected && this.ipAddress !== null) {
      return true;
    } else {
      return false;
    }
  }

  getIP() {
    return axios.get('https://api.ipify.org?format=json')
      .then(resp => this.ipAddress = resp.data.ip || 'err')
      .catch(() => this.ipAddress = 'err');
  }
}
