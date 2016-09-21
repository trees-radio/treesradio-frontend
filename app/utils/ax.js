import axios from 'axios';

const baseURL = `${process.env.API_PROTOCOL || 'https'}://${process.env.API}`;

const ax = axios.create({
  baseURL
});

ax.get('/'); // wakeup call

export default ax;
