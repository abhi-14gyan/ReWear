import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, use the proxy (localhost:5000)
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // In production, use the deployed backend URL
  // Replace this with your actual deployed backend URL
  return process.env.REACT_APP_API_URL || 'https://your-backend-domain.com';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 