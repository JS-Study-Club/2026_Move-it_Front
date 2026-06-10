import Header from "../components/Header";
import Nav from "../components/Nav";

import MyProfileCard from "../components/MyProfileCard"; // ← 마이페이지 전용 컴팩트 카드
import RecentDanceSection from "../components/RecentDanceSection";

import { MainPageContainer } from "./MainPage.styles";
import { api } from "../api/axios";
import type {
  ApiResponse,
  HomeUserInfo,
  MyPageData,
  RecentChallenges,
} from "../types";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { toVideoData } from "../utils/videoMapper";
import type { VideoData } from "../types.ui";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const [recentDanceChallenge, setRecentDanceChallenge] = useState<
    VideoData[] | null
  >(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<ApiResponse<any>>("/pages/my");
        if (response.status === 200) {
          const videos =
            response.data.data.recentPracticeDance?.map(toVideoData);
          setRecentDanceChallenge(videos);
          const fetchUserData = response.data.data.user;
          setUserData(fetchUserData);
          console.log("디버그 : ", fetchUserData);
        }
      } catch (error: any) {
        console.log("유저 정보 불러오기 실패", error);
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          navigate("/yun/login");
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <MainPageContainer>
      <Header />

      <MyProfileCard userInfo={userData} />
      {recentDanceChallenge && (
        <RecentDanceSection
          title={"최근 연습한 춤"}
          videos={recentDanceChallenge}
        />
      )}
      <Nav />
    </MainPageContainer>
  );
}
