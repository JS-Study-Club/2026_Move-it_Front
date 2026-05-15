import styled from "styled-components";

export const ChallengeItemContainer = styled.div`
  background-color: rgba(235, 245, 255, 0.9);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const CardThumb = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;

  img{
    width: 35px;
    height: 100%;
    object-fit: cover;
  }
`;

export const CardTexts = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;             
  flex: 1;     
`;

export const CardTitle = styled.div`
  font-size: 12px;
  color: #333;
  font-weight: 400;

  width: 100%;             /* 너비 제한 */
  white-space: nowrap;      /* 줄바꿈 금지 */
  overflow: hidden;         /* 넘치는 부분 숨김 */
  text-overflow: ellipsis;  /* 넘치면 ... 표시 */
`;

export const CardSub = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
`;

export const StartBtn = styled.button`
  width: 100%;
  height: 37px;
  background-color: #106AA9; 
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
`;

export const CardTags = styled.div`
  display: flex;
  gap: 11px;
  font-size: 10px;
  color: #444;
  overflow: hidden;
`;