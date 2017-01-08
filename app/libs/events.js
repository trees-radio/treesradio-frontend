
export function send(type, data) {

}

const listeners = {};

class EventListener {
  handlers = [];

  constructor(type) {

  }
}

export function register(type, handler) {
  if (!listeners[type]) {
    listeners[type] = new EventListener(type);
  }

  const listener = listeners[type];
  
}