import fbase from "libs/fbase";

export function getFlair(uid) {
  if (uid === undefined || uid.length == 0) return false;
  return fbase
    .database()
    .ref("flairs")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

export function getFlairColors(uid) {
  if (uid === undefined || uid.length == 0) return false;
  return fbase
    .database()
    .ref("flair_colors")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

export function setFlairColors(uid, colors) {
  return fbase
    .database()
    .ref("flair_colors")
    .child(uid)
    .set(colors);
}
