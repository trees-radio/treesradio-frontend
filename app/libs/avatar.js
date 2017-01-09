import fbase from './fbase';
import getUsername from './username';

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
  return fbase.database().ref('avatars').child(uid).once('value').then(snap => snap.val() || fallback);
}

export async function listenAvatar(uid, callback) {
  return fbase.database().ref('avatars').child(uid).on('value', callback);
}