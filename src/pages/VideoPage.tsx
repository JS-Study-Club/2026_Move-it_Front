import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import type { ChallengeSearchResult } from "../types";
import backIcon from "../img/backIcon.svg";

const PageContainer = styled.div`
  padding: 20px;
  height: calc(var(--vh, 1vh) * 100);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  margin-top: 10px;
`;

const BackBtn = styled.button`
  width: 27px;
  height: 27px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.9);
  }

  img {
    width: 100%;
    height: 100%;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  color: #fff;
  font-family: "Galmuri11", sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const VideoCard = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  flex: 1;
  min-height: 0;
`;

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
`;

const StyledIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: contain;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
`;

const ChallengeName = styled.h2`
  font-size: 20px;
  margin: 0;
  color: #ffd043;
  font-family: "Galmuri11", sans-serif;
`;

const ChallengeArtist = styled.p`
  font-size: 14px;
  margin: 0;
  color: #b0c4de;
  font-family: "Galmuri11", sans-serif;
`;

const ChallengeDescription = styled.p`
  font-size: 12px;
  margin: 8px 0 0 0;
  color: #e0e0e0;
  line-height: 1.6;
  font-family: "Galmuri11", sans-serif;
`;

const NoVideoText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #bbb;
  font-size: 14px;
  font-family: "Galmuri11", sans-serif;
`;

const ActionBtn = styled.button`
  display: block;
  width: 100%;
  height: 50px;
  background-color: #106aa9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: "Galmuri11", sans-serif;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 208, 67, 0.3);

  &:hover {
    background-color: #106aa9;
    transform: translateY(-2px);
  }

  &:active {
    background-color: #106aa9;
    transform: translateY(0);
  }
`;

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export default function VideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 1. location state에서 challenge 객체 받아오기
  const challenge = location.state?.challenge as ChallengeSearchResult | undefined;

  // 2. 만약 state가 없으면 쿼리 파라미터에서 정보 복원하기
  const queryVideoUrl = searchParams.get("videoUrl");
  const queryTitle = searchParams.get("title");
  const queryArtist = searchParams.get("artist");
  const queryChallengeId = searchParams.get("challengeId");

  const videoUrl = challenge?.video_url || queryVideoUrl;
  const title = challenge?.name || queryTitle || "댄스 챌린지";
  const artist = challenge?.artist || queryArtist || "";
  const challengeId = challenge?.id || (queryChallengeId ? parseInt(queryChallengeId, 10) : null);
  const description = challenge?.description || "";

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  const handleSelect = () => {
    if (challengeId) {
      navigate(`/camera?challengeId=${challengeId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <PageContainer>
      <TopBar>
        <BackBtn aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="뒤로가기" />
        </BackBtn>
        <HeaderTitle>데모 영상 감상</HeaderTitle>
      </TopBar>

      <VideoCard>
        <PlayerContainer>
          {embedUrl ? (
            <StyledIframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoUrl ? (
            <StyledVideo src={videoUrl} controls autoPlay playsInline />
          ) : (
            <NoVideoText>재생할 영상이 없습니다.</NoVideoText>
          )}
        </PlayerContainer>

        <InfoSection>
          <ChallengeName>{title}</ChallengeName>
          {artist && <ChallengeArtist>{artist}</ChallengeArtist>}
          {description && <ChallengeDescription>{description}</ChallengeDescription>}
        </InfoSection>
      </VideoCard>

      {challengeId && (
        <ActionBtn onClick={handleSelect}>이 곡으로 연습하기</ActionBtn>
      )}
    </PageContainer>
  );
}
