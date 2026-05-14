import styled from "styled-components";
import brickImg from '../img/main-page-brick.png';

export const MainPageContainer = styled.div`
  padding: 20px 20px 100px 20px;
  min-height: 100vh;
`;

export const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

export const CharacterContainer = styled.div`
  position: relative;
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
  overflow-x: auto; /* 내용이 넘치면 가로 스크롤바 생성 */
  padding-bottom: 10px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

export const ScrollIndicatorTrack = styled.div`
  height: 4px;
  background-color: rgba(255,255,255,0.5);
  border-radius: 2px;
  margin: 0 auto;
  width: 60%;
`;

export const ScrollIndicatorBar = styled.div<{ $scrollProgress: number }>`
  width: ${props => props.$scrollProgress}%; /*전달 받은 값*/
  height: 100%;
  background-color: #1a6ab4;
  border-radius: 2px;
`;

export const ChallengeList = styled.div`
  display: flex;
  flex-direction: column; 
  gap: 4px;
  width: 100%;
`;