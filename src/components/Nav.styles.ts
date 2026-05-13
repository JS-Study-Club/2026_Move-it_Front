import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const BottomNavContainer = styled.nav`
  position: fixed;
  width: 340px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 30px;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
`;

export const StyledNavLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: #888;
  gap: 4px;
  text-decoration: none;
`;

export const IconWrapper = styled.div<{ $isActive: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: all 0.2s ease; /* 색깔 변할 때 부드럽게 */

  width: 20px;
  height: 20px;
`;

export const NavText = styled.span<{ $active: boolean; $blue?: boolean }>`
  color: ${(props) => {
    if (!props.$active) return '#4B4B4B';
    if (props.$blue) return '#106AA9';
    return '#4B4B4B';
  }};
`;  