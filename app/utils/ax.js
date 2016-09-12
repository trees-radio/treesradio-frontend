import axios from 'axios';

const devMode = process.env.NODE_ENV !== 'production';
const baseURL = devMode ? 'http://localhost:3000' : 'https://pineapple.treesradio.com';

const ax = axios.create({
  baseURL
});

export default ax;
