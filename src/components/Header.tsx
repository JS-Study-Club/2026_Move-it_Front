import React from "react";
import logo from '../img/logo.png';
import { HeaderContainer, LogoImg, CharChangeBtn } from "./Header.styles";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();
    return (
        <HeaderContainer>
            <LogoImg src={logo} alt="MoveIt Logo" />
            <CharChangeBtn onClick={() => navigate('/yun/select')}>캐릭터 변경하기</CharChangeBtn>
        </HeaderContainer>
    );
};

export default Header;
