import styled from 'styled-components';
import { type ChangeEvent } from 'react';

interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ 
  label, 
  placeholder, 
  type = "text", 
  value, 
  onChange 
}: InputFieldProps) {
  return (
    <Container>
      <Label>{label}</Label>
      <StyledInput 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const Label = styled.label`
  align-self: stretch;
  color: #000;
  font-family: 'Galmuri11', sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
`;

const StyledInput = styled.input`
  height: 44px;
  padding: 8px 10px;  /* 세로 padding으로 텍스트 위치 조정 */
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #FFF;
  box-shadow: 2px 3px 16px 0 rgba(0, 0, 0, 0.25);
  color: #000;
  font-family: 'Galmuri11', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 22px;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #6B6B6B;
    /* text-align: center 제거 */
  }

  &:focus::placeholder {
    color: transparent;
  }
`;