import {computed, observable} from "mobx";
import axios from "axios";
import fbase from "libs/fbase";
import epoch from "utils/epoch";

export default new (class App {
  constructor() {
    this.getIP();
    fbase
      .database()
      .ref(".info/connected")
      .on("value", snap => {
        this.connected = snap.val() === true;
      });

    setInterval(() => (this.APP_EPOCH = epoch()), 1000); //keep time
    setTimeout(() => {
      this.proceed = true;
    }, 2500);
  }

  @observable connected = false;
  @observable proceed = false;
  @observable ipAddress = null;
  @observable APP_EPOCH = epoch();

  @computed get init() {
    return this.connected && this.ipAddress !== null && this.proceed;
  }

  getIP() {
    return axios
      .get("https://pineapple.treesradio.com/frob")
      .then(resp => (this.ipAddress = resp.data.ip || "err"))
      .catch(() => (this.ipAddress = "err"));
  }
})();
