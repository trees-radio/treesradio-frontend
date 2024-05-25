import fbase from "libs/fbase";
import { ref, set} from "firebase/database";
import profile from "stores/profile";

export function send(type, data = {}) {
  if (profile.user !== null) {
    if (type == "chat" && profile.username == undefined) return false;
    let token = {};
    token[profile.user.uid] = {uid: profile.user.uid, type, data};

    const eventBus = ref(fbase, `event_bus/${profile.user.uid}`);
    set(eventBus, token);
    //{uid: profile.user.uid, type, data});
  } else {
    return null;
  }
}
