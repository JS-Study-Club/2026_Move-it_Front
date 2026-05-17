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
    thumbnail: string;
    description: string;
    participants: string;
    uploadDate: string;
    duration: string;
}
export interface YoutubeVideo {
    id: string;
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
  variant: 'green' | 'pink';
  iconBg: string;
}

export interface FeedbackData {
  comment: string;
  good: FeedbackSection;
  improve: FeedbackSection;
}