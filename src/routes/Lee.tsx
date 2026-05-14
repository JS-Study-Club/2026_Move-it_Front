import { Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import SearchPage from '../pages/SearchPage';
import FeedbackPage from '../pages/FeedbackPage';

export default function Lee() {
  
  return (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
        
  )
}  