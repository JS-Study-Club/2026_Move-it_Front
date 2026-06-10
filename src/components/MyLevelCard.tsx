// 메인페이지에 들어가는 레벨 카드 컴포넌트
import { useLocation } from "react-router-dom";
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

import { DUMMY_USER } from "../data/user"; // 나중에 API로 교체

// 이미지 임포트
import defaultChar from "../img/tyt.png";
import tyt from "../img/tyt.png";
import yjt from "../img/yjt.png";
import jht from "../img/jht.png";
import ygt from "../img/ygt.png";
import jrt from "../img/jrt.png";
import type { HomeUserInfo } from "../types";

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

  const { teacher: stateTeacher, teacherImage: stateTeacherImage } =
    (location.state as LocationState) ?? {};

  const teacher = stateTeacher ?? getSavedTeacher();
  const teacherImage = stateTeacherImage ?? getSavedTeacherImage();
  const charImg = teacherImage ?? defaultChar;

  return (
    <ProfileSection>
      <CharacterContainer>
        <CharacterImg src={charImg} alt={teacher?.name ?? "character"} />
      </CharacterContainer>

      <LevelCardWrapper>
        <LevelCardInner>
          <LevelInfoArea>
            <LevelText>{`LV.${user.level} ${user.levelInfo.levelTitle}`}</LevelText>

            <ProgressTrack>
              <ProgressFill $progress={user.levelXp} />
            </ProgressTrack>
          </LevelInfoArea>
          <PracticeBtn>연습</PracticeBtn>
        </LevelCardInner>
      </LevelCardWrapper>
    </ProfileSection>
  );
}
