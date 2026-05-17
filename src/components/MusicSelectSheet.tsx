import { useState, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import SearchIconImg from "../img/search-icon.svg";
import MusicItem, {
  type DeezerTrack,
  type SelectedTrack,
} from "../components/MusicItem";

// ─── Types ────────────────────────────────────────────────────
interface MusicSelectSheetProps {
  onSelect: (track: SelectedTrack) => void;
  onClose: () => void;
  selectedTrackId?: number;
}

interface DeezerSearchResponse {
  data: any[];
}

// ─── 🌟 인터넷에서 무조건 작동하는 고화질 썸네일 & 실제 사운드 데이터 ───
const DEFAULT_KPOP_TRACKS: any[] = [
  {
    id: 9991,
    title: "Bang Bang (Challenge Ver.)",
    artist: { name: "Ive" },
    album: {
      cover_medium:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
    },
    duration: 20,
    preview:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 9992,
    title: "Really Like You",
    artist: { name: "BABYMONSTER" },
    album: {
      cover_medium:
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60",
    },
    duration: 20,
    preview:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 9993,
    title: "Bubble Gum",
    artist: { name: "NewJeans" },
    album: {
      cover_medium:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
    },
    duration: 20,
    preview:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

// ─── 🌐 CORS 에러 우회 검색 API ───────────────────────────────────────
const searchDeezer = async (query: string): Promise<any[]> => {
  try {
    const res = await fetch(
      `/api-deezer/search?q=${encodeURIComponent(query)}&limit=20`
    );

    if (!res.ok) {
      throw new Error("Deezer API 요청 실패");
    }

    const data: DeezerSearchResponse = await res.json();
    return data.data ?? [];
  } catch (err) {
    console.error("Deezer 검색 에러:", err);
    return [];
  }
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
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setTracks([]);
      return;
    }

    setLoading(true);

    try {
      const results = await searchDeezer(value);
      setTracks(results);
    } catch (err) {
      console.error(err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const displayTracks = query ? tracks : DEFAULT_KPOP_TRACKS;

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
              onChange={handleInputChange}
            />
          </SearchBar>
        </Header>

        <ListContainer>
          {loading && <StatusText>검색 중...</StatusText>}

          {!loading && query && tracks.length === 0 && (
            <StatusText>검색 결과가 없습니다.</StatusText>
          )}

          {!loading && displayTracks.length > 0 && (
            <>
              <SectionLabel>K-pop</SectionLabel>

              {displayTracks.map((track, index) => (
                <div key={`rec-${track.id}`}>
                  <MusicItem
                    track={track as any}
                    isSelected={selectedTrackId === track.id}
                    onSelect={onSelect}
                  />

                  {index < displayTracks.length - 1 && <Divider />}
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