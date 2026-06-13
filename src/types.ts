export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

export interface HomeUserInfo {
  username: string;
  teacherId: number;
  level: number;
  levelXp: number;
  levelTitle: string;
  // 현재 레벨 안에서의 진행률(0~100). 진행바가 이 값을 사용합니다.
  levelProgress: number;
  // 연습 결과 조회(/practice/results/user/:userId) 등에 쓰이는 외부 유저 식별자.
  // 백엔드 유저 정보 응답에 포함되어 있을 경우에만 채워집니다.
  userId?: string;
}

export interface HighScoreChallengeVideo extends ChallengeDataRes {}

export interface RecommendedChallenge extends ChallengeDataRes {}

export interface ChallengeDataRes {
  id: number;
  // 연습 결과 식별자(높은 점수 댄스 영상에만 포함). 피드백 상세 진입에 사용됩니다.
  userChallengeId?: number | null;
  artist: string;
  name: string;
  title: string;
  genre: string;
  score: number;
  musicUrl: string;
  imgUrl: string;
  releaseDate: string;
  viewCount: number;
  description: string;
}

export interface PageHomeResponse {
  user: HomeUserInfo;
  highScoreDance: HighScoreChallengeVideo[];
  recommendedChallengeList: RecommendedChallenge[];
}

export interface MyPageData {
  user: HomeUserInfo;
  recentPracticeDance: RecentChallenges[];
}

export interface RecentChallenges extends ChallengeDataRes {}

// ── 챌린지 검색/추천 결과 (백엔드 GET /challenge/search, /challenge/suggest/* 응답) ──
// 백엔드 ChallengeService.formatResponse 가 내려주는 형태와 1:1 대응됩니다.
export interface ChallengeSearchResult {
  id: number;
  name: string; // 곡 제목
  title: string;
  description: string;
  difficulty: string;
  view_count: number;
  start_time: number;
  end_time: number | null;
  score: number;
  createdAt: string;
  updatedAt: string;
  genre: string;
  artist: string;
  length: number;
  music_url: string;
  music_image_url: string | null; // 썸네일
  release_date: string | null;
}
export interface FeedbackSection {
  title: string;
  subtitle: string;
  items: string[];
  variant: "green" | "pink";
  iconBg: string;
}

export interface FeedbackData {
  comment: string;
  good: FeedbackSection;
  improve: FeedbackSection;
}

// ── 연습 결과(포즈 평가) 응답 ─────────────────────────────────
// GET /practice/result/:userChallengeId
// GET /practice/results/user/:userId
export type PracticeCategory = "rhythm" | "accuracy" | "expression";

export interface PracticeCategoryFeedback {
  isGood: boolean;
  message: string;
}

export interface PracticeFeedback {
  overall: string;
  details: Record<PracticeCategory, PracticeCategoryFeedback>;
}

export interface PracticeScores {
  total: number;
  rhythm: number;
  accuracy: number;
  expression: number;
}

export interface PracticeResultData {
  scores: PracticeScores;
  feedback: PracticeFeedback;
}

// 백엔드 UserChallenge 엔티티 형태(필요한 필드만 선언)
export interface PracticeResult {
  id: number; // userChallengeId
  score: number;
  comment: string;
  data: PracticeResultData;
  createdAt: string;
  challenge?: {
    id: number;
    name: string;
    music?: {
      music_image_url?: string | null;
    };
  };
}
