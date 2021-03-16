import {computed, makeObservable, action, observable} from "mobx";
import axios from "axios";
import fbase from "libs/fbase";
import epoch from "utils/epoch";

export default new (class App {
  proceed = false;
  ipAddress = null;
  APP_EPOCH = epoch();
  connected = false;

  constructor() {

    this.getIP();
    makeObservable( this, {
      proceed: observable,
      ipAddress: observable,
      APP_EPOCH: observable,
      connected: observable,
      isConnected: action,
      canProceed: action,
      setIpAddress: action
    } );
    fbase
      .database()
      .ref(".info/connected")
      .on("value", snap => {
        let connected = snap.val();
        if ( connected ) {
          this.isConnected();
          this.canProceed();
        }
      });

    setInterval(() => (this.APP_EPOCH = epoch()), 1000); //keep time
  }

  @computed get init() {
    return this.connected && this.ipAddress !== null && this.proceed;
  }

  async getIP() {
    return await axios
      .get("https://pineapple.treesradio.com/frob")
      .then(resp => (this.setIpAddress(resp.data.ip || "err")))
      .catch(() => (this.setIpAddress("err")));
  }

  isConnected() {
    this.connected = true;
  }

  canProceed() {
    this.proceed = true;
  }

  setIpAddress(address) {
    this.ipAddress = address;
  }
})();
