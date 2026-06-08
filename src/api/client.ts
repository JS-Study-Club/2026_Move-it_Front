import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

// 💡 관습 1: Request Interceptor (자동 토큰 주입)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 💡 관습 2: Response Interceptor (401 에러 발생 시 토큰 자동 재발급 로직 추가 가능)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰이 만료되어 401이 나고, 재시도한 적이 없다면 리프레시 토큰으로 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        // NestJS의 리프레시 라우터 호출 (주의: 무한 루프 방지를 위해 axios 직발송)
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest); // 기존 요청 재시도
      } catch (refreshError) {
        // 리프레시 토큰도 터지면 로그아웃 처리
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
