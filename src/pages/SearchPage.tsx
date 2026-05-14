import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import search from '../img/search-icon.svg';

import {
    SearchPageContainer, SearchBarWrapper, SearchIcon,
    SearchInput, ClearBtn, SectionBlock, SectionTitle, TagRow, RecentTag, DeleteBtn, SuggestTag, ChallengeList,
    ChallengeRow, RankNumber, ChallengeThumbnail, ChallengeInfo, ChallengeName, ChallengeArtist,
    SelectBtn, StatusText, ThumbnailPlaceholder, NoResultText,
} from './SearchPage.styles';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// 추천 검색어 (기획 단계에서 큐레이션)
const SUGGESTED_TAGS = [
    'Magnetic', 'Next Level', 'Really Like You', 'Attention',
    '신나는', '색시한', 'K-POP',
];

// localStorage 키
const RECENT_SEARCHES_KEY = 'moveit_recent_searches';
const MAX_RECENT = 8;

/* 이미지에 보이는 &#39;나 &amp; 같은 문자는 YouTube API가 데이터를 넘겨줄 때 사용하는 HTML 엔티티(Entity)입니다. 
/* 브라우저가 이것을 일반 텍스트(예: '나 &)로 인식하게 하려면 렌더링 전에 디코딩(Decoding) 과정이 필요합니다. */
const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

interface YoutubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
}

