import fbase from 'libs/fbase';

export default async function userOffline(uid) {
  let node = await fbase.database().ref('presence').child(uid).once('value');
  return node === null;
}