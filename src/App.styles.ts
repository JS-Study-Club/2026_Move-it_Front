import styled, { createGlobalStyle } from 'styled-components';
import bgImg from './img/background.png';
import font from './assets/font/Galmuri11.woff2';

export const GlobalStyle = createGlobalStyle`
:root {
  --vh: 100%;
}

@font-face{
  font-family: 'Galmuri11';
  src: url(${font}) format('woff2');
  font-style: normal;
}

body {
  margin: 0;
  padding: 0;
  display: flex;
  overflow: hidden;
  font-family: 'Galmuri11', sans-serif;
  justify-content: center;
}
`;

export const AppContainer = styled.div`
  width: 100%;
  max-width: 390px;
  
  height: calc(var(--vh, 1vh) * 100);
  margin: 0 auto;
  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  position: relative;
  overflow-x: hidden; /* 가로 스크롤 방지 */
`;  