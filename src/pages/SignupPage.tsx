import styled from 'styled-components';
import Logo from '../img/logo.png';
import Bgimg from '../img/background.png';
import StartButton from '../components/StartButton';
import InputField from '../components/InputFeild';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', id: '', password: '' });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSignup = () => {
    if (!form.name || !form.email || !form.id || !form.password) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    console.log("회원가입 시도!");
    navigate('/yun/login'); 
  };

  return (
    <PageContainer>
      <TopSection>
        <LogoImage src={Logo} alt="Logo" />
      </TopSection>

      <FormSection>
        <InputField label="이름" placeholder="본인 이름을 입력해주세요." onChange={handleChange('name')} />
        <InputField label="이메일" placeholder="이메일을 입력해주세요." type="email" onChange={handleChange('email')} />
        <InputField label="아이디" placeholder="아이디를 입력해주세요." onChange={handleChange('id')} />
        <InputField label="비밀번호" placeholder="비밀번호를 입력해주세요." type="password" onChange={handleChange('password')} />
      </FormSection>

      <BottomSection>
        <StartButton text="회원가입" onClick={handleSignup} />
        <LinkRow>
          <LinkText onClick={() => navigate('/')}>첫 화면으로</LinkText>
          <Divider>|</Divider>
          <LinkText onClick={() => navigate('/yun/login')}>로그인</LinkText>
        </LinkRow>
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
  padding: 113px 0 0 0; /* 하단 padding 제거 */
  box-sizing: border-box;
  position: relative; /* BottomSection absolute 기준점 */
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
  height: 340px; /* 고정 */
`;

const BottomSection = styled.div`
  position: absolute;
  bottom: 71px; /* 아래에서 71px 고정 */
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