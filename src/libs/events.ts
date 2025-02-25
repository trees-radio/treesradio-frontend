import {getDatabaseRef} from "./fbase";
import profile from "../stores/profile";

export function send(type: string, data = {}) {
  if (profile.user !== null) {
    if (type == "chat" && profile.username == undefined) return false;
    let token = {};
    token[profile.user.uid] = {uid: profile.user.uid, type, data};

    return getDatabaseRef("events")
      .child(profile.user.uid)
      .set(token);
    //{uid: profile.user.uid, type, data});
  } else {
    return Promise.reject("Not logged in");
  }
}
