import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:3000',
});

export default publicApi;