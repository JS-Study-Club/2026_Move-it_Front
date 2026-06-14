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

      <SelectBtn onClick={handleSelect}>곡 선택하기</SelectBtn>
    </ChallengeRowContainer>
  );
};

export default ChallengeRow;
