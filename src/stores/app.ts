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
  
  // Store cleanup references
  private epochInterval: number | null = null;
  private connectedUnsubscribe: (() => void) | null = null;

  constructor() {
    // Bind methods explicitly
    this.getIP = this.getIP.bind(this);

    // Initialize immediately
    this.getIP();

    const connectedRef = ref(db, ".info/connected");
    this.connectedUnsubscribe = onValue(connectedRef, (snap) => {
      this.setConnected(snap.val() === true);
      this.setProceed(snap.val() === true);
    });

    this.epochInterval = Number(setInterval(() => {
      this.APP_EPOCH = epoch();
    }, 1000));

    // makeAutoObservable(this);
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.epochInterval) {
      clearInterval(this.epochInterval);
      this.epochInterval = null;
    }
    if (this.connectedUnsubscribe) {
      this.connectedUnsubscribe();
      this.connectedUnsubscribe = null;
    }
  }

  @computed get init() {
    return this.proceed || this.ipAddress !== null;
  }

  getIP() {
    return axios
      .get("https://api.ipify.org?format=json")
      .then((resp) => {
        this.setIpAddress(resp.data.ip);
        this.setProceed(true);
      })
      .catch((_error) => {
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