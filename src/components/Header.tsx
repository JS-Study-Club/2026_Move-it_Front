import React from "react";
import logo from '../img/logo.png';
import { HeaderContainer, LogoImg, CharChangeBtn } from "./Header.styles";

const Header: React.FC = () => {
    return (
        <HeaderContainer>
            <LogoImg src={logo} alt="MoveIt Logo" />
            <CharChangeBtn>캐릭터 변경하기</CharChangeBtn>
        </HeaderContainer>
    );
};

export default Header;
