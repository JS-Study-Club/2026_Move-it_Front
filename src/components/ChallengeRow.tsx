import React from "react";
import { useNavigate } from "react-router-dom";
import type { ChallengeSearchResult } from "../types";
import {
  ChallengeRows as ChallengeRowContainer,
  RankNumber,
  ChallengeThumbnail,
  ChallengeInfo,
  ChallengeName,
  ChallengeArtist,
  SelectBtn,
  ThumbnailPlaceholder,
} from "../pages/SearchPage.styles";

interface Props {
  challenge: ChallengeSearchResult;
  rank?: number; // 전달되면 순위 표시, 없으면 생략
}

const ChallengeRow: React.FC<Props> = ({ challenge, rank }) => {
  const navigate = useNavigate();

  // 곡 선택 시 카메라 페이지로 이동하면서 challengeId 를 쿼리 파라미터로 전달합니다.
  // → CameraPage 가 이 값으로 챌린지를 조회해 자동 선택합니다. (다시 고를 필요 없음)
  const handleSelect = () => {
    navigate(`/camera?challengeId=${challenge.id}`);
  };

  const handleShowVideo = () => {
    console.log("영상 재생 버튼 클릭", challenge.video_url);
    if (challenge.video_url) {
      const urlEncoded = encodeURIComponent(challenge.video_url);
      const titleEncoded = encodeURIComponent(challenge.name);
      const artistEncoded = encodeURIComponent(challenge.artist);
      navigate(`/video?videoUrl=${urlEncoded}&title=${titleEncoded}&artist=${artistEncoded}&challengeId=${challenge.id}`, {
        state: { challenge }
      });
    } else {
      alert("영상 URL이 없습니다.");
    }
  };

  return (
    <ChallengeRowContainer>
      {rank !== undefined && <RankNumber>{rank}</RankNumber>}

      {challenge.music_image_url ? (
        <ChallengeThumbnail
          src={challenge.music_image_url}
          alt={challenge.name}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <ThumbnailPlaceholder>🎵</ThumbnailPlaceholder>
      )}

      <ChallengeInfo>
        <ChallengeName>{challenge.name}</ChallengeName>
        <ChallengeArtist>{challenge.artist}</ChallengeArtist>
      </ChallengeInfo>

      <SelectBtn onClick={handleShowVideo}>영상보기</SelectBtn>
      <SelectBtn onClick={handleSelect}>선택</SelectBtn>
    </ChallengeRowContainer>
  );
};

export default ChallengeRow;
