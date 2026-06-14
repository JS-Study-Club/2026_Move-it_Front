//최근 연습한 춤
import { useRef, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import DanceCard from "./DanceCard";
import {
  ContentSection,
  SectionTitle,
  HorizontalScroll,
  ScrollIndicatorTrack,
  ScrollIndicatorBar,
} from "../pages/MainPage.styles";

import type { VideoData } from "../types.ui";
interface Props {
  title: string;
  videos?: VideoData[];
  // 전달되면 각 카드의 "다시보기"가 클릭 가능해집니다. (연습 결과 다시보기 등)
  onCardClick?: (video: VideoData) => void;
  // 정렬 기준: "score"(점수 높은 순, 기본) | "recent"(최근 연습 순)
  sortBy?: "score" | "recent";
}

export default function RecentDanceSection({
  title,
  videos,
  onCardClick,
  sortBy = "score",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const sortedVideos = useMemo(
    () =>
      [...(videos ?? [])].sort((a, b) =>
        sortBy === "recent"
          ? (b.date ?? "").localeCompare(a.date ?? "") // 날짜 내림차순(최신 먼저)
          : b.score - a.score
      ),
    [videos, sortBy]
  );
  const isEmpty = sortedVideos.length === 0;

  // 스크롤 가능 여부 판정 — 인디케이터 바(barRef) 존재와 무관하게 항상 동작해야 한다.
  // (이전 구현은 barEl 이 없으면 early-return 했는데, barEl 은 isScrollable=true 일 때만
  //  렌더되므로 인디케이터가 영원히 나타나지 못하는 버그가 있었음)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const checkScrollable = () => {
      const { scrollWidth, clientWidth } = scrollEl;
      setIsScrollable(scrollWidth > clientWidth);
    };

    checkScrollable();
    const timer = window.setTimeout(checkScrollable, 0);

    // 데이터/뷰포트 크기 변화에도 다시 판정해 정확히 표시
    const ro = new ResizeObserver(checkScrollable);
    ro.observe(scrollEl);
    window.addEventListener("resize", checkScrollable);

    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", checkScrollable);
    };
  }, [sortedVideos]);

  // 인디케이터 바 위치 추적 — 바가 렌더된 뒤(isScrollable=true)에만 리스너를 건다.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const barEl = barRef.current;
    if (!scrollEl || !barEl) return;

    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const scrollableRange = scrollWidth - clientWidth;
      if (scrollableRange <= 0) return;
      const percent = scrollLeft / scrollableRange;
      barEl.style.transform = `translateX(${percent * (262 - 100)}px)`;
    };

    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [isScrollable, sortedVideos]);

  return (
    <ContentSection>
      <SectionTitle>{title}</SectionTitle>

      {isEmpty ? (
        <EmptyText>아직 최근에 연습한 춤이 없어요.</EmptyText>
      ) : (
        <>
          <HorizontalScroll ref={scrollRef}>
            {sortedVideos.map((video) => (
              <DanceCard
                key={video.id}
                {...video}
                onReplay={onCardClick ? () => onCardClick(video) : undefined}
              />
            ))}
          </HorizontalScroll>

          {/* 스크롤이 필요할 때만 스크롤바 표시 */}
          {isScrollable && (
            <ScrollIndicatorTrack>
              <ScrollIndicatorBar ref={barRef} $scrollPercent={0} />
            </ScrollIndicatorTrack>
          )}
        </>
      )}
    </ContentSection>
  );
}

const EmptyText = styled.p`
  font-family: "Galmuri11", sans-serif;
  font-size: 13px;
  color: #888;
  text-align: center;
  padding: 32px 0;
  margin: 0;
`;
