// import { observable, computed, toJS } from 'mobx';
import {db} from "../libs/fbase";
import moment from "moment";
import mitt, {Emitter, EventType, Handler} from "mitt";

import { ref, onValue } from "firebase/database"; // Added onValue
interface Event {
  type: string;
  timestamp: number;
}
const emitter = mitt();
const events: { [key: string]: boolean } = {};

class Events {
  startup: number;
  emitter: Emitter<Record<EventType, unknown>>;
  constructor() {
    this.startup = moment().unix();
    this.emitter = emitter;
    // Need to pass the database instance to ref
    const eventsRef = ref(db, "events");  // Changed this line
    onValue(eventsRef, snap => {
      var val = snap.val();
      if (val && val.timestamp > this.startup) {
        this.onEvent(val);
      }
    });
  }

  onEvent(evt: Event) {
    emitter.emit(evt.type, evt);
  }

  register(type: string, handler: Handler<unknown>) {
    if (!events[type]) { //prevent reregistering events after registering once.
      events[type] = true;
      this.emitter.on(type, handler);
      return () => emitter.off(type, handler);
    }
  }
}

// Create instance after class definition
export default new Events();