import Header from "../components/Header";
import Nav from "../components/Nav";

import MyProfileCard from "../components/MyProfileCard"; // ← 마이페이지 전용 컴팩트 카드
import RecentDanceSection from "../components/RecentDanceSection";

import { MainPageContainer } from "./MainPage.styles";
import { api } from "../api/axios";
import { logout } from "../api/auth";
import type { ApiResponse, PracticeResult } from "../types";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { toVideoData } from "../utils/videoMapper";
import type { VideoData } from "../types.ui";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// 연습 결과(UserChallenge) → 카드(VideoData) 매핑. id는 userChallengeId 입니다.
const toVideoFromPractice = (r: PracticeResult): VideoData => ({
  id: r.id,
  title: r.challenge?.name ?? "연습 기록",
  date: (r.createdAt ?? "").slice(0, 10),
  score: r.score,
  thumbnail: r.challenge?.music?.music_image_url ?? "",
});

export default function MyPage() {
  const [recentDanceChallenge, setRecentDanceChallenge] = useState<
    VideoData[] | null
  >(null);
  // 연습 결과 목록(클릭 시 결과 상세로 이동 가능)인지 여부
  const [clickable, setClickable] = useState<boolean>(false);
  // 최근 연습 목록 로딩 여부 (로딩 중에는 빈 상태 텍스트를 띄우지 않음)
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);

  // 로그아웃: 서버 세션(refresh 토큰/쿠키) 무효화 + 로컬 상태 초기화 후 로그인 화면으로 이동
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) 프로필 + 기본 최근 연습 목록
        const response = await api.get<ApiResponse<any>>("pages/my");
        if (response.status === 200) {
          const user = response.data.data.user;
          setUserData(user);

          // 폴백: /pages/my 의 recentPracticeDance (클릭 불가)
          const fallbackVideos =
            response.data.data.recentPracticeDance?.map(toVideoData);
          setRecentDanceChallenge(fallbackVideos ?? null);

          // 2) 외부 user_id 가 있으면 연습 결과 목록으로 교체(클릭 가능)
          const userId: string | undefined = user?.userId ?? user?.user_id;
          if (userId) {
            try {
              const practiceRes = await api.get<ApiResponse<PracticeResult[]>>(
                `practice/results/user/${userId}`
              );
              const results = practiceRes.data.data ?? [];
              setRecentDanceChallenge(results.map(toVideoFromPractice));
              setClickable(true);
            } catch (practiceError) {
              // 연습 결과 조회 실패 시 폴백 목록을 그대로 유지
              console.warn("연습 결과 목록 불러오기 실패", practiceError);
            }
          }
        }
      } catch (error: any) {
        console.log("유저 정보 불러오기 실패", error);
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <MainPageContainer>
      <Header />

      <MyProfileCard userInfo={userData} />
      {!loading && (
        <RecentDanceSection
          title={"최근 연습한 춤"}
          videos={recentDanceChallenge ?? []}
          onCardClick={
            clickable
              ? (video) => navigate(`/feedback/${video.id}`)
              : undefined
          }
        />
      )}

      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>

      <Nav />
    </MainPageContainer>
  );
}

const LogoutButton = styled.button`
  display: block;
  margin: 24px auto 0;
  padding: 8px 20px;
  background: transparent;
  border: 1px solid #9a9a9a;
  border-radius: 20px;
  color: #4b4b4b;
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
`;
