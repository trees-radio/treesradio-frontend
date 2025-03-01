import {getDatabaseRef} from "./fbase";
import { DataSnapshot } from "@firebase/database-types";


export function getFlair(uid: string) {
  if (uid === undefined || uid.length == 0) return false;

  return getDatabaseRef("flairs")
    .child(uid)
    .once("value")
    .then((snap: DataSnapshot) => snap.val());
}

export function getFlairColors(uid: string) {
  if (uid === undefined || uid.length == 0) return false;

  return getDatabaseRef("flair_colors")
    .child(uid)
    .once("value")
    .then((snap: DataSnapshot) => snap.val());
}

export function setFlairColors(uid: string, colors: { [key: string]: any }) {
  if (uid === undefined || uid.length == 0) return false;

  return getDatabaseRef("flair_colors")
    .child(uid)
    .set(colors);
}
