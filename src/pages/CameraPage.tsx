import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import MusicSelectSheet from "../components/MusicSelectSheet";
import { type SelectedTrack } from "../components/MusicItem";
import Warningimg from "../img/warningimg.svg";

// ─── Styled Components ────────────────────────────────────────
const Container = styled.div`
  width: 100%;
  height: 100dvh;
  background: #000;
  position: relative;
  overflow: hidden;
`;

const CameraWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`;

const StyledCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  z-index: 2;
  pointer-events: none;
`;

const ButtonContainer = styled.div`
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

const MusicButton = styled.button`
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

const MusicCover = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
`;

const MusicLabel = styled.span`
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  color: #fff;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShutterOuter = styled.button`
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

const ShutterInner = styled.div`
  width: 57px;
  height: 57px;
  background: #2085cc;
  border-radius: 50%;
`;

const PlaybackStatusBox = styled.div`
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

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MusicInfoText = styled.span`
  font-size: 14px;
  color: #111111;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
`;

const DurationText = styled.span`
  font-size: 14px;
  color: #333333;
`;

const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
`;

const ProgressTrack = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  background: #b6d3eb;
  border-radius: 2px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  position: absolute;
  left: 0;
  width: ${({ $percent }) => $percent}%;
  height: 3px;
  background: #2085cc;
  border-radius: 2px;
  z-index: 2;
`;

const TimelineDot = styled.div<{ $active: boolean; $leftPercent: number }>`
  position: absolute;
  left: ${({ $leftPercent }) => $leftPercent}%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#2085cc" : "#b6d3eb")};
  z-index: 3;
`;

const LoadingOverlay = styled.div`
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

const CountdownOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const CountdownNumber = styled.span`
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

// ✅ 경고 시 화면 어둡게
const WarningDimOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 13;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
`;

const WarningOverlay = styled.div`
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

const WarningIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const WarningText = styled.p`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  margin: 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
`;

// ✅ 완료 오버레이
const CompleteOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const CompleteTitle = styled.span`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 32px;
  font-weight: 400;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
`;

const CompleteButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RetakeButton = styled.button`
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

