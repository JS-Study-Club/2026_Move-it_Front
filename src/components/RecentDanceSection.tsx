//최근 연습한 춤
import { useRef, useEffect } from "react";
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

  const sortedVideos = [...(videos ?? [])].sort((a, b) => b.score - a.score);
  const isEmpty = sortedVideos.length === 0;

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const barEl = barRef.current;
    if (!scrollEl || !barEl) return;

    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const scrollable = scrollWidth - clientWidth;
      if (scrollable <= 0) return;
      const percent = scrollLeft / scrollable;
      barEl.style.transform = `translateX(${percent * (262 - 100)}px)`;
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

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

          <ScrollIndicatorTrack>
            <ScrollIndicatorBar ref={barRef} $scrollPercent={0} />
          </ScrollIndicatorTrack>
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
