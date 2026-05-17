import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { VideoData, ChallengeData, YouTubeItem } from '../types';

import Header from '../components/Header';
import DanceCard from '../components/DanceCard';
import ChallengeItem from '../components/ChallengeItem';
import Nav from '../components/Nav';

import thumb1 from '../img/thumb1.png';
import thumb2 from '../img/thumb2.png';
import defaultChar from '../img/tyt.png';

import {
  MainPageContainer,
  ProfileSection,
  CharacterContainer,
  CharacterImg,
  LevelCardWrapper,
  LevelCardInner,
  LevelInfoArea,
  LevelText,
  ProgressTrack,
  ProgressFill,
  PracticeBtn,
  ContentSection,
  SectionTitle,
  HorizontalScroll,
  ScrollIndicatorTrack,
  ScrollIndicatorBar,
  ChallengeList,
} from './MainPage.styles';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

interface LocationState {
  teacher?: {
    id: number;
    name: string;
    hashtag: string;
    comment: string;
  };
  teacherImage?: string;
}

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const getLevelTitle = (level: number): string => {
  if (level >= 50) return '전설의 댄스 마스터';
  if (level >= 30) return '무대를 장악하는 댄스 스타';
  if (level >= 10) return '리듬을 깨우친 댄스 유망주';
  return '쑥쑥 자라는 댄스신동';
};

