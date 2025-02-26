import { computed, observable, action } from "mobx";
import axios from "axios";
import { db } from "../libs/fbase";
import epoch from "../utils/epoch";
import { ref, onValue } from "firebase/database";

class App {
  @observable accessor connected = false;
  @observable accessor proceed = false;
  @observable accessor ipAddress: string | null = null;
  @observable accessor APP_EPOCH = epoch();

  constructor() {
    // Bind methods explicitly
    this.getIP = this.getIP.bind(this);

    console.log("App store initializing...");

    // Initialize immediately
    this.getIP();

    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      console.log("Firebase connection state:", snap.val());
      this.setConnected(snap.val() === true);
      this.setProceed(snap.val() === true);
    });

    setInterval(() => {
      this.APP_EPOCH = epoch();
    }, 1000);

    // makeAutoObservable(this);
  }

  @computed get init() {
    console.log("Init check:", {
      connected: this.connected,
      ipAddress: this.ipAddress,
      proceed: this.proceed
    });
    return this.proceed || this.ipAddress !== null;
  }

  getIP() {
    return axios
      .get("https://api.ipify.org?format=json")
      .then((resp) => {
        console.log("IP fetch success:", resp.data);
        this.setIpAddress(resp.data.ip);
        this.setProceed(true);
      })
      .catch((error) => {
        console.error("IP fetch failed:", error);
        this.setIpAddress("localhost");
        this.setProceed(true);
      });
  }

  @action
  setProceed(value: boolean) {
    this.proceed = value;
  }

  @action
  setConnected(value: boolean) {
    this.connected = value;
  }

  @action
  setIpAddress(value: string) {
    this.ipAddress = value;
  }
}

// Create a single instance
const appStore = new App();

// Export the instance
export default appStore;