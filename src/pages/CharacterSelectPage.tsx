import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import backIcon from '../img/backIcon.svg';
import leftArrow from '../img/leftArrow.svg';
import rightArrow from '../img/rightArrow.svg';
import StartButton from '../components/StartButton';
import teachersData from '../data/teachersData.json';
import Bgimg from '../img/background.png';

import tyt from '../img/tyt.svg';
import yjt from '../img/yjt.svg';
import jht from '../img/jht.svg';
import ygt from '../img/ygt.svg';
import jrt from '../img/jrt.svg';

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

export default function CharacterSelectPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!teachers || teachers.length === 0) return null;

  const current = teachers[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teachers.length);
  };

  // ✅ 변경: 선택된 캐릭터 정보를 state에 담아서 navigate
  const handleSelect = () => {
    navigate('/lee/main', {
      state: {
        teacher: current,
        teacherImage: teacherImages[current.id],
      },
    });
  };

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>
        <img src={backIcon} alt="뒤로가기" />
      </BackButton>

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
            <CharacterImage src={teacherImages[current.id]} alt={current.name} />
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
  padding: 60px 0 0 0;
  box-sizing: border-box;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 60px;
  left: 20px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 36px;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: #000;
  text-align: center;
  font-family: 'Galmuri11', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #4C4C4C;
  text-align: center;
  font-family: 'Galmuri11', sans-serif;
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
  color: #106AA9;
  text-align: center;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #FFF;
  font-family: 'Galmuri11', sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 2px 3px 12px rgba(0, 0, 0, 0.15);

  img {
    width: 16px;
    height: 16px;
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
  color: #031F32;
  text-align: center;
  text-overflow: ellipsis;
  font-family: 'Galmuri11', sans-serif;
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
  font-family: 'Galmuri11', sans-serif;
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