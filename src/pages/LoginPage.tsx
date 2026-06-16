import { useState } from "react";
import styled from "styled-components";
import Logo from "../img/logo.png";
import Bgimg from "../img/background.png";
import StartButton from "../components/StartButton";
import InputField from "../components/InputFeild";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const navigate = useNavigate();

  // 1. 아이디와 비밀번호 상태 관리
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuthStore();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // 빈 입력은 서버에 보내지 않고 즉시 안내한다. (서버의 영어 검증 메시지 노출 방지)
    if (!id.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const response = await api.post("auth/login", {
        userId: id,
        password: password,
      });

      if (response.status === 200) {
        // accessToken 은 httpOnly 쿠키로 내려오므로 응답 body 에는 없습니다.
        console.log("✅ 로그인 성공");
        alert("로그인에 성공했습니다");
        setUser(response.data.data.user);

        navigate("/main");
      }
    } catch (error) {
      console.error("로그인 에러: ", error);
      alert(getApiErrorMessage(error, "로그인 정보가 올바르지 않습니다."));
    }
  };

  return (
    <PageContainer>
      <TopSection>
        <LogoImage src={Logo} alt="Logo" />
      </TopSection>

      <FormSection onSubmit={handleLogin}>
        {/* 3. value와 onChange 연결 */}
        <InputField
          label="아이디"
          placeholder="아이디를 입력해주세요."
          type="text"
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
          <InputField label="" placeholder="" aria-hidden="true" />
        </PlaceholderField>
        <PlaceholderField>
          <InputField label="" placeholder="" aria-hidden="true" />
        </PlaceholderField>
      </FormSection>

      <BottomSection>
        <StartButton text="로그인" type="submit" onClick={handleLogin} />
        <LinkRow>
          <LinkText onClick={() => navigate("/")}>첫 화면으로</LinkText>
          <Divider>|</Divider>
          <LinkText onClick={() => navigate("/signup")}>회원가입</LinkText>
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

const FormSection = styled.form`
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
  color: #031f32;
  text-align: center;
  font-family: Galmuri11;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  cursor: pointer;
`;

const Divider = styled.span`
  color: #031f32;
  font-family: Galmuri11;
  font-size: 12px;
  line-height: 22px;
`;
