import api from './apiConfig';

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
