import moment from "moment";
import mitt, { Emitter, EventType, Handler } from "mitt";
import { getDatabaseRef } from "../libs/fbase";
import epoch from "../utils/epoch";
interface Event {
  type: string;
  timestamp: number;
}
const emitter = mitt();
const events: { [key: string]: boolean } = {};

class Events {
  startup: number = epoch();
  emitter: Emitter<Record<EventType, unknown>>;
  constructor() {
    this.startup = moment().unix();
    this.emitter = emitter;
    getDatabaseRef("events").on("value", snap => {
      var val = snap.val();
      if (val)
        Object.keys(val).forEach(key => {
          console.log(key);
          console.log(`Event: ${val[key].type}`);
          if (val[key] && val[key].timestamp > this.startup) {
            console.log("Event: ", val);
            this.onEvent(val[key]);
          }
        }
        );
    });
  }

  onEvent(evt: Event) {
    emitter.emit(evt.type, evt);
  }

  register(type: string, handler: Handler<unknown>) {
    if (!events[type]) { //prevent reregistering events after registering once.
      events[type] = true;
      this.emitter.on(type, handler);
      console.trace(`Registered event: ${type}`);
      return () => emitter.off(type, handler);
    }
  }

  unregister(type: string, handler: Handler<unknown>) {
    this.emitter.off(type, handler);
  }
}

// Create instance after class definition
export default new Events();