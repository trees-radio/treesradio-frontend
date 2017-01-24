import fbase from 'libs/fbase';
import profile from 'stores/profile';

export function send(type, data={}) {
  if (profile.user !== null) {
    return fbase.database().ref('event_bus').push({uid: profile.user.uid, type, data});
  } else {
    return null;
  }
}