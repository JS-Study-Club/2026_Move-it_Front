import { create } from "zustand";
import type { HomeUserInfo } from "../types";

// 인증 토큰(access/refresh)은 백엔드가 httpOnly 쿠키로만 관리합니다.
// 프론트(JS)는 토큰을 보관/접근하지 않으며, 요청 시 쿠키가 자동 전송됩니다(withCredentials).
// 과거 버전에서 localStorage 에 저장해 두었던 accessToken 이 남아있다면 제거합니다.
if (typeof window !== "undefined") {
  localStorage.removeItem("accessToken");
}

interface AuthState {
  user: HomeUserInfo | null;

  setUser: (user: HomeUserInfo | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
