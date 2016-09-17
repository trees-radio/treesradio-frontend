import axios from 'axios';

const baseURL = `https://${process.env.API}`;

const ax = axios.create({
  baseURL
});

ax.get('/'); // wakeup call

export default ax;
