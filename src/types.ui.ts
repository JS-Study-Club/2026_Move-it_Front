export interface VideoData {
  id: number;
  title: string;
  date: string;
  score: number;
  thumbnail: string;
  // 피드백 상세(/feedback/:userChallengeId) 진입에 필요한 연습 결과 식별자
  userChallengeId?: number | null;
}

export interface ChallengeData {
  id: number;
  artist: string;
  song: string;
  thumbnail: string;
  description: string;
  participants: number; // 조회수임
  uploadDate: string;
  duration: string;
  video_url: string | null;
}
