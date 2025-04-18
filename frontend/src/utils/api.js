import axios from 'axios';

// Criar uma instância do axios com URL base
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor para adicionar token de autenticação a todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de resposta
api.interceptors.response.use(
  response => response,
  error => {
    // Se o erro for 401 (não autorizado), limpar o token e redirecionar para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
