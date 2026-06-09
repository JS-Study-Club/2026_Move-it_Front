import Header from "../components/Header";
import Nav from "../components/Nav";

import MyProfileCard from "../components/MyProfileCard"; // ← 마이페이지 전용 컴팩트 카드
import RecentDanceSection from "../components/RecentDanceSection";

import { MainPageContainer } from "./MainPage.styles";
import { api } from "../api/axios";
import type { ApiResponse } from "../types";
import { useEffect } from "react";




export default function MyPage() {
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
            const response = await api.get<ApiResponse<PageHomeResponse>>(
                "/pages/home"
            );
            if (response.status === 200) {
                setUserData(response.data.data.user);
                setUser(response.data.data.user);
                const videos = response.data.data.highScoreDance?.map(toVideoData);
                setHighScoreChallengeVideo(videos);
                const recommandChallenges =
                response.data.data.recommendedChallengeList?.map(toChallengeData);
                setRecommandChallenge(recommandChallenges);
                console.log("mainpage1 : ", videos);
                console.log("mainpage2 : ", recommandChallenges);
                console.log("mainpage3 : ", recommandChallenges);
            }
            } catch (error: any) {
            console.log("유저정보 불러오기 실패", error);
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

      <MyProfileCard />

      <RecentDanceSection title={"최근 연습한 춤"} />

      <Nav />
    </MainPageContainer>
  );
}
