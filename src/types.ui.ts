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
  participants: number; // 조회수임
  uploadDate: string;
  duration: string;
}
