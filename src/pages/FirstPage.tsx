import { useEffect } from 'react';
import styled from 'styled-components';
import Logo from '../img/logo.png';
import Bgimg from '../img/background.png';
import StartButton from '../components/StartButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// 인증 토큰은 httpOnly 쿠키라 JS로 직접 못 읽으므로, 쿠키로 인증 요청을 보내
// 성공하면 로그인 상태로 판단한다. baseURL 규칙은 api/axios.ts 와 동일.
const API_BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

// 'function' 키워드가 반드시 있어야 합니다!
export default function FirstPage() {
  const navigate = useNavigate();

  // 이전에 로그인해 세션(쿠키)이 남아있으면 자동으로 /main 으로 이동한다.
  // api 인스턴스의 인터셉터는 인증 실패 시 /login 으로 강제 이동시키므로,
  // 비로그인 사용자가 튕기지 않도록 raw axios 로 직접 확인한다.
  useEffect(() => {
    let active = true;

    const tryAutoLogin = async () => {
      const fetchMe = () =>
        axios.get(`${API_BASE}/pages/my`, { withCredentials: true });

      try {
        let res;
        try {
          res = await fetchMe();
        } catch (err) {
          // accessToken 만료일 수 있으니 refresh 후 1회만 재시도한다.
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            await axios.post(
              `${API_BASE}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            res = await fetchMe();
          } else {
            throw err;
          }
        }

        const user = res?.data?.data?.user ?? res?.data?.user;
        if (active && user) {
          // 스토어도 채워두면 이후 페이지에서 유저 재조회를 줄일 수 있다.
          useAuthStore.getState().setUser(user);
          navigate('/main', { replace: true });
        }
      } catch {
        // 로그인 이력이 없거나 세션 만료 → FirstPage 를 그대로 표시한다.
      }
    };

    tryAutoLogin();
    return () => {
      active = false;
    };
  }, [navigate]);

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