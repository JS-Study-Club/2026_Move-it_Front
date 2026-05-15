import React, { useEffect, useState, useRef } from 'react';
import type { VideoData, ChallengeData, YouTubeItem } from '../types';
import Header from '../components/Header';
import DanceCard from '../components/DanceCard';
import ChallengeItem from '../components/ChallengeItem';
import Nav from '../components/Nav';

import char from '../img/image 78.png';
import thumb1 from '../img/thumb1.png';
import thumb2 from '../img/thumb2.png';

import {
  MainPageContainer, ProfileSection, CharacterContainer, CharacterImg, LevelCardWrapper, LevelCardInner,
  LevelInfoArea, LevelText, ProgressTrack, ProgressFill, PracticeBtn, ContentSection, SectionTitle,
  HorizontalScroll, ScrollIndicatorTrack, ScrollIndicatorBar, ChallengeList
} from './MainPage.styles';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const MainPage: React.FC = () => {
  const [dailyChallenges, setDailyChallenges] = useState<ChallengeData[]>([]);
  const topVideos: VideoData[] = [
    { id: "1", title: 'BANG BANG (Preview) - IVE', date: '2025.11.20', score: 98, thumbnail: thumb1 },
    { id: "2", title: '아웅다웅 (feat. TimeFever)', date: '2026.01.07', score: 90, thumbnail: thumb2 },
    { id: "3", title: 'Supernova - aespa', date: '2025.11.10', score: 80, thumbnail: thumb2 },
  ];
  const sortedVideos = [...topVideos].sort((a, b) => b.score - a.score);

  const scrollRef = useRef<HTMLDivElement>(null); //dom 요소 직접 접근 위해
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const barEl = barRef.current;
    if (!scrollEl || !barEl) return;

    const onScroll = () => {
      if (rafRef.current !== null) return; // 1. 중복 실행 방지 (이미 애니메이션 프레임 요청 중이면 대기)

      rafRef.current = requestAnimationFrame(() => { // 2. requestAnimationFrame(RAF): 브라우저의 주사율(보통 60fps)에 맞춰 부드럽게 실행
        rafRef.current = null; // 실행 직후 초기화하여 다음 프레임 예약 가능하게 함
        if (!scrollEl || !barEl) return;

        // 3. 스크롤 비율 계산. scrollLeft(현재 위치) / scrollable(전체 이동 가능한 길이)
        const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
        const scrollable = scrollWidth - clientWidth;
        if (scrollable <= 0) return;

        // state 업데이트 없이 DOM 직접 수정 → 리렌더링 0회, 떨림 없음
        const percent = scrollLeft / scrollable;
        const maxMove = 262 - 100; // 트랙(262px)에서 바(100px)를 뺀 실제 이동 가능 범위 (162px)

        // 4. 리액트 상태 업데이트(setState) 대신 DOM 직접 수정!
        // 이 부분이 가장 중요합니다. 리액트를 거치지 않고 스타일만 살짝 바꾸기 때문에 
        // 컴포넌트가 다시 그려지지 않아 '떨림 현상'이 사라집니다.
        barEl.style.transform = `translateX(${percent * maxMove}px)`;
      });
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true }); // { passive: true } : 브라우저에게 "이 스크롤 이벤트는 화면을 멈추게 하지 않을 거야"라고 알려줌 (스크롤 성능 향상)
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        searchUrl.searchParams.set('part', 'snippet');
        searchUrl.searchParams.set('q', 'kpop dance challenge');
        searchUrl.searchParams.set('type', 'video');
        searchUrl.searchParams.set('videoCategoryId', '10');
        searchUrl.searchParams.set('order', 'viewCount');
        searchUrl.searchParams.set('maxResults', '3');
        searchUrl.searchParams.set('regionCode', 'KR');
        searchUrl.searchParams.set('relevancelLanguage', 'ko');
        searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

        const res = await fetch(searchUrl.toString());
        if (!res.ok) throw new Error('Failed to fetch YouTube data');
        const data = await res.json();

        const formattedChallenges: ChallengeData[] = data.items.map((item: YouTubeItem) => {
          const resolvedId = typeof item.id === 'string' ? item.id : (item.id?.videoId ?? '');
          return {
            id: resolvedId,
            artist: decodeHTMLEntities(item.snippet?.channelTitle ?? 'Unknown Artist'),
            song: decodeHTMLEntities(item.snippet?.title ?? 'Unknown Song'),
            thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
            description: '오늘의 인기 댄스 챌린지!',
            difficulty: 'Normal',
            duration: 'Shorts',
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
      <ProfileSection>
        <CharacterContainer>
          <CharacterImg src={char} alt="character" />
        </CharacterContainer>
        <LevelCardWrapper>
          <LevelCardInner>
            <LevelInfoArea>
              <LevelText>LV. 50 전설의 댄스 마스터</LevelText>
              <ProgressTrack>
                <ProgressFill $progress={60} />
              </ProgressTrack>
            </LevelInfoArea>
            <PracticeBtn>연습</PracticeBtn>
          </LevelCardInner>
        </LevelCardWrapper>
      </ProfileSection>

      <ContentSection>
        <SectionTitle>높은 점수를 받은 댄스 영상</SectionTitle>
        <HorizontalScroll ref={scrollRef}>
          {sortedVideos.map(video => <DanceCard key={video.id} {...video} />)}
        </HorizontalScroll>
        <ScrollIndicatorTrack>
          <ScrollIndicatorBar ref={barRef} $scrollPercent={0} />
        </ScrollIndicatorTrack>
      </ContentSection>

      <ContentSection>
        <SectionTitle>오늘의 추천 댄스 챌린지</SectionTitle>
        <ChallengeList>
          {dailyChallenges.map(challenge => <ChallengeItem key={challenge.id} {...challenge} />)}
        </ChallengeList>
      </ContentSection>

      <Nav />
    </MainPageContainer>
  );
};

export default MainPage;