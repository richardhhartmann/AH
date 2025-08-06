import axios from 'axios';

// Exportação Nomeada: Exporta a variável API_URL para que outros arquivos
// possam usá-la, principalmente para construir os caminhos das imagens.
export const API_URL = process.env.REACT_APP_API_URL;

// Cria a instância do axios com a URL base da nossa API.
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Interceptor: Uma função poderosa que "intercepta" todas as requisições
// antes de serem enviadas. Usamos para adicionar o token de autorização.
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

// Exportação Padrão: Exporta a instância 'api' como o item principal deste módulo.
// É esta linha que permite que outros arquivos façam 'import api from ...'
export default api;