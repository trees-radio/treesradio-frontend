import fbase from 'libs/fbase';

export default function getRank(uid) {
  return fbase.database().ref('ranks').child(uid).once('value').then(snap => snap.val());
}

export function listenRank(uid) {
  return fbase.database().ref('ranks').child(uid).on('value');
}