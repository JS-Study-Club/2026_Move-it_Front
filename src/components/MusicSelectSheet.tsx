import { useState } from "react";
import styled, { keyframes } from "styled-components";
import SearchIconImg from "../img/search-icon.svg";
import MusicItem, { type SelectedTrack } from "../components/MusicItem";
import {
  useChallengeSearch,
  usePopularChallenges,
} from "../hooks/useChallengeSearch";
import type { ChallengeSearchResult } from "../types";

// ─── Types ────────────────────────────────────────────────────
interface MusicSelectSheetProps {
  onSelect: (track: SelectedTrack) => void;
  onClose: () => void;
  selectedTrackId?: number;
}

// 백엔드 챌린지 → 카메라 재생용 SelectedTrack 변환
export const toSelectedTrack = (c: ChallengeSearchResult): SelectedTrack => {
  const startTime = c.start_time ?? 0;
  // end_time 이 없으면 전체 길이로 대체합니다.
  const endTime =
    c.end_time != null ? c.end_time : startTime + (c.length ?? 0);
  return {
    id: c.id,
    title: c.name,
    artist: c.artist,
    coverUrl: c.music_image_url ?? "",
    musicUrl: c.music_url,
    startTime,
    endTime,
    length: c.length ?? 0,
    // 촬영(녹화) 길이(초). 백엔드 미설정 시 20초 기본.
    duration: c.duration ?? 20,
  };
};

// ─── Animations ───────────────────────────────────────────────
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeInOverlay = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ─── Styled Components ────────────────────────────────────────
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
  animation: ${fadeInOverlay} 0.22s ease forwards;
`;

const Sheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 40px 40px 0 0;
  max-height: 85vh;
  overflow: hidden;
  animation: ${slideUp} 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards;
`;

const Handle = styled.div`
  width: 40px;
  height: 5px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 16px auto 0;
  flex-shrink: 0;
`;

const Header = styled.div`
  background: #fff;
  padding: 20px 24px 10px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-family: "Galmuri11", sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111111;
  text-align: center;
  margin: 0 0 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f4f4;
  border-radius: 24px;
  padding: 12px 18px;
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
  user-select: none;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;
  color: #333;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const ListContainer = styled.div`
  overflow-y: auto;
  flex: 1;
  padding-bottom: 30px;
  background: #ffffff;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SectionLabel = styled.div`
  font-family: "Galmuri11", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #555555;
  padding: 16px 24px 8px;
  background: #ffffff;
`;

const Divider = styled.div`
  height: 1px;
  background: #f8f8f8;
  margin: 0 24px;
`;

const StatusText = styled.div`
  font-family: "Galmuri11", sans-serif;
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 40px 20px;
`;

// ─── Component ────────────────────────────────────────────────
const MusicSelectSheet = ({
  onSelect,
  onClose,
  selectedTrackId,
}: MusicSelectSheetProps) => {
  const [query, setQuery] = useState<string>("");

  // 백엔드에서 검색/인기 챌린지를 가져옵니다.
  const { searchResults, searchLoading, hasSearched } =
    useChallengeSearch(query);
  const { popularChallenges, loading: popularLoading } = usePopularChallenges();

  const isSearching = query.trim().length > 0;
  const rawList: ChallengeSearchResult[] = isSearching
    ? searchResults
    : popularChallenges;
  const tracks = rawList.map(toSelectedTrack);
  const listLoading = isSearching ? searchLoading : popularLoading;

  return (
    <>
      <Overlay onClick={onClose} />

      <Sheet>
        <Handle />

        <Header>
          <Title>챌린지 음악 선택</Title>

          <SearchBar>
            <SearchIcon src={SearchIconImg} alt="search" />

            <SearchInput
              placeholder="찾고있는 댄스챌린지를 입력해주세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchBar>
        </Header>

        <ListContainer>
          {listLoading && <StatusText>불러오는 중...</StatusText>}

          {!listLoading &&
            isSearching &&
            hasSearched &&
            tracks.length === 0 && (
              <StatusText>검색 결과가 없습니다.</StatusText>
            )}

          {!listLoading && !isSearching && tracks.length === 0 && (
            <StatusText>등록된 챌린지가 없습니다.</StatusText>
          )}

          {!listLoading && tracks.length > 0 && (
            <>
              <SectionLabel>
                {isSearching ? "검색 결과" : "인기 챌린지"}
              </SectionLabel>

              {tracks.map((track, index) => (
                <div key={track.id}>
                  <MusicItem
                    track={track}
                    isSelected={selectedTrackId === track.id}
                    onSelect={onSelect}
                  />

                  {index < tracks.length - 1 && <Divider />}
                </div>
              ))}
            </>
          )}
        </ListContainer>
      </Sheet>
    </>
  );
};

export default MusicSelectSheet;
