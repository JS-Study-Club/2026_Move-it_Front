import React from 'react';
import type { VideoData, ChallengeData } from '../types';
import Header from '../components/Header';
import DanceCard from '../components/DanceCard';
import ChallengeItem from '../components/ChallengeItem';

import char from '../img/image 78.png';

import { 
  MainPageContainer, ProfileSection, CharacterContainer, CharacterImg, LevelCardWrapper, LevelCardInner,
  LevelInfoArea, LevelText, ProgressTrack, ProgressFill, PracticeBtn, ContentSection, SectionTitle, HorizontalScroll, ScrollIndicatorTrack, ScrollIndicatorBar, ChallengeList
 } from './MainPage.styles';

const MainPage: React.FC = () => {
  // 더미 데이터 생략 (이전과 동일)
  const topVideos: VideoData[] = [
    { id: "1", title: 'BANG BANG (Preview) - IVE', date: '2025.11.20', score: 90, thumbnail: 'thumb1.jpg' },
    { id: "2", title: '이름에게 (feat. TimeFever)', date: '2025.01.07', score: 80, thumbnail: 'thumb2.jpg' },
  ];
  
  const dailyChallenges: ChallengeData[] = [
    { id: "c1", artist: 'BABYMONSTER', song: 'Really Like You', description: '귀여운 리듬감 포인트 댄스', participants: '12K명이', difficulty: 'Easy', duration: '20초' },
    { id: "c2", artist: 'BABYMONSTER', song: 'Really Like You', description: '귀여운 리듬감 포인트 댄스', participants: '12K명이', difficulty: 'Easy', duration: '20초' },
  ];

  const sortedVideos = [...topVideos].sort((a, b) => b.score - a.score);

  return (
    <MainPageContainer>
      <Header/>
      {/* 2. 프로필 & 캐릭터 영역 */}
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

      {/* 3. 댄스 영상 영역 */}
      <ContentSection>
        <SectionTitle>높은 점수를 받은 댄스 영상</SectionTitle>
        <HorizontalScroll>
          {sortedVideos.map(video => <DanceCard key={video.id} {...video} />)}
        </HorizontalScroll>
        {/* 가짜 스크롤 인디케이터 (디자인 반영) */}
        <ScrollIndicatorTrack>
          <ScrollIndicatorBar $scrollProgress={60} />
        </ScrollIndicatorTrack>
      </ContentSection>

      {/* 4. 추천 챌린지 영역 */}
      <ContentSection>
        <SectionTitle>오늘의 추천 댄스 챌린지</SectionTitle>
        <ChallengeList>
          {dailyChallenges.map(challenge => <ChallengeItem key={challenge.id} {...challenge} />)}
        </ChallengeList>
      </ContentSection>
    </MainPageContainer>
  );
};

export default MainPage;