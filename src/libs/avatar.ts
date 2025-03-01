import {getDatabaseRef} from "./fbase";
import getUsername from "./username";
import { DataSnapshot } from '@firebase/database-types';


export async function defaultAvatar(uid: string) {
  let parameter;
  const username = await getUsername(uid);

  if (username) {
    parameter = username;
  } else {
    parameter = uid;
  }

  return `//tr-avatars.herokuapp.com/avatars/50/${parameter}.png`;
}

export default async function getAvatar(uid: string) {
  const fallback = await defaultAvatar(uid);
  return getDatabaseRef("avatars")
    .child(uid)
    .once("value")
    .then(snap => snap.val() || fallback);
}

export async function listenAvatar(uid: string, callback: (a: DataSnapshot, b?: string | null | undefined) => any) {
  return getDatabaseRef("avatars")
    .child(uid)
    .on("value", callback);
}
