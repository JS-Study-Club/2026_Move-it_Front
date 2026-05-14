export interface VideoData{
    id: string;
    title: string;
    date: string;
    score: number;
    thumbnail: string;
}

export interface ChallengeData{
    id: string;
    artist: string;
    song: string;
    description: string;
    participants: string;
    difficulty: 'Easy' | 'Normal' | 'Hard';
    duration: string;
}
export interface FeedbackSection {
  title: string;
  subtitle: string;
  items: string[];
  variant: 'green' | 'pink';
  iconBg: string;
}

export interface FeedbackData {
  comment: string;
  good: FeedbackSection;
  improve: FeedbackSection;
}