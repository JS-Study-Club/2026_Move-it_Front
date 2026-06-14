import { useRef, useEffect, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { useNavigate, useSearchParams } from "react-router-dom";
import MusicSelectSheet, { toSelectedTrack } from "../components/MusicSelectSheet";
import { type SelectedTrack } from "../components/MusicItem";
import type { ChallengeSearchResult } from "../types";
import Warningimg from "../img/warningimg.svg";
import leftArrow from "../img/leftArrow.svg";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { getApiErrorMessage } from "../utils/apiError";
import {
  Container,
  Stage,
  CameraWrapper,
  StyledVideo,
  StyledCanvas,
  ButtonContainer,
  MusicButton,
  UploadButton,
  HiddenFileInput,
  MusicCover,
  MusicLabel,
  ShutterOuter,
  ShutterInner,
  BackButton,
  BackIcon,
  VolumeRow,
  VolumeSlider,
  PlaybackStatusBox,
  InfoRow,
  MusicInfoText,
  DurationText,
  TimelineContainer,
  ProgressTrack,
  ProgressFill,
  TimelineDot,
  LoadingOverlay,
  AnalyzingOverlay,
  AnalyzingText,
  CountdownOverlay,
  CountdownNumber,
  WarningDimOverlay,
  WarningOverlay,
  WarningIcon,
  WarningText,
  CompleteOverlay,
  CompleteTitle,
  CompleteButtonRow,
  RetakeButton,
  ViewButton,
} from "./CameraPage.styles";

// ─── MediaPipe 리소스 경로 (라이브/업로드 분석 공통) ───────────
const POSE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// 업로드 영상 제약 / 분석 설정
const MAX_VIDEO_DURATION = 21; // 초 — 이 값 이상이면 업로드 불가
const ANALYZE_FPS = 10; // 백엔드 추출 FPS와 동일하게 맞춤
// 라이브 포즈 감지 주기(가장 무거운 작업). 매 프레임(보통 60fps) 대신 이 빈도로만 감지한다.
const DETECT_FPS = 30;
// 노래 페이드 인/아웃 길이(초)
const FADE_DURATION = 1;

// 스켈레톤 드로잉 옵션은 매 프레임 새 객체를 만들지 않도록 상수로 둔다.
const CONNECTOR_STYLE = { color: "#00FF88", lineWidth: 2 };
const LANDMARK_STYLE = { radius: 3, color: "#FF4444", fillColor: "#FF4444" };

// 백엔드 EvaluatePracticeDto.user_pose_data 와 동일한 프레임 형식
type PoseFrame = {
  t: number;
  l: { x: number; y: number; z: number; v: number }[];
};

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

// 음원 파일이 하이라이트 시작 지점(start)보다 짧으면 — 즉 전체 곡이 아니라 이미 잘린
// 하이라이트 클립이거나 데이터가 어긋난 경우 — start 로 seek 하면 파일 끝으로 클램프돼
// 재생하자마자 'ended' 가 발생해 소리가 나지 않는다. 이럴 땐 0 부터 재생한다.
const resolveSeekStart = (duration: number, start: number): number =>
  Number.isFinite(duration) && duration > 0 && start < duration ? start : 0;

// elapsed 시점의 볼륨을 계산: 시작 fd초 동안 0→target(페이드 인),
// 끝 fd초 동안 target→0(페이드 아웃). 녹화가 매우 짧으면 fd 를 total/2 로
// 줄여 페이드 인/아웃이 겹치지 않도록 한다.
const computeFadeVolume = (
  elapsed: number,
  total: number,
  target: number
): number => {
  const fd = Math.min(FADE_DURATION, total / 2);
  if (fd <= 0) return target;
  const factor = Math.max(0, Math.min(1, elapsed / fd, (total - elapsed) / fd));
  return target * factor;
};

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
  // 실제 재생(startPlayback) 시작 여부. 오디오 잠금 해제(unlock) 콜백이
  // 뒤늦게 실행돼 재생을 멈추는 것을 막는 가드.
  const playbackStartedRef = useRef<boolean>(false);
  // UI 리렌더 부하를 줄이기 위한 스로틀/변경 감지용 refs
  const lastUiUpdateRef = useRef<number>(0);
  const showBodyWarningRef = useRef<boolean>(false);
  // DrawingUtils 는 매 프레임 새로 만들지 않고 한 번만 생성해 재사용한다.
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  // 포즈 감지 스로틀용 — 마지막으로 detectForVideo 를 호출한 시점(초)
  const lastDetectTimeRef = useRef<number>(-1);
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
  // 음악 볼륨(0~1). 슬라이더 UI 용 state 와, 콜백/재생 로직에서 최신값을 읽기 위한 ref 를 함께 둔다.
  const [volume, setVolume] = useState<number>(1);
  const volumeRef = useRef<number>(1);

  // 하이라이트 구간 정보가 없을 때 사용할 기본 길이(초)
  const DEFAULT_DURATION = 20;

  // 선택한 챌린지의 촬영(녹화) 길이(초). DB에 저장된 값(없으면 20초)을 사용합니다.
  // 재생/녹화/타임라인 표시에 공통으로 쓰입니다.
  const highlightDuration = selectedTrack
    ? Math.max(1, selectedTrack.duration ?? DEFAULT_DURATION)
    : DEFAULT_DURATION;

  // ─── 카메라 시작 ───────────────────────────────────────────
  useEffect(() => {
    const startCamera = async () => {
      // 9:16 해상도를 강제하면 센서(보통 4:3)를 9:16 으로 맞추느라 화면을 잘라
      // 확대(디지털 줌)된다. 화각을 그대로 쓰기 위해 종횡비/높이는 지정하지 않고
      // 화질을 위해 width 만 힌트로 준다(브라우저가 네이티브 비율로 해상도를 고른다).
      const baseVideo: MediaTrackConstraints = {
        facingMode: "user",
        width: { ideal: 1280 },
      };
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: baseVideo,
            audio: false,
          });
        } catch {
          // 해당 해상도를 지원하지 않는 기기 → 제약 없이 재시도
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        }
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

  // ─── 쿼리 파라미터(challengeId)로 진입 시 해당 챌린지를 자동 선택 ──────────
  useEffect(() => {
    const challengeId = searchParams.get("challengeId");
    if (!challengeId) return;

    let active = true;
    (async () => {
      try {
        const res = await api.get("challenge/music", {
          params: { id: challengeId },
        });
        const data = res.data?.data ?? res.data;
        if (!active || !data?.music_url) return;

        const track = toSelectedTrack(data as ChallengeSearchResult);
        setSelectedTrack(track);

        // 재생 시 빠르게 시작하도록 음원을 미리 로드해 둔다.
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = track.musicUrl;
        audioRef.current.load();
      } catch (e) {
        console.error("챌린지 자동 선택 실패", e);
      }
    })();

    return () => {
      active = false;
    };
    // 최초 진입 시 한 번만 처리하면 충분합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const ctx = canvas.getContext("2d")!;

    // 촬영(재생) 중이 아니면 포즈 분석/스켈레톤 드로잉을 하지 않는다.
    // (불필요한 detectForVideo 호출을 막아 부하도 줄인다)
    if (startTimeRef.current === null) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;

    // 하이라이트 구간 길이만큼만 재생/녹화합니다.
    if (elapsed >= durationRef.current) {
      startTimeRef.current = null;
      setIsPlaying(false);
      setProgress(durationRef.current);
      setShowBodyWarning(false);
      showBodyWarningRef.current = false;
      setIsComplete(true); // ✅ 완료 상태로 전환
      if (audioRef.current) audioRef.current.pause();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // 노래 페이드 인/아웃: 시작 1초 0→목표, 끝 1초 목표→0. (매 프레임 갱신해 부드럽게)
    if (audioRef.current) {
      audioRef.current.volume = computeFadeVolume(
        elapsed,
        durationRef.current,
        volumeRef.current
      );
    }

    // 진행도 UI 는 매 프레임이 아니라 ~10fps 로만 갱신해 리렌더 부하를 줄인다.
    if (elapsed - lastUiUpdateRef.current >= 0.1) {
      lastUiUpdateRef.current = elapsed;
      setProgress(elapsed);
    }

    // 포즈 감지(detectForVideo)는 가장 무거운 작업이므로 ~30fps 로만 수행한다.
    // off-프레임에서는 직전 스켈레톤을 그대로 둬 화면은 부드럽게 유지된다.
    if (elapsed - lastDetectTimeRef.current < 1 / DETECT_FPS) {
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    lastDetectTimeRef.current = elapsed;

    // ── 여기서부터는 촬영 중에만 실행되는 포즈 분석 ──
    // 캔버스 크기는 바뀔 때만 갱신한다. (매 프레임 재설정 시 비트맵이 재할당돼 비싸다)
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    const drawingUtils =
      drawingUtilsRef.current ?? (drawingUtilsRef.current = new DrawingUtils(ctx));
    const result = landmarker.detectForVideo(video, performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detected =
      result.landmarks.length > 0 && isFullBodyVisible(result.landmarks[0]);
    // 값이 바뀔 때만 setState 해 매 프레임 리렌더(잰크)를 막는다.
    if (showBodyWarningRef.current !== !detected) {
      showBodyWarningRef.current = !detected;
      setShowBodyWarning(!detected);
    }

    // 라이브 촬영 중 포즈 프레임 수집 (10fps 샘플링)
    if (result.landmarks.length > 0) {
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
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, CONNECTOR_STYLE);
      drawingUtils.drawLandmarks(landmarks, LANDMARK_STYLE);
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

  // ─── 음악 볼륨 조절 ───────────────────────────────────────────
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    volumeRef.current = v;
    if (audioRef.current) audioRef.current.volume = v;
  };

  // ─── 셔터 버튼 및 카운트다운 로직 ─────────────────────────────
  const handleStartCountdown = () => {
    // 곡이 선택되지 않은 상태에서 촬영을 시작하려 하면 곡 선택을 안내한다.
    if (!selectedTrack) {
      alert("음악을 선택해주세요!");
      return;
    }
    // 이미 카운트다운 중이면 중복 시작을 막는다.
    if (countdown !== null || countdownTimerRef.current !== null) return;

    // 모바일(특히 iOS Safari) 자동재생 정책 우회:
    // 실제 재생(startPlayback)은 카운트다운이 끝난 setInterval 콜백, 즉 사용자 제스처
    // 밖에서 일어나 차단될 수 있다. 그래서 제스처(셔터 클릭) 안에서 소리가 켜진 상태로
    // play() 를 호출해 오디오 요소를 잠금 해제한 뒤 곧바로 일시정지한다.
    playbackStartedRef.current = false;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (audio.src !== selectedTrack.musicUrl) {
      audio.src = selectedTrack.musicUrl;
      audio.load();
    }
    const highlightStart = selectedTrack.startTime ?? 0;
    audio.muted = false;
    audio.volume = volumeRef.current;
    const unlock = audio.play();
    if (unlock && typeof unlock.then === "function") {
      unlock
        .then(() => {
          // 이미 실제 재생(startPlayback)이 시작됐다면 손대지 않는다.
          // (unlock 콜백이 뒤늦게 실행돼 음악을 멈추는 문제 방지)
          if (playbackStartedRef.current) return;
          audio.pause();
          // 하이라이트 시작 지점을 미리 seek해 두면 카운트다운(3초) 동안 그 구간이
          // 버퍼링돼, 실제 재생 시 seek로 인한 끊김이 줄어든다. (파일이 더 짧으면 0 으로 보정)
          try {
            audio.currentTime = resolveSeekStart(audio.duration, highlightStart);
          } catch {
            /* 메타데이터 미로드 등으로 실패 시 무시 */
          }
        })
        .catch(() => {
          /* 잠금 해제 실패는 무시 (실제 재생 단계에서 다시 시도) */
        });
    }

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
    // 녹화 길이는 DB에 저장된 챌린지 길이(초)를 따른다. 미설정이면 기본 20초.
    durationRef.current = Math.max(1, selectedTrack.duration ?? DEFAULT_DURATION);

    setIsPlaying(true);
    setProgress(0);
    poseFramesRef.current = [];
    lastSampleTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    lastDetectTimeRef.current = -1;
    showBodyWarningRef.current = false;
    startTimeRef.current = performance.now();
    // 이 시점 이후로는 unlock 콜백이 재생을 멈추지 못하게 한다.
    playbackStartedRef.current = true;

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.volume = volumeRef.current;

    // 하이라이트 시작 지점으로 이동 후 재생
    const beginAtHighlight = () => {
      // unlock 단계에서 음소거해 둔 상태일 수 있으므로 반드시 해제한다.
      audio.muted = false;
      // 페이드 인 시작점: 0 에서 시작해 rAF 루프가 목표 볼륨까지 서서히 올린다.
      audio.volume = 0;
      // 파일이 하이라이트 시작 지점보다 짧으면 0 부터 재생 (resolveSeekStart 참고)
      try {
        audio.currentTime = resolveSeekStart(audio.duration, start);
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
    showBodyWarningRef.current = false;
    startTimeRef.current = null;
    playbackStartedRef.current = false;
    if (audioRef.current) audioRef.current.pause();
  };

  const handleRetake = () => {
    setIsComplete(false);
    setSelectedTrack(null);
    setProgress(0);
    setShowBodyWarning(false);
  };

  // 인증 쿠키는 유효하지만 메모리(zustand)의 user 가 비어 userId 가 없을 수 있다.
  // (새로고침 후 카메라로 진입, SearchPage→/camera 직접 이동 등 store 를 채우는
  //  Login/Main 페이지를 거치지 않은 경우) → 서버에서 유저 정보를 다시 받아 채운다.
  const ensureUserId = async (): Promise<string | null> => {
    const cached = useAuthStore.getState().user?.userId;
    if (cached) return cached;
    try {
      const res = await api.get("pages/my");
      const u = res.data?.data?.user;
      const userId: string | undefined = u?.userId ?? u?.user_id;
      if (userId) {
        useAuthStore.getState().setUser(u);
        return userId;
      }
    } catch (e) {
      console.error("유저 정보 조회 실패", e);
    }
    return null;
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

    const userId = await ensureUserId();
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
    const userId = await ensureUserId();
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
      {/* 카메라(영상+스켈레톤)만 9:16 비율 무대 안에 둔다. 메뉴/버튼은 전체 화면 사용 */}
      <Stage>
        <CameraWrapper>
          <StyledVideo ref={videoRef} autoPlay playsInline muted />
          <StyledCanvas ref={canvasRef} />
        </CameraWrapper>
      </Stage>

      {/* 좌상단 뒤로가기 */}
      <BackButton onClick={() => navigate(-1)} aria-label="뒤로가기">
        <BackIcon src={leftArrow} alt="뒤로" />
      </BackButton>

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

              {/* 음악 볼륨 조절 (곡 선택 시 노출) */}
              {selectedTrack && (
                <VolumeRow>
                  <MusicLabel>🔊</MusicLabel>
                  <VolumeSlider
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  />
                </VolumeRow>
              )}

              <UploadButton onClick={handleLoadVideoClick} disabled={isAnalyzing}>
                <MusicLabel>🎬 영상 불러오기 (20초 미만)</MusicLabel>
              </UploadButton>

              <ShutterOuter onClick={handleStartCountdown}>
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
