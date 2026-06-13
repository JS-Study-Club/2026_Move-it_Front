import React from "react";
import type { VideoData } from "../types.ui";
import {
  DanceCardContainer,
  CardBackgroundImage,
  CardContent,
  CardTitle,
  CardInfo,
  ReplayButton,
} from "./DanceCard.styles";

type DanceCardProps = VideoData & {
  onReplay?: () => void;
};

const DanceCard: React.FC<DanceCardProps> = ({ title, date, score, thumbnail, onReplay }) => {
  // console.log("DanceCard 렌더링", { title, date, score, thumbnail });
  return (
    <DanceCardContainer>
      <CardBackgroundImage src={thumbnail} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardInfo>
          <span>{date}</span>
          <span>{`${score} score!!`}</span>
        </CardInfo>
        <ReplayButton onClick={onReplay} style={onReplay ? { cursor: "pointer" } : undefined}>
          다시보기
        </ReplayButton>
      </CardContent>
    </DanceCardContainer>
  );
};

export default DanceCard;
