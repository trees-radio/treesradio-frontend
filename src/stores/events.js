// import { observable, computed, toJS } from 'mobx';
import {db} from "../libs/fbase";
import moment from "moment";
import mitt from "mitt";

import { ref, set, get, onValue } from "firebase/database"; // Added onValue

const emitter = mitt();
const events = {};

class Events {
  constructor() {
    this.startup = moment().unix();

    // Need to pass the database instance to ref
    const eventsRef = ref(db, "events");  // Changed this line
    onValue(eventsRef, snap => {
      var val = snap.val();
      if (val && val.timestamp > this.startup) {
        this.onEvent(val);
      }
    });
  }

  onEvent(evt) {
    emitter.emit(evt.type, evt);
  }

  register(type, handler) {
    if (!events[type]) { //prevent reregistering events after registering once.
      events[type] = true;
      emitter.on(type, handler);
      return () => emitter.off(handler);
    }
  }
}

// Create instance after class definition
export default new Events();