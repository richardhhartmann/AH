import axios from 'axios';

// URL da sua API. É uma boa prática colocá-la em um arquivo .env
const ENDPOINT = process.env.REACT_APP_API_URL;
const API_URL = `${ENDPOINT}/api/auth/`; // A URL da sua API de autenticação

// Função para dar like em um post
const likePost = async (postId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + postId + '/like', {}, config);

  return response.data;
};

// Objeto que exporta todas as funções do serviço
const postService = {
  likePost,
};

export default postService;