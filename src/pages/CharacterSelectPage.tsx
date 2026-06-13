import { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderSelect from "../components/HeaderSelect";
import leftArrow from "../img/leftArrow.svg";
import rightArrow from "../img/rightArrow.svg";
import StartButton from "../components/StartButton";
import teachersData from "../data/teachersData.json";
import Bgimg from "../img/background.png";

import tyt from "../img/tyt.png";
import yjt from "../img/yjt.png";
import jht from "../img/jht.png";
import ygt from "../img/ygt.png";
import jrt from "../img/jrt.png";
import { api } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiError";

const teacherImages: Record<number, string> = {
  1: tyt,
  2: yjt,
  3: jht,
  4: ygt,
  5: jrt,
};

interface Teacher {
  id: number;
  image: string;
  name: string;
  hashtag: string;
  comment: string;
}

const teachers = teachersData as Teacher[];

interface SignupState {
  userId: string;
  username: string;
  email: string;
  password: string;
}

export default function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 회원가입 화면에서 입력 정보를 들고 넘어온 경우 = "회원가입 마무리" 모드.
  // (없으면 로그인된 사용자의 "캐릭터 변경" 모드)
  const signup = (location.state as { signup?: SignupState } | null)?.signup;

  if (!teachers || teachers.length === 0) return null;

  const current = teachers[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teachers.length);
  };

  const handleSelect = async () => {
    try {
      if (signup) {
        // 회원가입 마무리: 선택한 캐릭터로 가입 처리 후 로그인 화면으로.
        await api.post("auth/signup", {
          userId: signup.userId,
          username: signup.username,
          email: signup.email,
          password: signup.password,
          teacherId: current.id,
        });
        alert("회원가입 완료!");
        navigate("/login");
        return;
      }

      // 캐릭터 변경: 로그인된 사용자의 teacher 갱신.
      await api.patch("users/me", {
        teacherId: current.id,
      });
      // 화면 즉시 반영 + 새로고침 후에도 유지되도록 캐시도 갱신합니다.
      localStorage.setItem("selectedTeacher", JSON.stringify(current));
      localStorage.setItem("selectedTeacherImageId", String(current.id));
      navigate("/main", {
        state: {
          teacher: current,
          teacherImage: teacherImages[current.id],
        },
      });
    } catch (error) {
      console.error(error);
      alert(
        getApiErrorMessage(
          error,
          signup ? "회원가입에 실패했습니다." : "캐릭터 변경에 실패했습니다.",
        ),
      );
    }
  };

  return (
    <PageContainer>
      <HeaderSelect />

      <TopSection>
        <Title>나만의 코치캐릭터 선택하기</Title>
        <Subtitle>댄스피드백을 받을 나만의 코치캐릭터를 선택해봅시다!</Subtitle>
      </TopSection>

      <CarouselSection>
        <Name>{current.name}</Name>

        <CharacterRow>
          <ArrowButton onClick={handlePrev}>
            <img src={leftArrow} alt="이전" />
          </ArrowButton>

          <CharacterImageWrapper>
            <CharacterImage
              src={teacherImages[current.id]}
              alt={current.name}
            />
          </CharacterImageWrapper>

          <ArrowButton onClick={handleNext}>
            <img src={rightArrow} alt="다음" />
          </ArrowButton>
        </CharacterRow>

        <Hashtag>{current.hashtag}</Hashtag>
        <Comment>{current.comment}</Comment>
      </CarouselSection>

      <BottomSection>
        <StartButton text="선택하기" onClick={handleSelect} />
      </BottomSection>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url(${Bgimg});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 45px 16px 16px;
  box-sizing: border-box;
  position: relative;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 22px;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: #000;
  text-align: center;
  font-family: "Galmuri11", sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #4c4c4c;
  text-align: center;
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
`;

const CarouselSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  width: 100%;
  gap: 12px;
`;

const Name = styled.span`
  color: #106aa9;
  text-align: center;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #fff;
  font-family: Galmuri11;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  align-self: stretch;
`;

const CharacterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const ArrowButton = styled.button`
  display: flex;
  width: 51px;
  height: 51px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 100px;
  border: none;
  background: linear-gradient(0deg, #daf0ff 0%, #daf0ff 100%), #fff;

  img {
    width: 31px;
    height: 31px;
    flex-shrink: 0;
  }
`;

const CharacterImageWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CharacterImage = styled.img`
  height: 220px;
  object-fit: contain;
`;

const Hashtag = styled.span`
  overflow: hidden;
  color: #031f32;
  text-align: center;
  text-overflow: ellipsis;
  font-family: "Galmuri11", sans-serif;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 0 14px;
`;

const Comment = styled.p`
  color: #000;
  text-align: center;
  font-family: "Galmuri11", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
  padding: 0 20px;
  white-space: pre-line;
`;

const BottomSection = styled.div`
  position: absolute;
  bottom: 71px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
