import styled, { keyframes } from "styled-components";
///////////////브랜치 충돌 때문에 파일 날라갈 수도 있으니 해결하고 푸시하기
// ─── 애니메이션 ────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.8); }
  70%  { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

// ─── 페이지 전체 ───────────────────────────────────────────────────────────
export const FeedbackPageContainer = styled.div`
  padding: 20px 20px 120px 20px;
  min-height: 100vh;
`;

// ─── 상단 타이틀 바 ────────────────────────────────────────────────────────
export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const CodeBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #555;
  padding: 0;
`;

// ─── 캐릭터 영역 ───────────────────────────────────────────────────────────
export const CharacterSection = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  justify-content: center;
  display: flex;
`;

export const CharacterImg = styled.img`
  position: absolute;
  bottom: 30px;
  height: 180px;
  image-rendering: pixelated;
  animation: ${popIn} 0.5s ease both;
`;

export const CharacterLabel = styled.div`
  position: absolute;
  bottom: 10px;
  font-size: 10px;
  color: rgba(255,255,255,0.9);
  background: rgba(0,0,0,0.25);
  border-radius: 20px;
  padding: 2px 10px;
  white-space: nowrap;
  z-index: 2;
`;

export const SpeechBubble = styled.div`
  position: absolute;
  top: 16px;
  font-size: 11px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  animation: ${fadeInUp} 0.5s ease 0.3s both;
`;

// ─── 분석 탭 버튼 영역 ────────────────────────────────────────────────────
export const TabRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  animation: ${fadeInUp} 0.5s ease 0.2s both;
`;

export const TabCircle = styled.button<{ $color: string; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 70px;
  border-radius: 50%;
  background-color: ${p => p.$color};
  border: none;
  cursor: pointer;
  box-shadow: ${p => p.$active
    ? `0 0 0 3px white, 0 0 0 5px ${p.$color}`
    : '0 4px 12px rgba(0,0,0,0.15)'};
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  font-size: 22px;

  &:active { transform: scale(0.93); }
`;

export const TabLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #333;
  margin-top: 6px;
  display: block;
  text-align: center;
`;

export const TabItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// ─── 섹션 공통 ────────────────────────────────────────────────────────────
export const FeedbackCard = styled.div<{ $variant?: 'green' | 'pink' }>`
  background: ${p => p.$variant === 'pink' ? '#FFCCCC' : '#DAF0FF'};
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  animation: ${fadeInUp} 0.5s ease both;
`;

export const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #222;
  margin-bottom: 4px;
`;

export const CardSubtitle = styled.div`
  font-size: 10px;
  color: #4B4B4B;
  margin-bottom: 14px;
`;

// ─── 피드백 아이템 (체크리스트) ───────────────────────────────────────────
export const FeedbackList = styled.ul`
  list-style: none;
  padding: 10px 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #FFFFFF;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 400;
  line-height: 22px;
`;

export const FeedbackItem = styled.li<{ $color?: string }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  color: #333;
  line-height: 1.5;
`;

export const FeedbackIcon = styled.span<{ $bg: string }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  margin-top: 1px;
`;

// ─── 하단 버튼 ────────────────────────────────────────────────────────────
export const NextBtn = styled.button`
  display: block;
  width: 100%;
  height: 50px;
  background-color: #106AA9;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: galmuri11;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.15s ease;

  &:active { background-color: #0d5a8f; }
`;