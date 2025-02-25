import {getDatabaseRef} from "./fbase";

export default function getPatreon(uid: string) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve(false);
  }
  return getDatabaseRef("patreon")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}
