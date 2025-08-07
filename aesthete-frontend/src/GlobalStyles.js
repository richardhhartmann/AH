import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #fafafa;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  main {
    max-width: 975px;
    /* Padding padrão para desktop */
    padding: 30px 20px;
    margin: 0 auto;

    /* --- AQUI ESTÁ A CORREÇÃO --- */
    /* Em telas mobile, adicionamos um espaço extra no final da página */
    @media (max-width: 768px) {
      padding-bottom: 100px; /* Altura do rodapé (60px) + espaço extra (40px) */
    }
  }
`;

export default GlobalStyles;