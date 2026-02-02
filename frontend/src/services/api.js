import axios from 'axios';

const api = axios.create({
 
baseURL: 'http://localhost:8000/api', // Use localhost instead of 127.0.0.1
});


// Automatically add token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data), // Matches view === 'forgot'
  resetPassword: (data) => api.post('/auth/reset-password', data),   // Matches view === 'reset'

};