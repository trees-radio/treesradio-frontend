import fbase from "libs/fbase";
import { ref, set, get } from "firebase/database";

export function getFlair(uid) {
  if (uid === undefined || uid.length == 0) return false;

  const flairRef = ref(fbase, `flairs/${uid}`);
  return get(flairRef).then((snapshot) => snapshot.val());
}

export function getFlairColors(uid) {
  if (uid === undefined || uid.length == 0) return false;
  const flairRef = ref(fbase, `flair_colors/${uid}`);
  return get(flairRef).then((snapshot) => snapshot.val());
}

export function setFlairColors(uid, colors) {
  if (uid === undefined || uid.length == 0) return false;
  const flairRef = ref(fbase, `flair_colors/${uid}`);
  return set(flairRef, colors);
}
