import axios from 'axios';

const baseURL = `https://${process.env.API}`;

const ax = axios.create({
  baseURL
});

export default ax;
