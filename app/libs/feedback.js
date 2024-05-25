import fbase from "libs/fbase";
import { ref, get } from "firebase/database";

export default async function getLikes() {
  const likesRef = ref(fbase, "playing/feedback_users/likes");
  return await get(likesRef).then((snapshot) => snapshot.val());
}

export async function getUserLike(uid) {
  const likeRef = ref(fbase, `playing/feedback_users/likes/${uid}`);
  return await get(likeRef).then((snapshot) => snapshot.val());
}

export async function getUserDislike(uid) {
  const dislikeRef = ref(fbase, `playing/feedback_users/dislikes/${uid}`);
  return await get(dislikeRef).then((snapshot) => snapshot.val());
}

export async function getUserGrab(uid) {
  const grabRef = ref(fbase, `playing/feedback_users/grabs/${uid}`);
  return await get(grabRef).then((snapshot) => snapshot.val());
}
