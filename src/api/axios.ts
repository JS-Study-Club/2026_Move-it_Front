import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; //TODO : 로컬에 들어간 거 지우기
  console.log(
    `intersp token : ${token}` // debug
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // accessToken 만료
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login"
    ) {
      originalRequest._retry = true;
    }

    try {
      // refresh 요청
      const refreshResponse = await axios.post(
        "http://localhost:3000/api/auth/refresh",
        {},
        {
          withCredentials: true,
        }
      );

      const newAccessToken = refreshResponse.data.accessToken;

      // store + localStorage 저장
      useAuthStore.getState().setAccessToken(newAccessToken);

      // 기존 요청에 새 토큰 장착
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // 실패했던 요청 다시 실행
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    }
  }
);
