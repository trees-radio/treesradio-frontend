import fbase from "./fbase";

export default function getPatreon(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve(false);
  }
  return fbase
    .database()
    .ref("patreon")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}
