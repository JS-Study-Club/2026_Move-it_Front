import styled from 'styled-components';

export const DanceCardContainer = styled.div`
  min-width: 156px;
  height: 167px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0; /*항상 원래 크기 유지. 찌그러지지 않도록*/
  align-items: flex-start;
`;

export const CardBackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 156px;
  height: 100%;
  object-fit: cover;
`;

export const CardContent = styled.div`
  position: absolute;
  top: -5%;
  left: 0;
  width: 156px;
  height: 167px;
  display: flex;
  flex-direction: column;
  padding: 8px 9px 10px 9px;
  box-sizing: border-box;
  color: #fff;
`;

export const CardTitle = styled.h3`
  overflow: hidden;
  color: #FFF;
  text-align: center;
  font-family: Galmuri11;
  font-size: 8px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 275% */
  margin-bottom: 60px;
  
  /* 말줄임표 처리 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 400;
  line-height: 22px; /* 275% */
`;

export const ReplayButton = styled.button`
  width: 100%;
  background: white;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 8px 0;
  font-size: 12px;
  font-style: normal;
`;