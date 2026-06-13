//최근 연습한 춤
import { useRef, useEffect, useState } from "react";
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
}

export default function RecentDanceSection({ title, videos, onCardClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const sortedVideos = [...(videos ?? [])].sort((a, b) => b.score - a.score);
  const isEmpty = sortedVideos.length === 0;

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const barEl = barRef.current;
    if (!scrollEl || !barEl) return;

    // 스크롤 가능 여부 체크
    const checkScrollable = () => {
      const { scrollWidth, clientWidth } = scrollEl;
      const scrollable = scrollWidth > clientWidth;
      setIsScrollable(scrollable);
    };

    // 초기 체크 (약간의 지연 후 정확한 크기 측정)
    setTimeout(checkScrollable, 0);

    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const scrollableRange = scrollWidth - clientWidth;
      if (scrollableRange <= 0) return;
      const percent = scrollLeft / scrollableRange;
      barEl.style.transform = `translateX(${percent * (262 - 100)}px)`;
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [sortedVideos]);

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
