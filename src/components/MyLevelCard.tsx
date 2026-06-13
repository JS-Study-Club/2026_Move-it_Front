// 메인페이지에 들어가는 레벨 카드 컴포넌트
import { useLocation, useNavigate } from "react-router-dom";
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
  PracticeBtn,
} from "../pages/MainPage.styles";

// 이미지 임포트
import defaultChar from "../img/tyt.png";
import tyt from "../img/tyt.png";
import yjt from "../img/yjt.png";
import jht from "../img/jht.png";
import ygt from "../img/ygt.png";
import jrt from "../img/jrt.png";
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

const getSavedTeacher = (): Teacher | undefined => {
  try {
    const saved = localStorage.getItem("selectedTeacher");
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined;
  }
};

const getSavedTeacherImage = (): string | undefined => {
  try {
    const savedId = localStorage.getItem("selectedTeacherImageId");
    return savedId ? teacherImages[Number(savedId)] : undefined;
  } catch {
    return undefined;
  }
};

interface Props {
  user: any;
}

export default function MyLevelCard({ user }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const { teacher: stateTeacher, teacherImage: stateTeacherImage } =
    (location.state as LocationState) ?? {};

  // 서버에 저장된 teacher 값(teacher_character_id / teacherId)을 최우선으로 사용합니다.
  // 그래야 캐릭터 변경이 즉시 반영되고 새로고침/재로그인 후에도 유지됩니다.
  const serverTeacherId: number | undefined =
    user?.teacherId ?? user?.teacher_character_id;
  const serverTeacherImage = serverTeacherId
    ? teacherImages[serverTeacherId]
    : undefined;

  const teacher = stateTeacher ?? getSavedTeacher();
  const teacherImage =
    serverTeacherImage ?? stateTeacherImage ?? getSavedTeacherImage();
  const charImg = teacherImage ?? defaultChar;

  const handlePracticeClick = () => {
    navigate("/camera");
  };

  return (
    <ProfileSection>
      <CharacterContainer>
        <CharacterImg src={charImg} alt={teacher?.name ?? "character"} />
      </CharacterContainer>

      <LevelCardWrapper>
        <LevelCardInner>
          <LevelInfoArea>
            {/* LV. + 레벨번호(1~) + 칭호 */}
            <LevelText>{`LV. ${user.level ?? 1} ${user.levelTitle ?? ""}`}</LevelText>

            <ProgressTrack>
              <ProgressFill $progress={user.levelProgress ?? 0} />
            </ProgressTrack>
          </LevelInfoArea>
          <PracticeBtn onClick={handlePracticeClick}>연습</PracticeBtn>
        </LevelCardInner>
      </LevelCardWrapper>
    </ProfileSection>
  );
}
