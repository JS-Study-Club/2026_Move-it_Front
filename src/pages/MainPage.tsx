import { useEffect, useState } from "react";
import type { ChallengeData, YouTubeItem } from "../types";

import Header from "../components/Header";
import ChallengeItem from "../components/ChallengeItem";
import Nav from "../components/Nav";
import MyLevelCard from "../components/MyLevelCard";
import RecentDanceSection from "../components/RecentDanceSection";

import {
  MainPageContainer,
  ContentSection,
  SectionTitle,
  ChallengeList,
} from "./MainPage.styles";
import axios from "axios";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

const formatViewCount = (count: string): string => {
  const num = parseInt(count, 10);
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${Math.floor(num / 10000)}만`;
  if (num >= 1000) return `${Math.floor(num / 1000)}천`;
  return `${num}회`;
};

const parseDuration = (iso: string): string => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] ?? "0");
  const minutes = parseInt(match?.[2] ?? "0");
  const seconds = parseInt(match?.[3] ?? "0");
  return `${hours * 3600 + minutes * 60 + seconds}초`;
};

const formatDate = (iso: string): string => {
  return iso.slice(0, 10).replace(/-/g, ".");
};

export default function MainPage() {
  const [dailyChallenges, setDailyChallenges] = useState<ChallengeData[]>([]);
  const [userData, setUserData] = useState<UserDataRes | null>(null);

  useEffect(() => {
    // const fetchRecommendations = async () => {
    //   try {
    //     const searchUrl = new URL(
    //       "https://www.googleapis.com/youtube/v3/search"
    //     );
    //     searchUrl.searchParams.set("part", "snippet");
    //     searchUrl.searchParams.set("q", "kpop dance challenge");
    //     searchUrl.searchParams.set("type", "video");
    //     searchUrl.searchParams.set("videoCategoryId", "10");
    //     searchUrl.searchParams.set("order", "viewCount");
    //     searchUrl.searchParams.set("maxResults", "3");
    //     searchUrl.searchParams.set("regionCode", "KR");
    //     searchUrl.searchParams.set("relevanceLanguage", "ko");
    //     searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    //     const res = await fetch(searchUrl.toString());
    //     if (!res.ok) throw new Error("Failed to fetch YouTube data");

    //     const data = await res.json();

    //     const ids = data.items
    //       .map((item: YouTubeItem) =>
    //         typeof item.id === "string" ? item.id : item.id?.videoId ?? ""
    //       )
    //       .join(",");

    //     const statsUrl = new URL(
    //       "https://www.googleapis.com/youtube/v3/videos"
    //     );
    //     statsUrl.searchParams.set("part", "statistics,contentDetails,snippet");
    //     statsUrl.searchParams.set("id", ids);
    //     statsUrl.searchParams.set("key", YOUTUBE_API_KEY);

    //     const statsRes = await fetch(statsUrl.toString());
    //     if (!statsRes.ok) throw new Error("Failed to fetch video statistics");

    //     const statsData = await statsRes.json();

    //     const viewCountMap: Record<
    //       string,
    //       { viewCount: string; duration: string; publishedAt: string }
    //     > = {};

    //     statsData.items.forEach(
    //       (item: {
    //         id: string;
    //         statistics: { viewCount: string };
    //         contentDetails: { duration: string };
    //         snippet: { publishedAt: string };
    //       }) => {
    //         viewCountMap[item.id] = {
    //           viewCount: item.statistics.viewCount ?? "0",
    //           duration: item.contentDetails.duration,
    //           publishedAt: item.snippet.publishedAt,
    //         };
    //       }
    //     );

    //     const formattedChallenges: ChallengeData[] = data.items.map(
    //       (item: YouTubeItem) => {
    //         const resolvedId =
    //           typeof item.id === "string" ? item.id : item.id?.videoId ?? "";
    //         const { viewCount, duration, publishedAt } = viewCountMap[
    //           resolvedId
    //         ] ?? { viewCount: "0", duration: "PT0S", publishedAt: "" };

    //         return {
    //           id: resolvedId,
    //           artist: decodeHTMLEntities(
    //             item.snippet?.channelTitle ?? "Unknown Artist"
    //           ),
    //           song: decodeHTMLEntities(item.snippet?.title ?? "Unknown Song"),
    //           thumbnail: item.snippet?.thumbnails?.medium?.url ?? "",
    //           description: "오늘의 인기 댄스 챌린지!",
    //           participants: formatViewCount(viewCount),
    //           uploadDate: formatDate(publishedAt),
    //           duration: parseDuration(duration),
    //         };
    //       }
    //     );

    //     setDailyChallenges(formattedChallenges);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

    // fetchRecommendations();
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/me", {
          withCredentials: true,
        });

        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error: any) {
        console.log("유저정보 불러오기 실패", error);
        if (error.response?.status === 401) {
          //TODO : refresh 조진다
          alert("로그인 만료");
        }
      }
    };
  }, []);

  return (
    <MainPageContainer>
      <Header />

      <MyLevelCard />

      {/* 3. 최근 영상 컴포넌트 호출 */}
      <RecentDanceSection title="높은 점수를 받은 댄스 영상" />

      {/* 4. 추천 챌린지 렌더링 */}
      <ContentSection>
        <SectionTitle>오늘의 추천 댄스 챌린지</SectionTitle>
        <ChallengeList>
          {dailyChallenges.map((challenge) => (
            <ChallengeItem key={challenge.id} {...challenge} />
          ))}
        </ChallengeList>
      </ContentSection>

      <Nav />
    </MainPageContainer>
  );
}
