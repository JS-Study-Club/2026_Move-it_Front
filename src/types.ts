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
}

export interface HighScoreChallengeVideo extends ChallengeDataRes {}

export interface RecommendedChallenge extends ChallengeDataRes {}

export interface ChallengeDataRes {
  id: number;
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

export interface VideoData {
  id: number;
  title: string;
  date: string;
  score: number;
  thumbnail: string;
}

export interface ChallengeData {
  id: number;
  artist: string;
  song: string;
  thumbnail: string;
  description: string;
  participants: string;
  uploadDate: string;
  duration: string;
}
export interface YoutubeVideo {
  id: number;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export interface YouTubeItem {
  id: string | { videoId?: string }; // id는 문자열일 수도 있고, 객체일 수도 있음
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
  };
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
