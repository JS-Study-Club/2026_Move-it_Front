import styled from "styled-components";

export const SearchPageContainer = styled.div`
  padding: 20px 20px 100px 20px;
  min-height: 100vh;
`;
// ─── 검색창 ────────────────────────────────────────────────────────────────
export const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #F5F5F5;
  border-radius: 20px;
  padding: 10px 16px;
  gap: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const SearchIcon = styled.span`
  width: 24px;
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 13px;
  color: #333;
  background: transparent;
  &::placeholder {
    color: #aaa;
    font-size: 12px;
  }
`;

// ─── 섹션 공통 ──────────────────────────────────────────────────────────────
export const SectionBlock = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

export const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 400;
  line-height: 22px
  color: #000;
  margin-bottom: 10px;
`;

// ─── 최근 검색어 태그 ─────────────────────────────────────────────────────
export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const RecentTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 45px;
  padding: 2px 10px;
  color: #333;
  border: 1px solid #9A9A9A;
  cursor: pointer;

  font-size: 10px;
  font-weight: 400;
  line-height: 22px;
`;

export const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  &:hover { color: #666; }
`;

// ─── 추천 검색어 태그 ─────────────────────────────────────────────────────
export const SuggestTag = styled.button`
  border: none;
  border-radius: 45px;
  background: #DAF0FF;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 400;
  line-height: 22px;
  color: #106AA9;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: rgba(16, 106, 169, 0.15);
    border-color: #106aa9;
  }
`;

// ─── 인기 챌린지 리스트 ───────────────────────────────────────────────────
export const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ChallengeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 14px;
  padding: 10px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

export const RankNumber = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #106aa9;
  min-width: 20px;
  text-align: center;
`;

export const ChallengeThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #ddd;
`;

export const ChallengeInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const ChallengeName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChallengeArtist = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

export const SelectBtn = styled.button`
  background-color: #106aa9;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  height: 40px;
`;

// ─── 로딩 / 에러 ──────────────────────────────────────────────────────────
export const StatusText = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  padding: 20px 0;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #87ceeb, #5a9630);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;
// ─── 검색창 클리어 버튼 ───────────────────────────────────────────────────
export const ClearBtn = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  &:hover { color: #555; }
`;

// ─── 검색 결과 없음 ───────────────────────────────────────────────────────
export const NoResultText = styled.p`
  text-align: center;
  color: #999;
  font-size: 13px;
  line-height: 1.7;
  padding: 40px 0;
`;