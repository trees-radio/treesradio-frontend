import fbase from "./fbase";

export default function getUsername(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve("BlazeBot");
  }
  return fbase
    .database()
    .ref("usernames")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

export function listenUsername(uid) {
  return fbase
    .database()
    .ref("usernames")
    .child(uid)
    .on("value");
}
