import styled from "styled-components";
import Logo from "../img/logo.png";
import Bgimg from "../img/background.png";
import StartButton from "../components/StartButton";
import InputField from "../components/InputFeild";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiError";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    id: "",
    password: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.id || !form.password) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    try {
      await api.post("auth/signup", {
        userId: form.id,
        username: form.name,
        email: form.email,
        password: form.password,
      });
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      alert(getApiErrorMessage(error, "회원가입에 실패했습니다."));
    }
  };

  return (
    <PageContainer>
      <TopSection>
        <LogoImage src={Logo} alt="Logo" />
      </TopSection>

      <FormSection onSubmit={handleSignup}>
        <InputField
          label="이름"
          placeholder="본인 이름을 입력해주세요."
          value={form.name}
          onChange={handleChange("name")}
        />
        <InputField
          label="이메일"
          placeholder="이메일을 입력해주세요."
          type="email"
          value={form.email}
          onChange={handleChange("email")}
        />
        <InputField
          label="아이디"
          placeholder="아이디를 입력해주세요."
          value={form.id}
          onChange={handleChange("id")}
        />
        <InputField
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
          type="password"
          value={form.password}
          onChange={handleChange("password")}
        />
      </FormSection>

      <BottomSection>
        <StartButton text="회원가입" onClick={handleSignup} type="submit" />
        <LinkRow>
          <LinkText onClick={() => navigate("/")}>첫 화면으로</LinkText>
          <Divider>|</Divider>
          <LinkText onClick={() => navigate("/login")}>로그인</LinkText>
        </LinkRow>
      </BottomSection>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-image: url(${Bgimg});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 113px 0 0;
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

const FormSection = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 24px 20px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BottomSection = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 24px 0 71px;
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
