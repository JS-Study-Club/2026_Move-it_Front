import styled from "styled-components";

// ─── 화면/카메라 레이아웃 ─────────────────────────────────────
export const Container = styled.div`
  width: 100%;
  height: 100dvh;
  background: #000;
  position: relative;
  overflow: hidden;
  /* 9:16 무대를 화면 중앙에 배치하고, 남는 영역은 검은 레터박스로 채운다. */
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 카메라 화면을 항상 720x1280(9:16, 세로) 비율로 고정한다.
// 뷰포트가 9:16 이 아니어도 비율을 유지한 채 화면에 맞춰 축소된다.
export const Stage = styled.div`
  position: relative;
  width: min(100vw, calc(100dvh * 720 / 1280));
  height: min(100dvh, calc(100vw * 1280 / 720));
  overflow: hidden;
  background: #000;
`;

export const CameraWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  /* 9:16 무대를 가득 채운다(세로 화면). 소스가 9:16 이 아니면 가장자리가 잘릴 수 있다. */
  object-fit: cover;
  transform: scaleX(-1);
`;

export const StyledCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* 영상과 동일하게 cover 로 채워야 스켈레톤이 몸에 정확히 겹친다. */
  object-fit: cover;
  transform: scaleX(-1);
  z-index: 2;
  pointer-events: none;
`;

// ─── 하단 버튼 영역 ───────────────────────────────────────────
export const ButtonContainer = styled.div`
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: calc(100% - 48px);
  max-width: 400px;
`;

export const MusicButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;

  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;

  &:active {
    background: rgba(0, 0, 0, 0.65);
  }
`;

// "영상 불러오기" 버튼 — MusicButton 과 동일한 룩앤필
export const UploadButton = styled(MusicButton)`
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const MusicCover = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
`;

export const MusicLabel = styled.span`
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  color: #fff;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ShutterOuter = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 97px;
  height: 97px;
  padding: 20px;
  border-radius: 50%;
  background: rgba(32, 133, 204, 0.28);
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.95);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ShutterInner = styled.div`
  width: 57px;
  height: 57px;
  background: #2085cc;
  border-radius: 50%;
`;

// 좌상단 뒤로가기 버튼
export const BackButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 30;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;

  &:active {
    background: rgba(0, 0, 0, 0.65);
  }
`;

export const BackIcon = styled.img`
  width: 22px;
  height: 22px;
  /* 아이콘 원본이 검은색이라, 어두운 카메라 위에서 보이도록 흰색으로 반전 */
  filter: invert(1);
`;

// 음악 볼륨 조절 행 (MusicButton 과 동일한 룩앤필)
export const VolumeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;

  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
`;

export const VolumeSlider = styled.input`
  flex: 1;
  height: 4px;
  accent-color: #2085cc;
  cursor: pointer;
`;

// ─── 재생 상태 박스 / 타임라인 ────────────────────────────────
export const PlaybackStatusBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  padding: 16px 20px;
  box-sizing: border-box;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-family: "Galmuri11", sans-serif;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const MusicInfoText = styled.span`
  font-size: 14px;
  color: #111111;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
`;

export const DurationText = styled.span`
  font-size: 14px;
  color: #333333;
`;

export const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
`;

export const ProgressTrack = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  background: #b6d3eb;
  border-radius: 2px;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  position: absolute;
  left: 0;
  width: ${({ $percent }) => $percent}%;
  height: 3px;
  background: #2085cc;
  border-radius: 2px;
  z-index: 2;
`;

export const TimelineDot = styled.div<{ $active: boolean; $leftPercent: number }>`
  position: absolute;
  left: ${({ $leftPercent }) => $leftPercent}%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#2085cc" : "#b6d3eb")};
  z-index: 3;
`;

// ─── 오버레이들 ───────────────────────────────────────────────
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  pointer-events: none;
`;

// 업로드 영상 분석 중 전체 화면 오버레이
export const AnalyzingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
`;

export const AnalyzingText = styled.span`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 16px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
`;

export const CountdownOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const CountdownNumber = styled.span`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 120px;
  font-weight: 400;
  line-height: 1;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  animation: countPop 1s ease-out forwards;

  @keyframes countPop {
    0%   { transform: scale(1.4); opacity: 0; }
    20%  { transform: scale(1);   opacity: 1; }
    80%  { transform: scale(1);   opacity: 1; }
    100% { transform: scale(0.8); opacity: 0; }
  }
`;

// 경고 시 화면 어둡게
export const WarningDimOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 13;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
`;

export const WarningOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: none;
`;

export const WarningIcon = styled.img`
  width: 40px;
  height: 40px;
`;

export const WarningText = styled.p`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  margin: 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
`;

// 완료 오버레이
export const CompleteOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

export const CompleteTitle = styled.span`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 32px;
  font-weight: 400;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
`;

export const CompleteButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const RetakeButton = styled.button`
  display: flex;
  width: 151px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(126, 126, 126, 0.86);
  border: none;
  cursor: pointer;
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;

  &:active { opacity: 0.8; }
`;

export const ViewButton = styled.button`
  display: flex;
  width: 151px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(16, 106, 169, 0.86);
  border: none;
  cursor: pointer;
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;

  &:active { opacity: 0.8; }
`;
