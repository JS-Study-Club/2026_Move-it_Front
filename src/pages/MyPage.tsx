import styled from "styled-components";
import Header from "../components/Header";
import Nav from "../components/Nav";
import DanceCard from "../components/DanceCard";
import Bgimg from "../img/background.png"; 
 


export default function MyPage() {
  return (
    <PageContainer>
      <Header />

      <Content>
        {/* 프로필 섹션 */}
        <ProfileSection>
          <ProfileImageWrapper>
            <img src={profileImg} alt="프로필" />
          </ProfileImageWrapper>
          <ProfileInfo>
            <UserName>홍길동</UserName>
            <UserLevel>LV. 50 전설의 댄스 마스터</UserLevel>
            <ExpBarContainer>
              <ExpBarFill />
            </ExpBarContainer>
          </ProfileInfo>
        </ProfileSection>

        {/* 최근 연습 섹션 */}
        <RecentSection>
          <SectionTitle>최근에 연습한 춤</SectionTitle>
          <CardSlider>
            {/* DanceCard가 요구하는 모든 props(thumbnail 포함)를 전달합니다 */}
            <DanceCard 
              title="BANG BANG (Preview) - IVE" 
              date="2025.11.20" 
              score={80} 
              thumbnail={thumb1} 
            />
            <DanceCard 
              title="아름다워 (feat. TimeFever)" 
              date="2026.01.07" 
              score={90} 
              thumbnail={thumb2}
            />
            <DanceCard 
              title="TWS 4th..." 
              date="2026.02.10" 
              score={75} 
              thumbnail={thumb3}
            />
          </CardSlider>
          
          <ScrollIndicator>
            <IndicatorBar />
          </ScrollIndicator>
        </RecentSection>
      </Content>

      <Nav />
    </PageContainer>
  );
}

// --- 스타일 정의 (기존과 동일) ---

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url(${Bgimg});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  margin-top: 20px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
`;

const ProfileImageWrapper = styled.div`
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  img { width: 90%; height: 90%; object-fit: contain; }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const UserName = styled.span`
  font-family: "Galmuri11", sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const UserLevel = styled.span`
  font-family: "Galmuri11", sans-serif;
  font-size: 13px;
  color: #333;
`;

const ExpBarContainer = styled.div`
  width: 100%;
  max-width: 200px;
  height: 12px;
  background-color: #ffe8a1;
  border-radius: 6px;
  margin-top: 5px;
  overflow: hidden;
`;

const ExpBarFill = styled.div`
  width: 60%; 
  height: 100%;
  background-color: #ffb800;
  border-radius: 6px;
`;

const RecentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SectionTitle = styled.h2`
  font-family: "Galmuri11", sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
`;

const CardSlider = styled.div`
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ScrollIndicator = styled.div`
  width: 100%;
  max-width: 250px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  margin: 10px auto 0 auto;
  position: relative;
`;

const IndicatorBar = styled.div`
  width: 30%;
  height: 100%;
  background-color: #106aa9;
  border-radius: 2px;
  position: absolute;
  left: 0;
`;