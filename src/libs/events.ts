import {getDatabaseRef} from "./fbase";
import profile from "../stores/profile";

interface Token {
  uid: string;
  type: string;
  data: {};
}

export function send(type: string, data = {}) {
  if (profile.user !== null) {
    if (type == "chat" && profile.username == undefined) return false;
    let token: {[key: string]: Token} = {};
    token[profile.user.uid] = {uid: profile.user.uid, type, data};
    console.log(token);
    
    return getDatabaseRef("event_bus")
      .child(profile.user.uid)
      .set(token);
    //{uid: profile.user.uid, type, data});
  } else {
    return Promise.reject("Not logged in");
  }
}
