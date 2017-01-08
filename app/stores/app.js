import {observable, computed} from 'mobx';
import profile from 'stores/profile';
import socket from 'utils/socket';

export default new class App {
  constructor() {
    
  }

  @computed get init() {
    if (profile.connected) {
      return true;
    } else {
      return false;
    }
  }
}
