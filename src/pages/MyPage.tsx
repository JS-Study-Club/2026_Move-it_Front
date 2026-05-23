import Header from '../components/Header';
import Nav from '../components/Nav';

import MyProfileCard from '../components/MyProfilecard'; // ← 마이페이지 전용 컴팩트 카드
import RecentDanceSection from '../components/RecentDanceSection';

import { MainPageContainer } from './MainPage.styles';

export default function MyPage() {
    return (
        <MainPageContainer>
            <Header />

            <MyProfileCard />

            <RecentDanceSection title="최근 연습한 춤" />

            <Nav />
        </MainPageContainer>
    );
}