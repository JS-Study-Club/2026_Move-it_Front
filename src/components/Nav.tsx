import React from "react";
import {
  BottomNavContainer,
  StyledNavLink,
  IconWrapper,
  NavText,
} from "./Nav.styles";

import home from '../img/home-icon.svg';
import search from '../img/search-icon.svg';
import dance from '../img/dance-icon.svg';
import my from '../img/my-icon.svg';

import homeClick from '../img/home-icon-click.svg';
import searchClick from '../img/search-icon-click.svg';
import danceClick from '../img/dance-icon-click.png';
import myClick from '../img/my-icon-click.svg';

const Nav: React.FC = () => {
  return (
    <BottomNavContainer>

      {/* 1. 홈 */}
      <StyledNavLink to="/lee/main" end>
        {({ isActive }) => (
          <>
            <IconWrapper $isActive={isActive}>
              <img
                src={isActive ? homeClick : home}
                alt="home-icon"
              />
            </IconWrapper>

            <NavText $active={isActive}>
              home
            </NavText>
          </>
        )}
      </StyledNavLink>

      {/* 2. 검색 */}
      <StyledNavLink
        to="/lee/search"
        className="nav-item"
      >
        {({ isActive }) => (
          <>
            <IconWrapper $isActive={isActive}>
              <img
                src={isActive ? searchClick : search}
                alt="search-icon"
              />
            </IconWrapper>

            <NavText $active={isActive}>
              search
            </NavText>
          </>
        )}
      </StyledNavLink>

      {/* 3. 댄스 */}
      <StyledNavLink
        to="/yun/camera"
        className="nav-item"
      >
        {({ isActive }) => (
          <>
            <IconWrapper $isActive={isActive}>
              <img
                src={isActive ? danceClick : dance}
                alt="dance-icon"
              />
            </IconWrapper>

            <NavText
              $active={isActive}
              $blue={isActive}
            >
              dance
            </NavText>
          </>
        )}
      </StyledNavLink>

      {/* 4. 마이 */}
      <StyledNavLink
        to="/yun/mypage"
        className="nav-item"
      >
        {({ isActive }) => (
          <>
            <IconWrapper $isActive={isActive}>
              <img
                src={isActive ? myClick : my}
                alt="my-icon"
              />
            </IconWrapper>

            <NavText $active={isActive}>
              my
            </NavText>
          </>
        )}
      </StyledNavLink>

    </BottomNavContainer>
  );
};

export default Nav;