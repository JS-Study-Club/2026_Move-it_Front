import styled from "styled-components";
import brickImg from '../img/main-page-brick.png';

export const MainPageContainer = styled.div`
  padding: 20px 20px 100px 20px;
`;

export const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

export const CharacterContainer = styled.div`
  position: relative;
  z-index: 2;
  height: 180px;
`;

export const CharacterImg = styled.img`
  height: 100%;
  image-rendering: pixelated; /* 픽셀 아트 선명하게 */
  
`;

export const LevelCardWrapper = styled.div`
  width: 100%;
  height: 160px;
  background: url(${brickImg}) lightgray 50% / cover no-repeat;
  border-radius: 20px;
  box-shadow: 8px 7px 4px 0 rgba(0, 0, 0, 0.25) inset;
  position: relative;
  margin-top: -50px; /* 캐릭터 이미지와 겹치도록 */
  display: flex;
  margin-bottom: 10px;
`;

export const LevelCardInner = styled.div`
  position: absolute;
  top: 45%;
  transform: translate(5%, -5%); /*정중앙에 위치하게*/
  width: 80%;
  background-color: #FFF0C9;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

export const LevelInfoArea = styled.div`
  flex-grow: 1;
  margin-right: 15px;
`;

export const LevelText = styled.div`
  font-size: 10px;
  color: #333;
`;

export const ProgressTrack = styled.div`
  height: 8px;
  background-color: #FFE39C;
  border-radius: 4px;
  margin-top: 8px;
`;

export const ProgressFill = styled.div<{ $progress: number }>` /*$width: string*/
  width: ${props => props.$progress}%;  /*게이지 채워지는 정도*/
  height: 100%;
  background-color: #F6C039;
  border-radius: 4px;
`;

export const PracticeBtn = styled.button`
  background-color: #4a4a4a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 10px;
  font-family: Galmuri11;
`;

export const ContentSection = styled.section`
  margin-top: 30px;
  margin-bottom: 40px;
`;

export const SectionTitle = styled.h2`
  font-size: 16px;
  color: #333;
  margin-bottom: 18px;
  align-self: stretch;
`;

export const HorizontalScroll = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none;
  /* 떨림 방지: 스크롤 컨테이너를 별도 레이어로 분리 */
  will-change: scroll-position;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;
 
export const ScrollIndicatorTrack = styled.div`
  width: 262px;
  height: 4px;
  background-color: #DAF0FF;
  border-radius: 30px;
  margin: 20px auto;
  position: relative;
  /* 인디케이터 영역이 스크롤 영향 받지 않도록 레이어 고정 */
  overflow: hidden;
`;
 
/* $scrollPercent: 0~100 사이 값
   트랙(262px)에서 바(100px)를 뺀 162px 범위 내에서 translateX로 이동
   → left 대신 transform을 사용해 GPU 가속 적용, 레이아웃 재계산 없음 */
export const ScrollIndicatorBar = styled.div<{ $scrollPercent: number }>`
  width: 100px;
  height: 100%;
  background-color: #008DF0;
  border-radius: 30px;
  position: absolute;
  top: 0;
  left: 0;
  /* (트랙 262px - 바 100px) = 162px 가동 범위 */
  transform: translateX(${props => (props.$scrollPercent / 100) * 162}px);
  /* left 대신 transform 사용 → 리페인트 없이 GPU에서 처리되므로 떨림 없음 */
  will-change: transform;
`;

export const ChallengeList = styled.div`
  display: flex;
  flex-direction: column; 
  gap: 4px;
  width: 100%;
`;