import fbase from "libs/fbase";
import { ref, get, onValue } from "firebase/database";

export default function getUsername(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve("BlazeBot");
  }
  const usernameRef = ref(fbase, `usernames/${uid}`);
  return get(usernameRef).then((snapshot) => snapshot.val());
}

export function listenUsername(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve("BlazeBot");
  }

  const usernameRef = ref(fbase, `usernames/${uid}`);
  return onValue(usernameRef);
}
