import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5010/api', // Matches backend launchSettings.json
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
