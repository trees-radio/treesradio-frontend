import fbase from 'libs/fbase';

export default function getUsername(uid) {
  return fbase.database().ref('usernames').child(uid).once('value').then(snap => snap.val());
}

export function listenUsername(uid) {
  return fbase.database().ref('usernames').child(uid).on('value');
}