import React from 'react';
import type { YoutubeVideo } from '../types';
import {
    ChallengeRows as ChallengeRowContainer, RankNumber, ChallengeThumbnail, ChallengeInfo,
    ChallengeName, ChallengeArtist, SelectBtn, ThumbnailPlaceholder,
} from '../pages/SearchPage.styles';

/* 이미지에 보이는 &#39;나 &amp; 같은 문자는 YouTube API가 데이터를 넘겨줄 때 사용하는 HTML 엔티티(Entity)입니다. 
/* 브라우저가 이것을 일반 텍스트(예: '나 &)로 인식하게 하려면 렌더링 전에 디코딩(Decoding) 과정이 필요합니다. */
const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

interface Props {
    video: YoutubeVideo;
    rank?: number; // 전달되면 순위 표시, 없으면 생략
}

const ChallengeRow: React.FC<Props> = ({ video, rank }) => {
    const handleSelect = () => {
        window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    };

    return (
        <ChallengeRowContainer>
            {rank !== undefined && <RankNumber>{rank}</RankNumber>}

            {video.thumbnailUrl ? (
                <ChallengeThumbnail
                    src={video.thumbnailUrl}
                    alt={video.title}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <ThumbnailPlaceholder>🎵</ThumbnailPlaceholder>
            )}

            <ChallengeInfo>
                <ChallengeName>{decodeHTMLEntities(video.title)}</ChallengeName>
                <ChallengeArtist>{decodeHTMLEntities(video.channelTitle)}</ChallengeArtist>
            </ChallengeInfo>

            <SelectBtn onClick={handleSelect}>곡 선택하기</SelectBtn>
        </ChallengeRowContainer>
    );
};

export default ChallengeRow;