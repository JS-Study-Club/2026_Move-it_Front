import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import MusicSelectSheet from "../components/MusicSelectSheet";
import { type SelectedTrack } from "../components/MusicItem";
import Warningimg from "../img/warningimg.svg";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { getApiErrorMessage } from "../utils/apiError";

// ─── MediaPipe 리소스 경로 (라이브/업로드 분석 공통) ───────────
const POSE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// 업로드 영상 제약 / 분석 설정
const MAX_VIDEO_DURATION = 21; // 초 — 이 값 이상이면 업로드 불가
const ANALYZE_FPS = 10; // 백엔드 추출 FPS와 동일하게 맞춤

// 백엔드 EvaluatePracticeDto.user_pose_data 와 동일한 프레임 형식
type PoseFrame = {
  t: number;
  l: { x: number; y: number; z: number; v: number }[];
};

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

// 파일에서 영상 길이(초)만 빠르게 읽어옵니다.
const getVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const d = v.duration;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("video load error"));
    };
    v.src = url;
  });

// 특정 시점으로 seek 하고 프레임 디코딩이 끝날 때까지 기다립니다.
// (일부 브라우저는 동일 위치 seek 시 'seeked' 가 안 떠서 타임아웃 폴백을 둡니다.)
const seekTo = (video: HTMLVideoElement, time: number): Promise<void> =>
  new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("seeked", finish);
      resolve();
    };
    video.addEventListener("seeked", finish);
    setTimeout(finish, 300);
    video.currentTime = time;
  });

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

// "영상 불러오기" 버튼 — MusicButton 과 동일한 룩앤필
const UploadButton = styled(MusicButton)`
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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

// 업로드 영상 분석 중 전체 화면 오버레이
const AnalyzingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
`;

