// 마이페이지에 들어가는 프로필, 레벨 카드 컴포넌트
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

// 이미지 임포트
import defaultChar from '../img/tyt.png';
import tyt from '../img/tyt.png';
import yjt from '../img/yjt.png';
import jht from '../img/jht.png';
import ygt from '../img/ygt.png';
import jrt from '../img/jrt.png';

const teacherImages: Record<number, string> = {
  1: tyt,
  2: yjt,
  3: jht,
  4: ygt,
  5: jrt,
};

interface Teacher {
  id: number;
  name: string;
  hashtag: string;
  comment: string;
}

interface LocationState {
  teacher?: Teacher;
  teacherImage?: string;
}

const getLevelTitle = (level: number): string => {
  if (level >= 50) return '전설의 댄스 마스터';
  if (level >= 30) return '무대를 장악하는 댄스 스타';
  if (level >= 10) return '리듬을 깨우친 댄스 유망주';
  return '쑥쑥 자라는 댄스신동';
};

const getSavedTeacher = (): Teacher | undefined => {
  try {
    const saved = localStorage.getItem('selectedTeacher');
    return saved ? JSON.parse(saved) : undefined;
  } catch { return undefined; }
};

const getSavedTeacherImage = (): string | undefined => {
  try {
    const savedId = localStorage.getItem('selectedTeacherImageId');
    return savedId ? teacherImages[Number(savedId)] : undefined;
  } catch { return undefined; }
};

/* ── 마이페이지 전용 스타일 ── */
const ProfileCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-radius: 20px;
  padding: 10px 16px;
  margin-top: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const AvatarCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #DAF0FF;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  image-rendering: pixelated;
`;

const InfoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #000;
`;

const LevelText = styled.div`
  font-size: 11px;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressTrack = styled.div`
  height: 7px;
  background-color: #FFE39C;
  border-radius: 4px;
  margin-top: 2px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background-color: #F6C039;
  border-radius: 4px;
`;

/* ── 컴포넌트 ── */
export default function MyProfileCard() {
  const location = useLocation();

  const { teacher: stateTeacher, teacherImage: stateTeacherImage } =
    (location.state as LocationState) ?? {};

  const teacher = stateTeacher ?? getSavedTeacher();
  const teacherImage = stateTeacherImage ?? getSavedTeacherImage();
  const charImg = teacherImage ?? defaultChar;

  const currentLevel = 30;

  return (
    <ProfileCard>
      {/* 원형 프로필에 캐릭터 이미지 */}
      <AvatarCircle>
        <AvatarImg src={charImg} alt={teacher?.name ?? 'character'} />
      </AvatarCircle>

      {/* 이름 + 레벨 + 프로그레스바 */}
      <InfoArea>
        <UserName>홍길동</UserName>
        <LevelText>LV.{currentLevel} {getLevelTitle(currentLevel)}</LevelText>
        <ProgressTrack>
          <ProgressFill $progress={60} />
        </ProgressTrack>
      </InfoArea>
    </ProfileCard>
  );
}