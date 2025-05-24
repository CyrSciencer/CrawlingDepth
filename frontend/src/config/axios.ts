import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Backend server port
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important pour les cookies
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const playerId = Cookies.get('playerId');
    if (playerId) {
      config.headers['X-Player-ID'] = playerId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Si le serveur renvoie un cookie playerId, on le stocke
    const playerId = response.headers['set-cookie']?.find(cookie => 
      cookie.startsWith('playerId=')
    );
    if (playerId) {
      const playerIdValue = playerId.split(';')[0].split('=')[1];
      Cookies.set('playerId', playerIdValue, { 
        expires: 30, // 30 jours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Si l'authentification échoue, on supprime le cookie
      Cookies.remove('playerId');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 