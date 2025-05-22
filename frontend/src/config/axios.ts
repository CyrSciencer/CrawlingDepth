import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Backend server port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 