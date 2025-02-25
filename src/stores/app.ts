import {computed, observable} from "mobx";
import axios from "axios";
import {db} from "../libs/fbase";
import epoch from "../utils/epoch";
import {ref, onValue} from "firebase/database";

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
      this.connected = snap.val() === true;
      this.proceed = snap.val() === true;
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
        this.ipAddress = resp.data.ip;
        this.proceed = true;
      })
      .catch((error) => {
        console.error("IP fetch failed:", error);
        this.ipAddress = "localhost";
        this.proceed = true;
      });
  }
}

// Create a single instance
const appStore = new App();

// Export the instance
export default appStore;