import React, { useState } from 'react';
import styled from 'styled-components';

// Componentes
import Feed from '../components/Feed'; // Nosso componente com scroll infinito
import ExploreFeed from '../components/ExploreFeed'; // O novo componente de explorar
import StoriesBar from '../components/StoriesBar';
import TopPosters from '../components/TopPosters';

// Styled Components (sem alterações, podem ficar no final ou em arquivo separado)
const HomeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
`;

const FeedColumn = styled.div`
  width: 100%;
  max-width: 615px;
`;

const FeedSelector = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 24px;
  gap: 6px;
  width: 100%;
`;

const FeedTab = styled.button.attrs(() => ({ type: 'button' }))`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  padding: 10px 0;
  color: ${props => (props.isActive ? '#262626' : '#8e8e8e')};
  position: relative;
  min-width: 70px;
  text-align: center;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: rgb(254, 121, 13);
    border-radius: 2px;
    transform: scaleX(${props => (props.isActive ? 1 : 0)});
    transition: transform 0.3s ease;
  }
`;


const HomePage = () => {
  const [feedType, setFeedType] = useState('following'); // Controla qual feed exibir

  return (
    <HomeContainer>
      <FeedColumn>
        {/* Componentes de topo que não mudam */}
        <TopPosters />
        <StoriesBar />

        {/* Seletor de Abas (Seguindo / Explorar) */}
        <FeedSelector>
          <FeedTab
            isActive={feedType === 'following'}
            onClick={() => setFeedType('following')}
          >
            Seguindo
          </FeedTab>
          <FeedTab
            isActive={feedType === 'explore'}
            onClick={() => setFeedType('explore')}
          >
            Explorar
          </FeedTab>
        </FeedSelector>

        {/* Renderização Condicional do Feed Correto */}
        {feedType === 'following' ? <Feed /> : <ExploreFeed />}
      </FeedColumn>
    </HomeContainer>
  );
};

export default HomePage;