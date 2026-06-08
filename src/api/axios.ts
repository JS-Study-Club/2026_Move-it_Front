import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소
  withCredentials: true, // 쿠키 자동 전송
});
