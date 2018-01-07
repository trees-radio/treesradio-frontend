import fbase from "libs/fbase";

export default function getLikes(uid) {
  return fbase.database().ref("playing").child('feedback_users').child('likes').once("value").then(snap => snap.val());
}

export async function getUserLike(uid) {
  let like = await fbase.database().ref("playing").child('feedback_users').child('likes').child(uid).once("value").then(snap => snap.val());

  return like;
}

export async function getUserDislike(uid) {
  let dislike = await fbase.database().ref("playing").child('feedback_users').child('dislikes').child(uid).once("value").then(snap => snap.val());

  return dislike;
}

export async function getUserGrab(uid) {
  let grab = await fbase.database().ref("playing").child('feedback_users').child('grabs').child(uid).once("value").then(snap => snap.val());

  return grab;
}

