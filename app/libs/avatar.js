import fbase from "./fbase";
import { ref, onValue } from "firebase/database";
import getUsername from "./username";

export async function defaultAvatar(uid) {
  let parameter;
  const username = await getUsername(uid);

  if (username) {
    parameter = username;
  } else {
    parameter = uid;
  }

  return `//tr-avatars.herokuapp.com/avatars/50/${parameter}.png`;
}

export default async function getAvatar(uid) {
  const fallback = await defaultAvatar(uid);
  const dbRef = ref(fbase);
  return await get(child(dbRef, `avatars/${userId}`))
    .then((snapshot) => snapshot.val() || fallback
    ).catch((error) => {
      console.error(error);
    });
}

export async function listenAvatar(uid, callback) {
  const avatarRef = ref(fbase, `avatars/${uid}`);
  onValue(avatarRef, callback);
}
