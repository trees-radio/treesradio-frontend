// import {observable, computed, toJS} from 'mobx';
import fbase from "libs/fbase";
import moment from "moment";
import mitt from "mitt";

const emitter = mitt();
const events = {};

export default new (class Events {
  constructor() {
    this.startup = moment().unix();
    fbase
      .database()
      .ref("events")
      .on("child_added", snap => {
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
    if ( !events[type]) { //prevent reregistering events after regustering once.
      events[type] = true;
    emitter.on(type, handler);
    return () => emitter.off(handler);
    }
  }
})();
