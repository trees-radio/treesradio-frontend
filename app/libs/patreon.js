import fbase from "libs/fbase";
import { ref, get } from "firebase/database";

export default function getPatreon(uid) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve(false);
  }
  const patreonRef = ref(fbase, `patreon/${uid}`);
  return get(patreonRef).then((snapshot) => snapshot.val());
}
