import axios from 'axios';

// Cambiá esta URL por la de tu backend
const BASE_URL = 'https://tu-api.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use(
  (config) => {
    // TODO: obtener token del storage o store de Zustand
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirigir al login si el token expiró
      console.log('Token expirado, redirigir al login');
    }
    return Promise.reject(error);
  }
);

export default api;
