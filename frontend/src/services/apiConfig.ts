import axios from 'axios';

// Create a function to get the token - to be set from the outside
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export const setAuthTokenGetter = (getter: () => string | null) => {
  getToken = getter;
};

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorized = callback;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      onUnauthorized();
    }
    
    return Promise.reject(error);
  }
);

export default api;

