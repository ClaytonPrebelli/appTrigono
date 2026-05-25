import axios from 'axios';

const API_URL = 'https://apitrigono.prebellisolucoes.com/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Erro inesperado';
    return Promise.reject({ status: error.response?.status, message });
  }
);

export default apiClient;
