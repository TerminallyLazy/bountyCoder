import axios from 'axios';
import { RootState } from '../redux/store';
import { store } from '../redux/store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState() as RootState;
    const token = state.auth.token;
    
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
      store.dispatch({ type: 'auth/logout' });
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name?: string) => 
    api.post('/auth/register', { email, password, name }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

export const apiKeysApi = {
  getAll: () => 
    api.get('/keys'),
  
  getById: (id: string) => 
    api.get(`/keys/${id}`),
  
  create: (name: string, rateLimit: number) => 
    api.post('/keys', { name, rateLimit }),
  
  update: (id: string, data: { name?: string, rateLimit?: number, isActive?: boolean }) => 
    api.put(`/keys/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/keys/${id}`),
};

export const usersApi = {
  getAll: () => 
    api.get('/users'),
  
  getById: (id: string) => 
    api.get(`/users/${id}`),
  
  update: (id: string, data: { name?: string, email?: string, password?: string, role?: string }) => 
    api.put(`/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/users/${id}`),
};

export const modelsApi = {
  getAll: () => 
    api.get('/models'),
  
  getById: (id: string) => 
    api.get(`/models/${id}`),
  
  create: (data: { name: string, version: string, description?: string, isActive?: boolean }) => 
    api.post('/models', data),
  
  update: (id: string, data: { name?: string, version?: string, description?: string, isActive?: boolean }) => 
    api.put(`/models/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/models/${id}`),
};

export const llmApi = {
  generate: (prompt: string, maxTokens?: number, temperature?: number, topP?: number, stop?: string[]) => 
    api.post('/llm/generate', { prompt, maxTokens, temperature, topP, stop }),
  
  getModels: () => 
    api.get('/llm/models'),
};

export default api;
