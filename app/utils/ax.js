import axios from 'axios';

function unix() {
  return Date.now() / 1000;
}

const secHr = 60 * 60;

const baseURL = `${process.env.API_PROTOCOL || 'https'}://${process.env.API}`;

const ax = axios.create({
  baseURL,
  timeout: 5000
});

var getAuthToken;
var AUTH_TOKEN;
var AUTH_TOKEN_EXP;

ax.interceptors.request.use(function (config) {

    if (getAuthToken && AUTH_TOKEN && AUTH_TOKEN_EXP < unix()) {
      config.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    } else if (getAuthToken) {
      getAuthToken().then(token => AUTH_TOKEN = token);
      AUTH_TOKEN_EXP = unix() + secHr;
      config.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }

    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// ax.get('/'); // wakeup call

export function hookAuth(authTokenFunc) {
  getAuthToken = authTokenFunc;
  getAuthToken().then(token => AUTH_TOKEN = token);
}

export function unhookAuth() {
  getAuthToken = undefined;
}

export default ax;
