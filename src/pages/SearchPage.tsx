import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import ChallengeRow from '../components/ChallengeRow';
import { useYoutubeSearch, usePopularChallenges } from '../hooks/useYoutubeSearch';
import search from '../img/search-icon.svg';
import Nav from '../components/Nav';

import {
    SearchPageContainer, SearchBarWrapper, SearchIcon,
    SearchInput, ClearBtn, SectionBlock, SectionTitle, TagRow, RecentTag, DeleteBtn, SuggestTag, ChallengeList,
    SelectBtn, StatusText, NoResultText,
} from './SearchPage.styles';

// 추천 검색어 (기획 단계에서 큐레이션)
const SUGGESTED_TAGS = [
    'Magnetic', 'Next Level', 'Really Like You', 'Attention',
    '신나는', '색시한', 'K-POP',
];

// 최근 검색어 localStorage 키
const RECENT_SEARCHES_KEY = 'moveit_recent_searches';
const MAX_RECENT = 8;

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');

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

    const { searchResults, searchLoading, searchError, hasSearched, nextPageToken, searchYoutube, clearSearch } = useYoutubeSearch(query);
    const { popularChallenges, loading, error } = usePopularChallenges();

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
                        if (!val.trim()) { clearSearch(); }
                    }}
                    onKeyDown={handleKeyDown}
                />
                {/* 입력 내용 초기화 버튼 */}
                {query && (
                    <ClearBtn onClick={() => {
                        setQuery('');

                        // 🌟 X 버튼을 눌렀을 때도 여기서 즉시 상태를 비워줍니다!
                        clearSearch();
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
                                <ChallengeRow key={`${video.id}-${idx}`} video={video} />
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
                                    <ChallengeRow key={`${video.id}-${idx}`} video={video} rank={idx + 1} />
                                ))}
                            </ChallengeList>
                        )}
                    </SectionBlock>
                </>
            )}
            <Nav />
        </SearchPageContainer>
    );
};

export default SearchPage;