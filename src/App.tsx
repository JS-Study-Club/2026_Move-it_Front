import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalStyle, AppContainer } from './App.styles';
import { useEffect } from 'react';
import Nav from './components/Nav.tsx';

import Lee from './routes/Lee.tsx';
import Yun from './routes/Yun.tsx'; // 다른 팀원이 있다면
import FirstPage from './pages/FirstPage.tsx';

export default function App() {
  function setScreenSize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  useEffect(() => {
    setScreenSize();

    window.addEventListener('resize', setScreenSize);
    return () => window.removeEventListener('resize', setScreenSize);
  }, []);

  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppContainer>
        <Routes>

        <Route path="/" element={<FirstPage/>} />
          {/* 중요: path 뒤에 "/*"를 붙여야 자식 라우트(LeeRoutes)가 본인의 하위 경로를 인식할 수 있습니다. */}
          <Route path="/yun/*" element={<Yun/>} />
          <Route path="/lee/*" element={<Lee />} />
        </Routes>

        {/* <Nav /> */}
      </AppContainer>
    </BrowserRouter>
  )
}