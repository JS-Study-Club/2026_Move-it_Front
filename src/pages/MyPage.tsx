import Header from '../components/Header';
import Nav from '../components/Nav';

import MyLevelCard from '../components/MyLevelCard';
import RecentDanceSection from '../components/RecentDanceSection';

import { MainPageContainer } from './MainPage.styles';

export default function MyPage() {
    return (
        <MainPageContainer>
            <Header />

            {/* 연습 버튼은 숨김 */}
            <MyLevelCard showPracticeBtn={false} />

            {/* 2. 가로 스크롤과 댄스카드가 포함된 섹션을 타이틀만 바꿔서 재사용 */}
            <RecentDanceSection title="최근 연습한 춤" />

            <Nav />
        </MainPageContainer>
    );
}