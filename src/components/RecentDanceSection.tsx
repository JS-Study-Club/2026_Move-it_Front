//최근 연습한 춤
import { useRef, useEffect } from "react";
import DanceCard from "./DanceCard";
import {
  ContentSection,
  SectionTitle,
  HorizontalScroll,
  ScrollIndicatorTrack,
  ScrollIndicatorBar,
} from "../pages/MainPage.styles";
import thumb1 from "../img/thumb1.png";
import thumb2 from "../img/thumb2.png";

import type { VideoData } from "../types.ui";
interface Props {
  title: string;
  videos?: VideoData[];
}

export default function RecentDanceSection({ title, videos }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  //   const topVideos: VideoData[] = [
  //     {
  //       id: "1",
  //       title: "BANG BANG (Preview) - IVE",
  //       date: "2025.11.20",
  //       score: 98,
  //       thumbnail: thumb1,
  //     },
  //     {
  //       id: "2",
  //       title: "아웅다웅 (feat. TimeFever)",
  //       date: "2026.01.07",
  //       score: 90,
  //       thumbnail: thumb2,
  //     },
  //     {
  //       id: "3",
  //       title: "Supernova - aespa",
  //       date: "2025.11.10",
  //       score: 80,
  //       thumbnail: thumb2,
  //     },
  //   ];

  //   const sortedVideos = [...topVideos].sort((a, b) => b.score - a.score);
  const sortedVideos = [...videos].sort((a, b) => b.score - a.score);

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
      <HorizontalScroll ref={scrollRef}>
        {sortedVideos.map((video) => (
          <DanceCard key={video.id} {...video} />
        ))}
      </HorizontalScroll>

      <ScrollIndicatorTrack>
        <ScrollIndicatorBar ref={barRef} $scrollPercent={0} />
      </ScrollIndicatorTrack>
    </ContentSection>
  );
}
