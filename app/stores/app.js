import {observable, computed} from 'mobx';
import axios from 'axios';
import fbase from 'libs/fbase';

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
  }

  @observable connected = false;
  @observable ipAddress = null;

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
