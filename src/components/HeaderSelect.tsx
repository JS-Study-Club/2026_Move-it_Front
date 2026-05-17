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

            <Null />
        </HeaderContainer>
    );
};

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const BackArrow = styled.img`
  width: 36px;
  height: 36px;
  cursor: pointer;
`;
const Null = styled.div`
  width: 36px;
  height: 36px;
`

export default Header;