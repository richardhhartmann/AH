// Caminho: aesthete-frontend/src/components/Ad.jsx

import api from '../api/axios';
import React from 'react';
import styled from 'styled-components';

// Reutilizando alguns estilos do componente Post
const PostContainer = styled.div`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  max-width: 615px;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  
  strong {
    font-size: 0.9rem;
  }

  span {
    font-size: 0.75rem;
    color: #8e8e8e;
    margin-left: auto; /* Joga para a direita */
  }
`;

const AdImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const AdFooter = styled.div`
  padding: 16px;
  font-size: 0.85rem;
  
  h4 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 12px;
    line-height: 1.4;
  }
`;

const CallToActionButton = styled.a`
  display: block;
  width: 100%;
  padding: 8px;
  background-color: #0095f6;
  color: white;
  text-align: center;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: #0077c6;
  }
`;


const Ad = ({ ad }) => {
  const handleAdClick = async () => {
    try {
      console.log(`Anúncio ${ad._id} clicado! Registrando clique...`);
      
      api.post(`/ads/${ad._id}/click`);

    } catch (error) {
      console.error("Erro ao registrar o clique do anúncio:", error);
    }
    
  };

  return (
    <PostContainer>
      <PostHeader>
        <strong>{ad.companyName}</strong>
        <span>Patrocinado</span>
      </PostHeader>

      <a href={ad.callToAction.url} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
        <AdImage src={ad.mediaUrl} alt={ad.headline} />
      </a>
      
      <AdFooter>
        <h4>{ad.headline}</h4>
        {ad.description && <p>{ad.description}</p>}
        <CallToActionButton href={ad.callToAction.url} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
            {ad.callToAction.text}
        </CallToActionButton>
      </AdFooter>
    </PostContainer>
  );
};

export default Ad;