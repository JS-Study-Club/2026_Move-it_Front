import styled from "styled-components";

export interface DeezerTrack {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
  duration: number;
  coverUrl: string; // 👈 추가!
  preview: string;
}

export type SelectedTrack = DeezerTrack;

interface MusicItemProps {
  track: DeezerTrack;
  isSelected: boolean;
  onSelect: (track: SelectedTrack) => void;
}

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #ffffff;
  cursor: pointer;
  &:hover {
    background: #fafafa;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AlbumCover = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  background: #eee;
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TrackTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333333;
`;

const ArtistName = styled.div`
  font-size: 13px;
  color: #888888;
`;

const Duration = styled.div`
  font-size: 12px;
  color: #aaaaaa;
`;

/* 오른쪽 선택 상태 버튼 상자 */
const SelectButton = styled.div<{ $isSelected: boolean }>`
  width: 48px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  /* 선택되었을 때만 파란색 배경 채우기 */
  background: ${({ $isSelected }) => ($isSelected ? "#0066cc" : "transparent")};
`;

/* 화살표 모양 SVG 아이콘 */
const ArrowIcon = styled.svg<{ $isSelected: boolean }>`
  width: 16px;
  height: 16px;
  fill: none;
  stroke: ${({ $isSelected }) => ($isSelected ? "#ffffff" : "#f0f0f0")};
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const MusicItem = ({ track, isSelected, onSelect }: MusicItemProps) => {
  // 초단위 데이터를 00:00 포맷으로 변경
  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <ItemContainer onClick={() => onSelect(track)}>
      <LeftSection>
        <AlbumCover src={track.album.cover_medium} alt={track.title} />
        <InfoBox>
          <TrackTitle>{track.title}</TrackTitle>
          <ArtistName>{track.artist.name}</ArtistName>
          <Duration>{formatDuration(track.duration)}</Duration>
        </InfoBox>
      </LeftSection>

      <SelectButton $isSelected={isSelected}>
        <ArrowIcon $isSelected={isSelected} viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </ArrowIcon>
      </SelectButton>
    </ItemContainer>
  );
};

export default MusicItem;