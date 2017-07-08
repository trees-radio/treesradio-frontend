// import {observable, computed, toJS} from 'mobx';
import fbase from "libs/fbase";
import moment from "moment";
import mitt from "mitt";

const emitter = mitt();

export default new class Events {
  constructor() {
    this.startup = moment().unix();
    fbase.database().ref("events").on("child_added", snap => {
      var val = snap.val();
      if (val && val.timestamp > this.startup) {
        this.onEvent(val);
      }
    });
  }

  onEvent(evt) {
    emitter.emit(evt.type, evt);
    // if (!this.handlers[evt.type]) {
    //   return;
    // }
    // this.handlers[evt.type].forEach(handler => handler(evt));
  }

  register(type, handler) {
    emitter.on(type, handler);
    return () => emitter.off(handler);
    // if (!this.handlers[type]) {
    //   this.handlers[type] = [];
    // }
    // var index = this.handlers[type].push(handler) - 1;
    // return () => {
    //   this.handlers[type].splice(index, 1)
    // };
  }
}();