// 조회수 포맷
const formatViewCount = (count: string): string => {
  const num = parseInt(count, 10);

  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  }

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만`;
  }

  if (num >= 1000) {
    return `${Math.floor(num / 1000)}천`;
  }

  return `${num}회`;
};

// ISO 8601 duration → "90초"
const parseDuration = (iso: string): string => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const hours = parseInt(match?.[1] ?? '0');
  const minutes = parseInt(match?.[2] ?? '0');
  const seconds = parseInt(match?.[3] ?? '0');

  return `${hours * 3600 + minutes * 60 + seconds}초`;
};

// 날짜 포맷
const formatDate = (iso: string): string => {
  return iso.slice(0, 10).replace(/-/g, '.');
};

const MainPage: React.FC = () => {
  const location = useLocation();

  const { teacher, teacherImage } =
    (location.state as LocationState) ?? {};

  // 선택된 캐릭터 없으면 기본 이미지 사용
  const charImg = teacherImage ?? defaultChar;

  const currentLevel = 30;

  const [dailyChallenges, setDailyChallenges] = useState<
    ChallengeData[]
  >([]);

  const topVideos: VideoData[] = [
    {
      id: '1',
      title: 'BANG BANG (Preview) - IVE',
      date: '2025.11.20',
      score: 98,
      thumbnail: thumb1,
    },
    {
      id: '2',
      title: '아웅다웅 (feat. TimeFever)',
      date: '2026.01.07',
      score: 90,
      thumbnail: thumb2,
    },
    {
      id: '3',
      title: 'Supernova - aespa',
      date: '2025.11.10',
      score: 80,
      thumbnail: thumb2,
    },
  ];

  const sortedVideos = [...topVideos].sort(
    (a, b) => b.score - a.score
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // 스크롤 인디케이터
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const barEl = barRef.current;

    if (!scrollEl || !barEl) return;

    const onScroll = () => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        if (!scrollEl || !barEl) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollEl;

        const scrollable = scrollWidth - clientWidth;

        if (scrollable <= 0) return;

        const percent = scrollLeft / scrollable;
        const maxMove = 262 - 100;

        barEl.style.transform = `translateX(${
          percent * maxMove
        }px)`;
      });
    };

    scrollEl.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      scrollEl.removeEventListener('scroll', onScroll);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 유튜브 추천 챌린지 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // 1차 요청
        const searchUrl = new URL(
          'https://www.googleapis.com/youtube/v3/search'
        );

        searchUrl.searchParams.set('part', 'snippet');
        searchUrl.searchParams.set(
          'q',
          'kpop dance challenge'
        );
        searchUrl.searchParams.set('type', 'video');
        searchUrl.searchParams.set('videoCategoryId', '10');
        searchUrl.searchParams.set('order', 'viewCount');
        searchUrl.searchParams.set('maxResults', '3');
        searchUrl.searchParams.set('regionCode', 'KR');
        searchUrl.searchParams.set('relevanceLanguage', 'ko');
        searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

        const res = await fetch(searchUrl.toString());

        if (!res.ok) {
          throw new Error('Failed to fetch YouTube data');
        }

        const data = await res.json();

        // video ids
        const ids = data.items
          .map((item: YouTubeItem) =>
            typeof item.id === 'string'
              ? item.id
              : item.id?.videoId ?? ''
          )
          .join(',');

        // 2차 요청 (조회수 + duration)
        const statsUrl = new URL(
          'https://www.googleapis.com/youtube/v3/videos'
        );

        statsUrl.searchParams.set(
          'part',
          'statistics,contentDetails,snippet'
        );

        statsUrl.searchParams.set('id', ids);
        statsUrl.searchParams.set('key', YOUTUBE_API_KEY);

        const statsRes = await fetch(statsUrl.toString());

        if (!statsRes.ok) {
          throw new Error(
            'Failed to fetch video statistics'
          );
        }

        const statsData = await statsRes.json();

        const viewCountMap: Record<
          string,
          {
            viewCount: string;
            duration: string;
            publishedAt: string;
          }
        > = {};

        statsData.items.forEach(
          (item: {
            id: string;
            statistics: { viewCount: string };
            contentDetails: { duration: string };
            snippet: { publishedAt: string };
          }) => {
            viewCountMap[item.id] = {
              viewCount:
                item.statistics.viewCount ?? '0',
              duration: item.contentDetails.duration,
              publishedAt: item.snippet.publishedAt,
            };
          }
        );

        // 최종 데이터 가공
        const formattedChallenges: ChallengeData[] =
          data.items.map((item: YouTubeItem) => {
            const resolvedId =
              typeof item.id === 'string'
                ? item.id
                : item.id?.videoId ?? '';

            const {
              viewCount,
              duration,
              publishedAt,
            } = viewCountMap[resolvedId] ?? {
              viewCount: '0',
              duration: 'PT0S',
              publishedAt: '',
            };

            return {
              id: resolvedId,
              artist: decodeHTMLEntities(
                item.snippet?.channelTitle ??
                  'Unknown Artist'
              ),
              song: decodeHTMLEntities(
                item.snippet?.title ?? 'Unknown Song'
              ),
              thumbnail:
                item.snippet?.thumbnails?.medium?.url ??
                '',
              description: '오늘의 인기 댄스 챌린지!',
              participants:
                formatViewCount(viewCount),
              uploadDate: formatDate(publishedAt),
              duration: parseDuration(duration),
            };
          });

        setDailyChallenges(formattedChallenges);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <MainPageContainer>
      <Header />

      {/* 프로필 영역 */}
      <ProfileSection>
        <CharacterContainer>
          <CharacterImg
            src={charImg}
            alt={teacher?.name ?? 'character'}
          />
        </CharacterContainer>

        <LevelCardWrapper>
          <LevelCardInner>
            <LevelInfoArea>
              <LevelText>
                LV.{currentLevel}{' '}
                {getLevelTitle(currentLevel)}
              </LevelText>

              <ProgressTrack>
                <ProgressFill $progress={60} />
              </ProgressTrack>
            </LevelInfoArea>

            <PracticeBtn>연습</PracticeBtn>
          </LevelCardInner>
        </LevelCardWrapper>
      </ProfileSection>

      {/* 점수 높은 영상 */}
      <ContentSection>
        <SectionTitle>
          높은 점수를 받은 댄스 영상
        </SectionTitle>

        <HorizontalScroll ref={scrollRef}>
          {sortedVideos.map((video) => (
            <DanceCard
              key={video.id}
              {...video}
            />
          ))}
        </HorizontalScroll>

        <ScrollIndicatorTrack>
          <ScrollIndicatorBar
            ref={barRef}
            $scrollPercent={0}
          />
        </ScrollIndicatorTrack>
      </ContentSection>

      {/* 추천 챌린지 */}
      <ContentSection>
        <SectionTitle>
          오늘의 추천 댄스 챌린지
        </SectionTitle>

        <ChallengeList>
          {dailyChallenges.map((challenge) => (
            <ChallengeItem
              key={challenge.id}
              {...challenge}
            />
          ))}
        </ChallengeList>
      </ContentSection>

      <Nav />
    </MainPageContainer>
  );
};

export default MainPage;