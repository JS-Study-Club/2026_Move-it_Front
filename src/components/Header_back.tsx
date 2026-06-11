import React from "react";
import BackIcon from '../img/backIcon.svg';
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <HeaderContainer>
            <BackArrow
                src={BackIcon}
                onClick={() => navigate(-1)}
            />
            <CharChangeBtn onClick={() => navigate('/select')}>
                캐릭터 변경하기
            </CharChangeBtn>
        </HeaderContainer>
    );
};

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BackArrow = styled.img`
  width: 36px;
  height: 36px;
  cursor: pointer;
`;

export const CharChangeBtn = styled.button`
  background-color: #106AA9;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 8px;
  font-style: normal;
  font-weight: 400;
  cursor: pointer;
`;

export default Header;