import type { RouteObject } from "react-router-dom";
import MainPage from "../pages/MainPage";
import SearchPage from "../pages/SearchPage";
import FeedbackPage from "../pages/FeedbackPage";
import MyPage from "../pages/MyPage";

// 메인 기능 라우트 (모두 "/" 기준 경로)
const Lee: RouteObject[] = [
  { path: "/main", element: <MainPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/feedback", element: <FeedbackPage /> },
  { path: "/feedback/:userChallengeId", element: <FeedbackPage /> },
  { path: "/mypage", element: <MyPage /> },
];

export default Lee;