const AnalyzingText = styled.span`
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 16px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
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
  // 현재 재생/녹화 길이(하이라이트 구간 길이, 초). rAF 루프에서 최신 값을 읽기 위해 ref 사용.
  const durationRef = useRef<number>(20);

  const countdownTimerRef = useRef<number | null>(null);
  // 라이브 촬영 포즈 프레임 수집 (10fps 샘플링)
  const poseFramesRef = useRef<PoseFrame[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  // 업로드 영상 분석용
  const fileInputRef = useRef<HTMLInputElement>(null);
  // FilesetResolver 결과 캐시 (업로드 분석 시 재사용)
  const visionRef = useRef<Awaited<
    ReturnType<typeof FilesetResolver.forVisionTasks>
  > | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false); // ✅ 추가
  const [progress, setProgress] = useState<number>(0);
  const [poseReady, setPoseReady] = useState<boolean>(false);
  // 업로드 영상 포즈 분석/전송 진행 중 여부
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  // 라이브 촬영 결과 전송 중 여부
  const [isSending, setIsSending] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showBodyWarning, setShowBodyWarning] = useState<boolean>(false);

  // 하이라이트 구간 정보가 없을 때 사용할 기본 길이(초)
  const DEFAULT_DURATION = 20;

  // 선택한 챌린지의 하이라이트 구간 길이(초). 재생/녹화/타임라인 표시에 사용됩니다.
  const highlightDuration = selectedTrack
    ? Math.max(1, selectedTrack.endTime - selectedTrack.startTime)
    : DEFAULT_DURATION;

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
        const vision = await FilesetResolver.forVisionTasks(POSE_WASM_URL);
        visionRef.current = vision; // 업로드 분석 시 재사용

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
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

      // 하이라이트 구간 길이만큼만 재생/녹화합니다.
      if (elapsed >= durationRef.current) {
        startTimeRef.current = null;
        setIsPlaying(false);
        setProgress(durationRef.current);
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

    // 라이브 촬영 중 포즈 프레임 수집 (10fps 샘플링)
    if (startTimeRef.current !== null && result.landmarks.length > 0) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      if (elapsed - lastSampleTimeRef.current >= 1 / ANALYZE_FPS) {
        lastSampleTimeRef.current = elapsed;
        const l = result.landmarks[0].map((p) => ({
          x: round4(p.x),
          y: round4(p.y),
          z: round4(p.z),
          v: round3((p as { visibility?: number }).visibility ?? 0),
        }));
        poseFramesRef.current.push({ t: round3(elapsed), l });
      }
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
    if (!track.musicUrl) {
      alert("재생할 수 있는 음원이 없습니다.");
      return;
    }
    handleStopPlayback();
    setSelectedTrack(track);
    setIsSheetOpen(false);

    // 미리 음원을 로드해 두어, 재생 시 하이라이트 시작 지점으로 빠르게 이동합니다.
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = track.musicUrl;
    audioRef.current.load();
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

  // ─── 실제 재생 시작 (하이라이트 구간만) ──────────────────────
  const startPlayback = () => {
    if (!selectedTrack) return;

    const start = selectedTrack.startTime ?? 0;
    const end =
      selectedTrack.endTime ?? start + DEFAULT_DURATION;
    // rAF 루프가 참조할 재생 길이를 하이라이트 구간 길이로 설정합니다.
    durationRef.current = Math.max(1, end - start);

    setIsPlaying(true);
    setProgress(0);
    poseFramesRef.current = [];
    lastSampleTimeRef.current = 0;
    startTimeRef.current = performance.now();

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.volume = 1;

    // 하이라이트 시작 지점으로 이동 후 재생
    const beginAtHighlight = () => {
      try {
        audio.currentTime = start;
      } catch {
        /* 메타데이터 미로드 등으로 실패 시 0부터 재생 */
      }
      audio.play().catch((err) => {
        console.error("오디오 재생 실패:", err);
      });
    };

    // 이미 같은 음원이 로드되어 있으면 바로, 아니면 메타데이터 로드 후 점프
    if (audio.src === selectedTrack.musicUrl && audio.readyState >= 1) {
      beginAtHighlight();
    } else {
      audio.src = selectedTrack.musicUrl;
      audio.addEventListener("loadedmetadata", beginAtHighlight, {
        once: true,
      });
      audio.load();
    }
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

  // 라이브 촬영 완료 후 포즈 데이터를 백엔드로 전송하고 피드백 페이지로 이동합니다.
  const handleViewVideo = async () => {
    if (!selectedTrack) {
      alert("곡 정보가 없습니다. 다시 촬영해주세요.");
      return;
    }
    if (poseFramesRef.current.length < 2) {
      alert("동작 데이터가 부족합니다. 다시 촬영해주세요.");
      return;
    }

    const userId = useAuthStore.getState().user?.userId;
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsSending(true);
    try {
      const res = await api.post(`practice/${selectedTrack.id}/evaluate`, {
        userId,
        user_pose_data: poseFramesRef.current,
      });
      const data = res.data?.data ?? res.data;
      const userChallengeId = data?.userChallengeId;

      if (userChallengeId != null) {
        navigate(`/feedback/${userChallengeId}`);
      } else {
        navigate("/feedback");
      }
    } catch (err) {
      console.error("라이브 촬영 결과 전송 실패", err);
      alert(getApiErrorMessage(err, "결과 전송에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  // ─── 미리 촬영된 영상 불러오기 ────────────────────────────────
  const handleLoadVideoClick = () => {
    if (isAnalyzing) return;
    if (!selectedTrack) {
      alert("먼저 곡을 선택해주세요.");
      return;
    }
    fileInputRef.current?.click();
  };

  // 업로드된 영상을 클라이언트(MediaPipe)에서 프레임 단위로 분석해
  // 백엔드 형식({ t, l: [...] })의 포즈 JSON 으로 변환합니다.
  const extractPoseFromVideoFile = async (file: File): Promise<PoseFrame[]> => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("영상을 불러올 수 없습니다."));
    });

    // 라이브 루프와 타임스탬프가 충돌하지 않도록 분석 전용 랜드마커를 새로 만듭니다.
    const vision =
      visionRef.current ??
      (await FilesetResolver.forVisionTasks(POSE_WASM_URL));
    visionRef.current = vision;

    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numPoses: 1,
    });

    const frames: PoseFrame[] = [];
    const step = 1 / ANALYZE_FPS;
    const duration = video.duration;

    try {
      for (let t = 0; t < duration; t += step) {
        await seekTo(video, t);
        const result = landmarker.detectForVideo(video, Math.round(t * 1000));
        if (result.landmarks && result.landmarks.length > 0) {
          const l = result.landmarks[0].map((p) => ({
            x: round4(p.x),
            y: round4(p.y),
            z: round4(p.z),
            v: round3((p as { visibility?: number }).visibility ?? 0),
          }));
          frames.push({ t: round3(t), l });
        }
      }
    } finally {
      landmarker.close();
      URL.revokeObjectURL(url);
    }

    return frames;
  };

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 동일 파일 재선택 허용
    if (!file) return;

    if (!selectedTrack) {
      alert("먼저 곡을 선택해주세요.");
      return;
    }
    const userId = useAuthStore.getState().user?.userId;
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 1) 영상 길이 검증 (20초 이상 불가)
    let duration = 0;
    try {
      duration = await getVideoDuration(file);
    } catch {
      alert("영상을 불러올 수 없습니다.");
      return;
    }
    if (!Number.isFinite(duration) || duration >= MAX_VIDEO_DURATION) {
      alert(`${MAX_VIDEO_DURATION}초 미만의 영상만 업로드할 수 있습니다.`);
      return;
    }

    // 2) 포즈 분석은 무조건 클라이언트에서 수행 → JSON 생성
    setIsAnalyzing(true);
    handleStopPlayback();
    try {
      const poseData = await extractPoseFromVideoFile(file);
      if (poseData.length < 2) {
        alert(
          "영상에서 동작을 인식하지 못했습니다. 전신이 잘 보이는 영상을 사용해주세요."
        );
        return;
      }

      // 3) JSON 만 백엔드로 전송 (영상 파일은 전송하지 않음)
      const res = await api.post(`practice/${selectedTrack.id}/evaluate`, {
        userId,
        user_pose_data: poseData,
      });
      const data = res.data?.data ?? res.data;
      const userChallengeId = data?.userChallengeId;

      if (userChallengeId != null) {
        navigate(`/feedback/${userChallengeId}`);
      } else {
        navigate("/feedback");
      }
    } catch (err) {
      console.error("업로드 영상 분석/전송 실패", err);
      alert(getApiErrorMessage(err, "영상 분석에 실패했습니다."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressPercent = (progress / highlightDuration) * 100;

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

      {/* 미리 촬영된 영상 업로드용 숨김 input */}
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileChange}
      />

      {!poseReady && (
        <LoadingOverlay>포즈 인식 준비 중...</LoadingOverlay>
      )}

      {/* 업로드 영상 분석 중 오버레이 */}
      {isAnalyzing && (
        <AnalyzingOverlay>
          <AnalyzingText>영상 분석 중...</AnalyzingText>
        </AnalyzingOverlay>
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
            <RetakeButton onClick={handleRetake} disabled={isSending}>다시 촬영하기</RetakeButton>
            <ViewButton onClick={handleViewVideo} disabled={isSending}>
              {isSending ? "전송 중..." : "결과 보기"}
            </ViewButton>
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

              <UploadButton onClick={handleLoadVideoClick} disabled={isAnalyzing}>
                <MusicLabel>🎬 영상 불러오기 (20초 미만)</MusicLabel>
              </UploadButton>

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
                <DurationText>{Math.round(highlightDuration)}s</DurationText>
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