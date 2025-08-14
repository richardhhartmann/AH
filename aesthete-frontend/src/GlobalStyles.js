import { createGlobalStyle } from 'styled-components';

// 1. IMPORTE SEU ARQUIVO DE FONTE LOCAL
// O caminho deve ser relativo a este arquivo (GlobalStyles.js)
import MeticulaRegular from './assets/fonts/Meticula-Regular.ttf';

const GlobalStyles = createGlobalStyle`
  /* 2. DECLARE A NOVA FAMÍLIA DE FONTES */
  @font-face {
    font-family: 'AestheteFont'; /* Nome que daremos à fonte no projeto */
    src: url(${MeticulaRegular}) format('truetype'); /* Aponta para a fonte importada */
    font-weight: normal;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    /* 3. APLIQUE A NOVA FONTE COMO PADRÃO */
    /* Colocamos 'AestheteFont' como a primeira opção */
    font-family: 'AestheteFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
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
    padding: 30px 20px;
    margin: 0 auto;

    @media (max-width: 768px) {
      padding-bottom: 100px;
      padding-left: 0;
      padding-right: 0;
    }
  }
`;

export default GlobalStyles;