import { useState } from 'react'; // useState 추가
import styled from 'styled-components';
import Logo from '../img/logo.png';
import Bgimg from '../img/background.png';
import StartButton from '../components/StartButton';
import InputField from '../components/InputFeild';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  // 1. 아이디와 비밀번호 상태 관리
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 2. 유효성 검사 (공백 제거 후 빈 값인지 확인)
    if (!id.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요!");
      return; // 입력되지 않았다면 여기서 함수 종료
    }

    console.log("로그인 시도!", { id, password });
    navigate('/yun/select'); 
  };

  return (
    <PageContainer>
      <TopSection>
        <LogoImage src={Logo} alt="Logo" />
      </TopSection>

      <FormSection>
        {/* 3. value와 onChange 연결 */}
        <InputField 
          label="아이디" 
          placeholder="아이디를 입력해주세요." 
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <InputField 
          label="비밀번호" 
          placeholder="비밀번호를 입력해주세요." 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PlaceholderField>
          <InputField label="" placeholder="" aria-hidden="true"/>
        </PlaceholderField>
        <PlaceholderField>
          <InputField label="" placeholder="" aria-hidden="true"/>
        </PlaceholderField>
      </FormSection>

      <BottomSection>
        <StartButton text="로그인" onClick={handleLogin} />
        <LinkRow>
          <LinkText onClick={() => navigate('/')}>첫 화면으로</LinkText>
          <Divider>|</Divider>
          <LinkText onClick={() => navigate('/yun/signup')}>회원가입</LinkText>
        </LinkRow>
      </BottomSection>
    </PageContainer>
  );
}

// --- Styled Components (기존과 동일) ---
const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url(${Bgimg});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 113px 0 0 0;
  box-sizing: border-box;
  position: relative;
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

const FormSection = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 340px; 
`;

const PlaceholderField = styled.div`
  visibility: hidden;
  pointer-events: none;
`;

const BottomSection = styled.div`
  position: absolute;
  bottom: 71px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const LinkRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 14px;
`;

const LinkText = styled.span`
  color: #031F32;
  text-align: center;
  font-family: Galmuri11;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  cursor: pointer;
`;

const Divider = styled.span`
  color: #031F32;
  font-family: Galmuri11;
  font-size: 12px;
  line-height: 22px;
`;