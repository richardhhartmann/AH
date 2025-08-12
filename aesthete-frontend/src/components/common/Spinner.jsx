import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define a animação de rotação usando keyframes
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Cria um contêiner para centralizar o spinner
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

// Cria o ícone do spinner
const SpinnerIcon = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #262626; // Cor da parte que gira
  animation: ${rotate} 1s ease infinite; // Aplica a animação
`;

const Spinner = () => {
  return (
    <SpinnerContainer>
      <SpinnerIcon />
    </SpinnerContainer>
  );
};

export default Spinner;