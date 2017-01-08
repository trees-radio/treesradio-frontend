import {observable, computed} from 'mobx';
import profile from 'stores/profile';
import socket from 'utils/socket';

export default new class App {
  constructor() {
    socket.on('connect', () => {
      this.socket = true;
    });
    socket.on('disconnect', () => {
      this.socket = false;
    });
  }

  @observable socket = false;

  @computed get init() {
    if (profile.connected) {
      return true;
    } else {
      return false;
    }
  }
}
