import styled from "styled-components";

// Props 타입 정의
interface StartButtonProps {
  text: string; // 버튼에 표시할 문구
  onClick?: () => void; // 클릭 시 실행할 함수 (옵션)
  type?: "button" | "submit" | "reset";
}

export default function StartButton({
  text,
  onClick,
  type = "submit",
}: StartButtonProps) {
  return (
    <StyledButton onClick={onClick} type={type}>
      {text}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  width: 360px;
  height: 47px;
  display: flex;
  padding: 0 7px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background-color: #106aa9;

  color: #fff;
  font-family: "Galmuri11", sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  border: none;

  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0d588d;
    transform: scale(1.02);
  }

  &:active {
    background-color: #0a4670;
    transform: scale(0.98);
  }
`;
