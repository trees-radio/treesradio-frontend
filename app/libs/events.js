import fbase from 'libs/fbase';
import profile from 'stores/profile';

export function send(type, data={}) {
  if (profile.user !== null) {
    return fbase.database().ref('event_bus').push({uid: profile.user.uid, type, data});
  } else {
    return null;
  }
}


// was too high when I wrote this, the type isn't even used in the constructor
const listeners = {};

class EventListener {
  handlers = [];

  constructor(type, ref) {
    fbase.database().ref(ref).on('child_added', snap => this.handlers.forEach(handler => handler(snap)));
  }

  addHandler(handler) {
    const index = this.handlers.push(handler) - 1;
    return () => {
      this.handlers[index] = null;
    }
  }
}

export function register(type, ref, handler) {
  if (!listeners[type]) {
    listeners[type] = new EventListener(type, ref);
  }

  const listener = listeners[type];
  
  return listener.addHandler(handler);
}