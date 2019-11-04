import fbase from "libs/fbase";

export default function getFlair(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve("Bot");
  }
  return fbase
    .database()
    .ref("flairs")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

