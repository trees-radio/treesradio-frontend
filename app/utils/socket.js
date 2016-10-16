
import socket from 'socket.io-client';

const baseURL = `${process.env.API_PROTOCOL || 'https'}://${process.env.API}`;

const sock = socket(baseURL);

export default sock;

export function logout() {
  sock.emit('logout');
}

var AUTH_TOKEN = null;

export function login(token) {
  AUTH_TOKEN = token;
  sock.emit('auth', {token});
}

sock.on('reconnect', () => {
  if (AUTH_TOKEN) {
    login(AUTH_TOKEN);
  }
});

sock.on('auth_response', a => console.log('socket auth', a));