interface YouTubeItem {
    id: string | { videoId?: string }; // id는 문자열일 수도 있고, 객체일 수도 있음
    snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: {
            medium?: {
                url?: string;
            };
        };
    };
}

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [popularChallenges, setPopularChallenges] = useState<YoutubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

    // ── 실시간 검색 결과 ──────────────────────────────────────────────────
    const [searchResults, setSearchResults] = useState<YoutubeVideo[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false); // 결과 없음 표시 타이밍 제어용
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── 최근 검색어: localStorage에서 불러오기 ──────────────────────────────
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            return saved ? JSON.parse(saved) : []; // 저장된 게 있으면 가져오고, 없으면 빈 배열
        } catch {
            return [];
        }
    });

    const saveRecentSearches = (list: string[]) => {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
        setRecentSearches(list);
    };

    const addRecentSearch = (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;
        const filtered = recentSearches.filter((k) => k !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
        saveRecentSearches(updated);
    };

    const removeRecentSearch = (keyword: string) => {
        const updated = recentSearches.filter((k) => k !== keyword);
        saveRecentSearches(updated);
    };

    // ── 검색 실행 (태그·최근검색어 클릭 시) ─────────────────────────────
    const handleSearch = useCallback(
        (keyword: string) => {
            if (!keyword.trim()) return;
            addRecentSearch(keyword);
            setQuery(keyword); // query가 바뀌면 아래 useEffect가 debounce 검색 실행
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [recentSearches]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            addRecentSearch(query); // Enter 시 최근 검색어 저장
        }
    };

    const searchYoutube = async (searchKeyword: string, pageToken: string | null = null) => {
        setSearchLoading(true);
        setSearchError(null);
        setHasSearched(true);
        try {
            const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
            searchUrl.searchParams.set('part', 'snippet');
            searchUrl.searchParams.set('q', `${searchKeyword} kpop dance challenge`);
            searchUrl.searchParams.set('type', 'video');
            searchUrl.searchParams.set('videoCategoryId', '10');
            searchUrl.searchParams.set('order', 'viewCount');
            searchUrl.searchParams.set('maxResults', '10');
            searchUrl.searchParams.set('regionCode', 'KR');
            searchUrl.searchParams.set('relevanceLanguage', 'ko');
            searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

            if (pageToken) {
                searchUrl.searchParams.set('pageToken', pageToken);
            }

            const res = await fetch(searchUrl.toString());
            if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

            const data = await res.json();
            const videos: YoutubeVideo[] = (data.items || []).map((item: YouTubeItem) => {
                const resolvedId = typeof item.id === 'string' ? item.id : (item.id?.videoId ?? '');
                return {
                    id: resolvedId,
                    title: item.snippet?.title ?? '',
                    channelTitle: item.snippet?.channelTitle ?? '',
                    thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? '',
                };
            });

            if (pageToken) { // 🌟 1. 티켓(pageToken)이 있었다면 이어붙이고, 없었다면 새로 덮어쓰기!
                setSearchResults(prev => [...prev, ...videos]);
            } else {
                setSearchResults(videos);
            }

            // 🌟 2. 다음 페이지 티켓 저장하기 (그래야 다음에 또 더 보기를 누를 수 있음)
            setNextPageToken(data.nextPageToken || null);

        } catch (err) {
            setSearchError('검색 중 오류가 발생했습니다.');
            setSearchResults([]);
            console.error(err);
        } finally {
            setSearchLoading(false);
        }
    }

    // ── 실시간 검색: query 변경 → debounce 300ms → YouTube API 호출 ──────
    useEffect(() => {
        // 입력이 비면 검색 결과 초기화 → 기본 화면(인기 챌린지)으로 복귀
        if (!query.trim()) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            searchYoutube(query, null);
        }, 2000);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    // ── YouTube Data API v3: 인기 챌린지 ─────────────────────────────────
    useEffect(() => {
        const fetchPopularChallenges = async () => {
            try {
                // K-POP 챌린지 관련 인기 영상 검색
                const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
                searchUrl.searchParams.set('part', 'snippet');
                searchUrl.searchParams.set('q', 'kpop dance challenge 2025');
                searchUrl.searchParams.set('type', 'video');
                searchUrl.searchParams.set('videoCategoryId', '10'); // Music
                searchUrl.searchParams.set('order', 'viewCount');
                searchUrl.searchParams.set('maxResults', '5');
                searchUrl.searchParams.set('regionCode', 'KR');
                searchUrl.searchParams.set('relevanceLanguage', 'ko');
                searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

                const res = await fetch(searchUrl.toString());
                if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

                const data = await res.json();

                const videos: YoutubeVideo[] = (data.items || []).map((item: YouTubeItem) => {
                    // 유튜브 API는 검색 결과일 때는 id가 객체이고, 인기 영상일 때는 id가 문자열
                    const resolvedId = typeof item.id === 'string' ? item.id : (item.id?.videoId ?? '');

                    return {
                        id: resolvedId,
                        title: item.snippet?.title ?? '',
                        channelTitle: item.snippet?.channelTitle ?? '',
                        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? '',
                    };
                });

                setPopularChallenges(videos);
            } catch (err) {
                setError('인기 챌린지를 불러오지 못했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularChallenges();
    }, []);

    // ── 렌더링 ────────────────────────────────────────────────────────────
    return (
        <SearchPageContainer>
            <Header />

            {/* 검색창 */}
            <SearchBarWrapper>
                <SearchIcon> <img src={search} /> </SearchIcon>
                <SearchInput
                    type="text"
                    placeholder="찾고있는 댄스 챌린지를 입력해주세요"
                    value={query}
                    onChange={(e) => {
                        const val = e.target.value;
                        setQuery(val);

                        // 🌟 글자가 모두 지워지면 여기서 즉시 상태를 비워줍니다!
                        if (!val.trim()) {
                            setSearchResults([]);
                            setHasSearched(false);
                            setSearchError(null);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
                {/* 입력 내용 초기화 버튼 */}
                {query && (
                    <ClearBtn onClick={() => {
                        setQuery('');

                        // 🌟 X 버튼을 눌렀을 때도 여기서 즉시 상태를 비워줍니다!
                        setSearchResults([]);
                        setHasSearched(false);
                        setSearchError(null);
                    }}>✕</ClearBtn>
                )}
            </SearchBarWrapper>

            {/* ── 검색 모드: 입력값이 있을 때 ── */}
            {query.trim() ? (
                <SectionBlock>
                    <SectionTitle>"{query}" 검색 결과</SectionTitle>

                    {searchLoading && <StatusText>검색 중...</StatusText>}
                    {searchError && <StatusText>⚠️ {searchError}</StatusText>}

                    {!searchLoading && hasSearched && searchResults.length === 0 && (
                        <NoResultText>
                            검색 결과가 없습니다.<br />다른 키워드로 시도해보세요 🕺
                        </NoResultText>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                        <ChallengeList>
                            {searchResults.map((video, idx) => (
                                <ChallengeRow key={`${video.id}-${idx}`}>
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
                                    <SelectBtn
                                        onClick={() =>
                                            window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')
                                        }
                                    >
                                        곡 선택하기
                                    </SelectBtn>
                                </ChallengeRow>
                            ))}

                            {nextPageToken && (
                                <SelectBtn onClick={() => searchYoutube(query, nextPageToken)}>
                                    {searchLoading ? '불러오는 중...' : '결과 더 보기 ▼'}
                                </SelectBtn>
                            )}
                        </ChallengeList>
                    )}
                </SectionBlock>

            ) : (
                /* ── 기본 화면: 입력값이 없을 때 ── */
                <>
                    {/* 최근 검색어 */}
                    {recentSearches.length > 0 && (
                        <SectionBlock>
                            <SectionTitle>최근 검색어</SectionTitle>
                            <TagRow>
                                {recentSearches.map((keyword) => (
                                    <RecentTag key={keyword} onClick={() => handleSearch(keyword)}>
                                        {keyword}
                                        <DeleteBtn
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRecentSearch(keyword);
                                            }}
                                        >
                                            ✕
                                        </DeleteBtn>
                                    </RecentTag>
                                ))}
                            </TagRow>
                        </SectionBlock>
                    )}

                    {/* 추천 검색어 */}
                    <SectionBlock>
                        <SectionTitle>추천 검색어</SectionTitle>
                        <TagRow>
                            {SUGGESTED_TAGS.map((tag) => (
                                <SuggestTag key={tag} onClick={() => handleSearch(tag)}>
                                    {tag}
                                </SuggestTag>
                            ))}
                        </TagRow>
                    </SectionBlock>

                    {/* 인기 챌린지 */}
                    <SectionBlock>
                        <SectionTitle>인기 챌린지</SectionTitle>

                        {loading && <StatusText>인기 챌린지를 불러오는 중...</StatusText>}
                        {error && <StatusText>⚠️ {error}</StatusText>}

                        {!loading && !error && (
                            <ChallengeList>
                                {popularChallenges.map((video, idx) => (
                                    <ChallengeRow key={`${video.id}-${idx}`}>
                                        <RankNumber>{idx + 1}</RankNumber>

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

                                        <SelectBtn
                                            onClick={() =>
                                                window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')
                                            }
                                        >
                                            곡 선택하기
                                        </SelectBtn>
                                    </ChallengeRow>
                                ))}
                            </ChallengeList>
                        )}
                    </SectionBlock>
                </>
            )}
        </SearchPageContainer>
    );
};

export default SearchPage;