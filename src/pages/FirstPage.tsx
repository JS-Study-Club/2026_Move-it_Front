import styled from 'styled-components';
import Logo from '../img/logo.png';
import Bgimg from '../img/background.png';
import StartButton from '../components/StartButton';
import { useNavigate } from 'react-router-dom';

// 'function' 키워드가 반드시 있어야 합니다!
export default function FirstPage() {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <TopSection>
        <LogoImage src={Logo} alt="Logo" />
        <SubTitle>무브잇과 함께하는 댄스 튜토리얼</SubTitle>
      </TopSection>

      <BottomSection>
      <StartButton 
        text="시작하기!" 
        onClick={() => navigate('/login')}
      />
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
  justify-content: space-between;
  padding: 113px 0 108px 0;
  box-sizing: border-box;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 165px;
  height: 112px;
  aspect-ratio: 112/165;
`;

const SubTitle = styled.div`
  color: #031F32;
  text-align: center;
  font-family: Galmuri11;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 157.143% */
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
`;