import type { RouteObject } from "react-router-dom";
import FirstPage from "../pages/FirstPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import CharacterSelectPage from "../pages/CharacterSelectPage";
import CameraPage from "../pages/CameraPage";

// 인증/온보딩 라우트 (모두 "/" 기준 경로)
const Yun: RouteObject[] = [
  { path: "/", element: <FirstPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/select", element: <CharacterSelectPage /> },
  { path: "/camera", element: <CameraPage /> },
];

export default Yun;
