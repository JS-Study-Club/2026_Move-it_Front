import { api } from "./axios";
import { useAuthStore } from "../store/authStore";

/**
 * 사용자가 직접 로그아웃할 때 사용합니다.
 * 1) 서버에 로그아웃 요청을 보내 refresh 토큰(DB + httpOnly 쿠키)을 무효화하고
 * 2) 클라이언트 인증 상태(accessToken, user)를 초기화합니다.
 *
 * 서버 요청이 실패(토큰 만료 등)하더라도 로컬 로그아웃은 반드시 진행되도록
 * finally 에서 store.logout() 을 호출합니다.
 */
export async function logout(): Promise<void> {
  try {
    await api.post("auth/logout");
  } catch (error) {
    // 액세스 토큰이 이미 만료/무효여도 로컬 로그아웃은 진행되어야 하므로 무시합니다.
    console.warn("서버 로그아웃 요청 실패(로컬 로그아웃은 계속 진행)", error);
  } finally {
    useAuthStore.getState().logout();
  }
}
