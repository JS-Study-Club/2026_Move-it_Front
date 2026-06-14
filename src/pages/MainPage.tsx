import { useEffect, useState } from "react";
import type {
  ApiResponse,
  HomeUserInfo,
  PageHomeResponse,
} from "../types";

import Header from "../components/Header";
import ChallengeItem from "../components/ChallengeItem";
import Nav from "../components/Nav";
import MyLevelCard from "../components/MyLevelCard";
import RecentDanceSection from "../components/RecentDanceSection";

//TODO : 토큰 타임아웃 확인
//TODO : 다머지 path 막아버리기

import {
  MainPageContainer,
  ContentSection,
  SectionTitle,
  ChallengeList,
} from "./MainPage.styles";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { toVideoData } from "../utils/videoMapper";
import type { VideoData, ChallengeData } from "../types.ui";
import { toChallengeData } from "../utils/challengeMapper";

export default function MainPage() {
  // const [dailyChallenges, setDailyChallenges] = useState<ChallengeData[]>([]);
  const navigate = useNavigate();
  // const user = useAuthStore((state) => state.user);
  const { setUser } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const [userData, setUserData] = useState<HomeUserInfo | null>(null);
  const [highScoreChallengeVideo, setHighScoreChallengeVideo] = useState<
    VideoData[] | null
  >(null);
  const [recommandChallenge, setRecommandChallenge] = useState<
    ChallengeData[] | null
  >(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<ApiResponse<PageHomeResponse>>(
          "pages/home"
        );
        if (response.status === 200) {
          if (!user) setUser(response.data.data.user);
          setUserData(response.data.data.user);
          const videos = response.data.data.highScoreDance?.map(toVideoData);
          setHighScoreChallengeVideo(videos);
          const recommandChallenges =
            response.data.data.recommendedChallengeList?.map(toChallengeData);
          setRecommandChallenge(recommandChallenges);
        }
      } catch (error: any) {
        console.log("유저정보 불러오기 실패", error);
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          navigate("/login");
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <MainPageContainer>
      <Header />

      {userData && <MyLevelCard user={userData} />}

      {/* 3. 최근 영상 컴포넌트 호출 */}
      {highScoreChallengeVideo && (
        <RecentDanceSection
          title="높은 점수를 받은 댄스 챌린지"
          videos={highScoreChallengeVideo}
          onCardClick={(video) => {
            if (video.userChallengeId != null) {
              navigate(`/feedback/${video.userChallengeId}`);
            }
          }}
        />
      )}
      {/* 4. 추천 챌린지 렌더링 */}
      <ContentSection>
        <SectionTitle>오늘의 추천 댄스 챌린지</SectionTitle>
        <ChallengeList>
          {/* {dailyChallenges.map((challenge) => (
            <ChallengeItem key={challenge.id} {...challenge} />
          ))} */}
          {recommandChallenge &&
            recommandChallenge?.map((v) => (
              <ChallengeItem
                key={v.id}
                {...v}
                onStart={(id) => navigate("/camera", { state: { challengeId: id } })}
              />
            ))}
        </ChallengeList>
      </ContentSection>

      <Nav />
    </MainPageContainer>
  );
}
