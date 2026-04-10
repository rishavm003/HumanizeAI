import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach Bearer token
client.interceptors.request.use(
  (config) => {
    const { session } = useAuthStore.getState();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could redirect to login
      console.error('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default client;
