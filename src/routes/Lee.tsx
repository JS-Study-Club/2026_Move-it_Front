import { Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import SearchPage from '../pages/SearchPage';
import FeedbackPage from '../pages/FeedbackPage';
import MyPage from '../pages/MyPage';

export default function Lee() {
  
  return (
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        
  )
}  