const ViewButton = styled.button`
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

// ─── 전신 인식 판정 헬퍼 ──────────────────────────────────────
const REQUIRED_LANDMARKS = [
  0,  // nose
  11, 12, // shoulders
  13, 14, // elbows
  15, 16, // wrists
  23, 24, // hips
  25, 26, // knees
  27, 28, // ankles
];
const VISIBILITY_THRESHOLD = 0.5;

const isFullBodyVisible = (landmarks: { visibility?: number }[]): boolean => {
  return REQUIRED_LANDMARKS.every(
    (idx) => (landmarks[idx]?.visibility ?? 0) >= VISIBILITY_THRESHOLD
  );
};

// ─── Component ────────────────────────────────────────────────
const CameraPage = () => {
  const navigate = useNavigate(); // ✅ 추가

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const countdownTimerRef = useRef<number | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false); // ✅ 추가
  const [progress, setProgress] = useState<number>(0);
  const [poseReady, setPoseReady] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showBodyWarning, setShowBodyWarning] = useState<boolean>(false);

  const TOTAL_DURATION = 20;

  // ─── 카메라 시작 ───────────────────────────────────────────
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라를 시작할 수 없습니다:", err);
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ─── MediaPipe 초기화 ──────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const initPose = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!isMounted) {
          landmarker.close();
          return;
        }

        poseLandmarkerRef.current = landmarker;
        setPoseReady(true);
        detectPose();
      } catch (err) {
        console.error("MediaPipe 초기화 실패:", err);
      }
    };

    initPose();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
    };
  }, []);

  // ─── 컴포넌트 언마운트 시 카운트다운 정리 ───────────────────────
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // ─── rAF 루프 ─────────────────────────────────────────────
  const detectPose = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    if (startTimeRef.current !== null) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      if (elapsed >= TOTAL_DURATION) {
        startTimeRef.current = null;
        setIsPlaying(false);
        setProgress(TOTAL_DURATION);
        setShowBodyWarning(false);
        setIsComplete(true); // ✅ 완료 상태로 전환
        if (audioRef.current) audioRef.current.pause();
      } else {
        setProgress(elapsed);
      }
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    const drawingUtils = new DrawingUtils(ctx);
    const result = landmarker.detectForVideo(video, performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (startTimeRef.current !== null) {
      const detected = result.landmarks.length > 0 && isFullBodyVisible(result.landmarks[0]);
      setShowBodyWarning(!detected);
    }

    for (const landmarks of result.landmarks) {
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: "#00FF88",
        lineWidth: 2,
      });
      drawingUtils.drawLandmarks(landmarks, {
        radius: 3,
        color: "#FF4444",
        fillColor: "#FF4444",
      });
    }

    animFrameRef.current = requestAnimationFrame(detectPose);
  };

  // ─── 음악 선택 핸들러 ───────────────────────────────────────
  const handleSelectTrack = (track: SelectedTrack) => {
    if (!track.preview) {
      alert("미리듣기를 지원하지 않는 곡입니다.");
      return;
    }
    handleStopPlayback();
    setSelectedTrack(track);
    setIsSheetOpen(false);
  };

  // ─── 셔터 버튼 및 카운트다운 로직 ─────────────────────────────
  const handleStartCountdown = () => {
    if (!selectedTrack || countdown !== null || countdownTimerRef.current !== null) return;

    setCountdown(3);
    let currentCount = 3;

    countdownTimerRef.current = window.setInterval(() => {
      currentCount -= 1;

      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        startPlayback();
      }
    }, 1000);
  };

  // ─── 실제 재생 시작 ────────────────────────────────────────
  const startPlayback = () => {
    if (!selectedTrack) return;

    setIsPlaying(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = selectedTrack.preview;
    audioRef.current.volume = 1;
    audioRef.current.play().catch((err) => {
      console.error("오디오 재생 실패:", err);
    });
  };

  // ─── 재생 정지 ─────────────────────────────────────────────
  const handleStopPlayback = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setIsPlaying(false);
    setShowBodyWarning(false);
    startTimeRef.current = null;
    if (audioRef.current) audioRef.current.pause();
  };  

  const handleRetake = () => {
    setIsComplete(false);
    setSelectedTrack(null);
    setProgress(0);
    setShowBodyWarning(false);
  };

  // ✅ 영상보기 — 경로 직접 설정
  const handleViewVideo = () => {
    navigate("/your/path/here");
  };

  const progressPercent = (progress / TOTAL_DURATION) * 100;

  const getArtistName = (artist: any) => {
    if (!artist) return "Unknown";
    return typeof artist === "object" ? artist.name : artist;
  };

  const isCountingDown = countdown !== null;

  return (
    <Container>
      <CameraWrapper>
        <StyledVideo ref={videoRef} autoPlay playsInline muted />
        <StyledCanvas ref={canvasRef} />
      </CameraWrapper>

      {!poseReady && (
        <LoadingOverlay>포즈 인식 준비 중...</LoadingOverlay>
      )}

      {/* ✅ 카운트다운 오버레이 */}
      {isCountingDown && countdown > 0 && (
        <CountdownOverlay>
          <CountdownNumber key={countdown}>{countdown}</CountdownNumber>
        </CountdownOverlay>
      )}

      {/* ✅ 경고 — 어둡게 + 문구 */}
      {isPlaying && showBodyWarning && (
        <>
          <WarningDimOverlay />
          <WarningOverlay>
            <WarningIcon src={Warningimg} alt="경고" />
            <WarningText>
              인식이 잘 되지 않습니다{"\n"}전신이 나오도록 더 멀리가주세요
            </WarningText>
          </WarningOverlay>
        </>
      )}

      {/* ✅ 완료 오버레이 */}
      {isComplete && (
        <CompleteOverlay>
          <CompleteTitle>완료!</CompleteTitle>
          <CompleteButtonRow>
            <RetakeButton onClick={handleRetake}>다시 촬영하기</RetakeButton>
            <ViewButton onClick={handleViewVideo}>영상보기</ViewButton>
          </CompleteButtonRow>
        </CompleteOverlay>
      )}

      {/* 완료 상태일 때 하단 버튼 숨김 */}
      {!isComplete && (
        <ButtonContainer>
          {!isPlaying && !isCountingDown ? (
            <>
              <MusicButton onClick={() => setIsSheetOpen(true)}>
                {selectedTrack ? (
                  <>
                    <MusicCover src={selectedTrack.coverUrl} alt={selectedTrack.title} />
                    <MusicLabel>
                      {selectedTrack.title} · {getArtistName(selectedTrack.artist)}
                    </MusicLabel>
                  </>
                ) : (
                  <MusicLabel>🎵 음악 선택</MusicLabel>
                )}
              </MusicButton>

              <ShutterOuter onClick={handleStartCountdown} disabled={!selectedTrack}>
                <ShutterInner />
              </ShutterOuter>
            </>
          ) : isPlaying ? (
            <PlaybackStatusBox onClick={handleStopPlayback}>
              <InfoRow>
                <MusicInfoText>
                  {selectedTrack?.title} - {getArtistName(selectedTrack?.artist)}
                </MusicInfoText>
                <DurationText>{TOTAL_DURATION}s</DurationText>
              </InfoRow>

              <TimelineContainer>
                <ProgressTrack />
                <ProgressFill $percent={progressPercent} />
                {[0, 33.3, 66.6, 100].map((pos, idx) => (
                  <TimelineDot
                    key={idx}
                    $leftPercent={pos}
                    $active={progressPercent >= pos}
                  />
                ))}
              </TimelineContainer>
            </PlaybackStatusBox>
          ) : null}
        </ButtonContainer>
      )}

      {isSheetOpen && (
        <MusicSelectSheet
          onSelect={handleSelectTrack}
          onClose={() => setIsSheetOpen(false)}
          selectedTrackId={selectedTrack?.id}
        />
      )}
    </Container>
  );
};

export default CameraPage;