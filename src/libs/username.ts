import {getDatabaseRef} from "./fbase";

export default function getUsername(uid: string) {
  if (uid === undefined || uid.length == 0) return false;
  if (uid === "BLAZEBOT") {
    return Promise.resolve("BlazeBot");
  }
  return getDatabaseRef("usernames")
    .child(uid)
    .once("value")
    .then(snap => snap.val());
}

export function listenUsername(uid: string) {
  return getDatabaseRef("usernames")
    .child(uid)
    .on("value" as any, snap => snap.val());
}
