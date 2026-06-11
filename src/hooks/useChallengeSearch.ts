import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api/axios";
import type { ChallengeSearchResult } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

// 백엔드 응답 봉투({ success, status, data })에서 data 를 안전하게 꺼냅니다.
function unwrap<T>(res: { data?: { data?: T } }): T | undefined {
  return res?.data?.data ?? (res?.data as T | undefined);
}

// ── 챌린지 검색: GET /challenge/search?keyword= ─────────────────────────
export const useChallengeSearch = (query: string) => {
  const [searchResults, setSearchResults] = useState<ChallengeSearchResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchChallenges = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const res = await api.get("challenge/search", {
        params: { keyword: trimmed },
      });
      const list = unwrap<ChallengeSearchResult[]>(res) ?? [];
      setSearchResults(Array.isArray(list) ? list : []);
    } catch (err) {
      setSearchError(getApiErrorMessage(err, "검색 중 오류가 발생했습니다."));
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 입력값이 바뀌면 디바운스 후 검색
  useEffect(() => {
    if (!query.trim()) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchChallenges(query);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, searchChallenges]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    hasSearched,
    searchChallenges,
    clearSearch,
  };
};

// ── 인기 챌린지: GET /challenge/suggest/yearly ─────────────────────────
export const usePopularChallenges = () => {
  const [popularChallenges, setPopularChallenges] = useState<
    ChallengeSearchResult[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("challenge/suggest/yearly", {
          params: { limit: 5 },
        });
        const list = unwrap<ChallengeSearchResult[]>(res) ?? [];
        if (active) setPopularChallenges(Array.isArray(list) ? list : []);
      } catch (err) {
        if (active)
          setError(getApiErrorMessage(err, "인기 챌린지를 불러오지 못했습니다."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { popularChallenges, loading, error };
};

// ── 추천 검색어: GET /challenge/recommend_keyword ──────────────────────
export const useRecommendKeywords = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("challenge/recommend_keyword");
        const list = unwrap<string[]>(res) ?? [];
        if (active) setKeywords(Array.isArray(list) ? list : []);
      } catch (err) {
        // 추천 검색어는 부가 기능이라 실패해도 조용히 빈 배열 유지
        console.error("추천 검색어 로드 실패:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { keywords, loading };
};
