import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; //TODO : 로컬에 들어간 거 지우기
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
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

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

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/yun/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
