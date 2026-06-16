// 메인페이지에 들어가는 레벨 카드 컴포넌트
import { useNavigate } from "react-router-dom";
import teachersData from "../data/teachersData.json";
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

const teachers = teachersData as Teacher[];

interface Props {
  user: any;
}

export default function MyLevelCard({ user }: Props) {
  const navigate = useNavigate();

  // 캐릭터는 서버(API)가 내려준 teacherId 로만 결정합니다. (localStorage 사용 안 함)
  const teacherId: number | undefined =
    user?.teacherId ?? user?.teacher_character_id;
  const teacher = teachers.find((t) => t.id === teacherId);
  const charImg = teacherImages[teacherId ?? 0] ?? defaultChar;

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
