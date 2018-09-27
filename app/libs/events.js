import fbase from "libs/fbase";
import profile from "stores/profile";

export function send(type, data = {}) {
  if (profile.user !== null) {
    if (type == "chat" && profile.username == undefined) return false;
    let token = {};
    token[profile.user.uid] = {uid: profile.user.uid, type, data};

    return fbase
      .database()
      .ref("event_bus")
      .child(profile.user.uid)
      .set(token);
    //{uid: profile.user.uid, type, data});
  } else {
    return null;
  }
}
