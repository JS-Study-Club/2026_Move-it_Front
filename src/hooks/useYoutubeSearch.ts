import { useState, useEffect, useRef } from 'react';
import type { YoutubeVideo, YouTubeItem } from '../types';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export const useYoutubeSearch = (query: string) => {
    // ── 실시간 검색 결과 ──────────────────────────────────────────────────
    const [searchResults, setSearchResults] = useState<YoutubeVideo[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false); // 결과 없음 표시 타이밍 제어용
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);

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

    const clearSearch = () => {
        setSearchResults([]);
        setHasSearched(false);
        setSearchError(null);
        setNextPageToken(null);
    };

    return { searchResults, searchLoading, searchError, hasSearched, nextPageToken, searchYoutube, clearSearch };
};


// ── YouTube Data API v3: 인기 챌린지 ─────────────────────────────────
export const usePopularChallenges = () => {
    const [popularChallenges, setPopularChallenges] = useState<YoutubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return { popularChallenges, loading, error };
};
