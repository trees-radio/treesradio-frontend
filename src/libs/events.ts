import {getDatabaseRef} from "./fbase";
import profile from "../stores/profile";
import epoch from "../utils/epoch";

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
    updatePresence();
    return getDatabaseRef("event_bus")
      .child(profile.user.uid)
      .set(token);
    
    //{uid: profile.user.uid, type, data});
  } else {
    return Promise.reject("Not logged in");
  }
}

function updatePresence() {
  if (!profile.user) return;
  const userPresenceRef = getDatabaseRef("presence").child(profile.user.uid);
  
  userPresenceRef.child("timestamp").set(epoch());
}