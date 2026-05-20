import { useLocation } from 'react-router-dom';
import {
  ProfileSection,
  CharacterContainer,
  CharacterImg,
  LevelCardWrapper,
  LevelCardInner,
  LevelInfoArea,
  LevelText,
  ProgressTrack,
  ProgressFill,
  PracticeBtn
} from '../pages/MainPage.styles';

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

interface MyLevelCardProps {
  showPracticeBtn?: boolean;
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

export default function MyLevelCard({ showPracticeBtn = true }: MyLevelCardProps) {
  const location = useLocation();

  // ⭕ 팀원이 추가한 캐릭터 복원 및 렌더링 로직 유지!
  const { teacher: stateTeacher, teacherImage: stateTeacherImage } =
    (location.state as LocationState) ?? {};

  const teacher = stateTeacher ?? getSavedTeacher();
  const teacherImage = stateTeacherImage ?? getSavedTeacherImage();
  const charImg = teacherImage ?? defaultChar;

  const currentLevel = 30;

  return (
    <ProfileSection>
      <CharacterContainer>
        <CharacterImg src={charImg} alt={teacher?.name ?? 'character'} />
      </CharacterContainer>

      <LevelCardWrapper>
        <LevelCardInner>
          <LevelInfoArea>
            <LevelText>
              LV.{currentLevel} {getLevelTitle(currentLevel)}
            </LevelText>
            <ProgressTrack>
              <ProgressFill $progress={60} />
            </ProgressTrack>
          </LevelInfoArea>
          {showPracticeBtn && <PracticeBtn>연습</PracticeBtn>}
        </LevelCardInner>
      </LevelCardWrapper>
    </ProfileSection>
  );
}