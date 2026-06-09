import React from "react";
import type { VideoData } from "../types";
import {
  DanceCardContainer,
  CardBackgroundImage,
  CardContent,
  CardTitle,
  CardInfo,
  ReplayButton,
} from "./DanceCard.styles";

const DanceCard: React.FC<VideoData> = ({ title, date, score, thumbnail }) => {
  return (
    <DanceCardContainer>
      <CardBackgroundImage src={thumbnail} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardInfo>
          <span>{date}</span>
          <span>{`${score} score!!`}</span>
        </CardInfo>
        <ReplayButton>다시보기</ReplayButton>
      </CardContent>
    </DanceCardContainer>
  );
};

export default DanceCard;
