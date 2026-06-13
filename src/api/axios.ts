import axios from "axios";
import { useAuthStore } from "../store/authStore";

// 인증 토큰(access/refresh)은 httpOnly 쿠키로 관리되므로,
// withCredentials 만 켜 두면 요청 시 쿠키가 자동으로 함께 전송됩니다.
// (프론트에서 Authorization 헤더를 직접 붙이지 않습니다)
export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // accessToken(쿠키) 만료 → refresh 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // refresh 요청 — 서버가 새 access/refresh 토큰을 httpOnly 쿠키로 다시 심어줍니다.
        await axios.post(
          "http://localhost:3000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        // 새 accessToken 쿠키가 자동 첨부되므로 원 요청을 그대로 재시도합니다.
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
