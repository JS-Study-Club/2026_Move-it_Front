// mappers/videoMapper.ts

import type { HighScoreChallengeVideo } from "../types";
import type { VideoData } from "../types.ui";

export const toVideoData = (item: HighScoreChallengeVideo): VideoData => {
  return {
    id: item.id,
    title: item.title,
    date: item.releaseDate,
    score: item.score,
    thumbnail: item.imgUrl,
    userChallengeId: item.userChallengeId,
  };
};
