import type { ChallengeData } from "../types.ui";
import type { RecommendedChallenge } from "../types";

export const toChallengeData = (item: RecommendedChallenge): ChallengeData => {
  return {
    id: item.id,
    artist: item.artist,
    song: item.title,
    thumbnail: item.imgUrl,
    description: item.description,
    participants: item.viewCount,
    uploadDate: item.releaseDate,
    duration: "00:00",
  };
};
