import { apiClient } from "../client";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "./auth.types";
// Note: 각 도메인 폴더를 더 쪼개서 types를 내부에 두어도 좋습니다.

export const authApi = {
  /**
   * 신규 회원 가입
   */
  register: async (dto: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>(
      "/auth/register",
      dto
    );
    return data;
  },

  /**
   * 서비스 로그인
   */
  login: async (dto: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", dto);
    return data;
  },

  /**
   * 회원 탈퇴
   */
  withdraw: async (): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      "/auth/withdraw"
    );
    return data;
  },
};
