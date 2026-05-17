import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import char from '../img/tyt.png';
import checkIcon from '../img/checkIcon - feedback.svg';
import rhythemIcon from '../img/rhythm.png';
import accuracyIcon from '../img/accuracy.png';
import expressionIcon from '../img/expression.png';
import backIcon from '../img/backIcon.svg';

import {
    FeedbackPageContainer,
    TopBar, BackBtn,
    CharacterSection, CharacterImg, CharacterLabel, SpeechBubble,
    TabRow, TabItem, TabCircle, TabLabel,
    FeedbackCard, CardTitle, CardSubtitle,
    FeedbackList, FeedbackItem, FeedbackIcon,
    NextBtn, Score,
} from './FeedbackPage.styles';
import type { FeedbackData } from '../types';

// ─── 탭별 피드백 데이터 ────────────────────────────────────────────────────
// 나중에 백엔드 API 응답으로 교체 예정
// 예시: GET /api/feedback?sessionId=xxx  →  { rhythm, expression, score, comment }
const FEEDBACK_DATA: Record<string, FeedbackData> = {
    rhythm: {
        comment: '잘하고 있는데 기분기가 부족한 것 같아!',
        good: {
            title: '리듬을 잘 살린 춤이에요!',
            subtitle: '잘하고 있어요 계속 진행해!!',
            variant: 'green',
            iconBg: '#d4f7d4',
            items: [
                '음악 박자에 맞게 움직임을 조절하고 있어요.',
                '볼이라 타이밍을 비교적 자연스럽게 타요.',
                '전반적인 리듬감이 음악에 잘 맞습니다.',
            ],
        },
        improve: {
            title: '동작 타이밍을 조금 더 맞춰보세요.',
            subtitle: '더 잘 할 수 있을 거예요!',
            variant: 'pink',
            iconBg: '#ffd6d6',
            items: [
                '일부 동작이 음악보다 살짝 늦게 시작됩니다.',
                '박자가 빠른 구간에서 너무 빠르게 진행됩니다.',
                '리듬을 좀 더 고 선명한 방법으로 표현해요.',
            ],
        },
    },
    expression: {
        comment: '표현력이 좋아지고 있어요! 조금 더 크게!',
        good: {
            title: '표현을 잘 살린 춤이에요!',
            subtitle: '잘하고 있는 부분 · 칭찬해요!',
            variant: 'green',
            iconBg: '#d4f7d4',
            items: [
                '얼굴 표정이 음악과 잘 어울려요.',
                '손짓과 눈빛을 활용해 감정을 표현해요.',
                '동작의 크기가 점점 커지고 있어요.',
            ],
        },
        improve: {
            title: '더 크고 과감하게 표현해보세요.',
            subtitle: '더 잘 할 수 있을 거예요!',
            variant: 'pink',
            iconBg: '#ffd6d6',
            items: [
                '팔 동작이 조금 더 뻗어야 무대 전달력이 올라가요.',
                '시선이 약간 불안정하게 흔들립니다.',
                '포인트 동작에서 멈춤(pause)을 활용해보세요.',
            ],
        },
    },
};

const TAB_CONFIG = [
    { key: 'rhythm', img: <img src={rhythemIcon} alt="리듬" />, label: '리듬'},
    { key: 'accuracy', img: <img src={accuracyIcon} alt="정확도" />, label: '정확도' },
    { key: 'expression', img: <img src={expressionIcon} alt="표현력" />, label: '표현력'},
] as const;

type TabKey = (typeof TAB_CONFIG)[number]['key'];

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
const FeedbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('rhythm');

    const feedback = FEEDBACK_DATA[activeTab];

    const handleNext = () => {
        // 나중에 백엔드 API 호출 후 다음 페이지로 이동
        // 예시: await postFeedbackComplete(sessionId)
        navigate('/');
    };

    return (
        <FeedbackPageContainer>
            {/* 헤더 */}
            <Header />

            {/* 타이틀 바 */}
            <TopBar>
                <BackBtn aria-label="뒤로가기"><img src={backIcon} alt="뒤로가기" /></BackBtn>
            </TopBar>

            {/* 캐릭터 영역 */}
            <CharacterSection>
                <SpeechBubble>"{feedback.comment}"</SpeechBubble>

                <CharacterImg src={char} alt="character" />
                <CharacterLabel>디폴트 캐릭터</CharacterLabel>
            </CharacterSection>

            {/* 분석 탭 버튼 */}
            <TabRow>
                {TAB_CONFIG.map((tab) => (
                    <TabItem key={tab.key}>
                        <TabCircle
                            $active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            aria-pressed={activeTab === tab.key}
                        >
                            {tab.img}
                            <TabLabel>{tab.label}</TabLabel>
                        </TabCircle>
                    </TabItem>
                ))}
            </TabRow>

            <Score>80 score!</Score>

            {/* 잘한 점 카드 */}
            <FeedbackCard $variant="green">
                <CardTitle>{feedback.good.title}</CardTitle>
                <CardSubtitle>{feedback.good.subtitle}</CardSubtitle>
                <FeedbackList>
                    {feedback.good.items.map((item, i) => (
                        <FeedbackItem key={i}>
                            <FeedbackIcon $bg={feedback.good.iconBg}> <img src={checkIcon} alt="check" /> </FeedbackIcon>
                            {item}
                        </FeedbackItem>
                    ))}
                </FeedbackList>
            </FeedbackCard>

            {/* 개선할 점 카드 */}
            <FeedbackCard $variant="pink">
                <CardTitle>{feedback.improve.title}</CardTitle>
                <CardSubtitle>{feedback.improve.subtitle}</CardSubtitle>
                <FeedbackList>
                    {feedback.improve.items.map((item, i) => (
                        <FeedbackItem key={i}>
                            <FeedbackIcon $bg={feedback.improve.iconBg}> <img src={checkIcon} alt="check" /> </FeedbackIcon>
                            {item}
                        </FeedbackItem>
                    ))}
                </FeedbackList>
            </FeedbackCard>

            {/* 다음으로 버튼 */}
            <NextBtn onClick={handleNext}>다음으로</NextBtn>
        </FeedbackPageContainer>
    );
};

export default FeedbackPage;