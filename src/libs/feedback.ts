import {getDatabaseRef} from "./fbase";

export default async function getLikes() {
  const snap = await getDatabaseRef("playing")
    .child("feedback_users")
    .child("likes")
    .once("value");
  return snap.val();
}

export async function getUserLike(uid:string) {
  let like = await getDatabaseRef("playing")
    .child("feedback_users")
    .child("likes")
    .child(uid)
    .once("value")
    .then(snap => snap.val());

  return like;
}

export async function getUserDislike(uid: string) {
  let dislike = await getDatabaseRef("playing")
    .child("feedback_users")
    .child("dislikes")
    .child(uid)
    .once("value")
    .then(snap => snap.val());

  return dislike;
}

export async function getUserGrab(uid: string) {
  let grab = await getDatabaseRef("playing")
    .child("feedback_users")
    .child("grabs")
    .child(uid)
    .once("value")
    .then(snap => snap.val());

  return grab;
}
