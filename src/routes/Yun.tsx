import { Routes, Route } from 'react-router-dom';
import FirstPage from '../pages/FirstPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import CharacterSelectPage from '../pages/CharacterSelectPage';
import MyPage from '../pages/MyPage';


export default function Yun() {
  
  return (
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/select" element={<CharacterSelectPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        
  )
}  