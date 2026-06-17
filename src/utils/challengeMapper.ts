import type { ChallengeData } from "../types.ui";
import type { RecommendedChallenge } from "../types";

const formatDuration = (sec?: number) => {
  if (!sec) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const toChallengeData = (item: RecommendedChallenge): ChallengeData => {
  return {
    id: item.id,
    artist: item.artist,
    song: item.title,
    thumbnail: item.imgUrl,
    description: item.description,
    participants: item.viewCount,
    uploadDate: item.releaseDate,
    video_url: item.video_url,
    duration: formatDuration(item.length),
  };
};
