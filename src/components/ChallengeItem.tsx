import React from 'react';
import type { ChallengeData } from '../types';
import {ChallengeItemContainer, CardHeader, CardThumb, CardTexts, CardTitle, CardSub, StartBtn, CardTags} from './ChallengeItem.styles';

const ChallengeItem: React.FC<ChallengeData> = ({ 
  artist, song, description, thumbnail, participants, duration, uploadDate
}) => {
  return (
    <ChallengeItemContainer>
      <CardHeader>
        <CardThumb>
          <img src={thumbnail} alt="Thumbnail" />
        </CardThumb>
        <CardTexts>
          <CardTitle>{artist} - {song}</CardTitle>
          <CardSub>{description}</CardSub>
        </CardTexts>
      </CardHeader>
      <StartBtn>챌린지 시작</StartBtn>
      <CardTags>
        <span># 조회수 {participants}회</span>
        <span># {duration} 안무</span>
        <span># {uploadDate}</span>
      </CardTags>
    </ChallengeItemContainer>
  );
};

export default ChallengeItem;