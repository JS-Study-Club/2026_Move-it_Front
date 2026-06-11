import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import type { ApiResponse, PracticeCategory, PracticeResult } from '../types';
import { api } from '../api/axios';

// ─── 카테고리별 피드백 풀 ──────────────────────────────────────────────────
// 디자인 요구사항: 카테고리당 잘한 점 3개 + 아쉬운 점 3개.
// (메시지 문구는 백엔드 FEEDBACK_MESSAGES 와 동일하게 맞춥니다)
interface CategoryCard {
    title: string;
    subtitle: string;
    items: string[];
}
interface CategoryFeedback {
    good: CategoryCard;
    improve: CategoryCard;
}

const CATEGORY_FEEDBACK: Record<PracticeCategory, CategoryFeedback> = {
    rhythm: {
        good: {
            title: '리듬을 잘 살린 춤이에요!',
            subtitle: '잘하고 있어요 계속 진행해!!',
            items: [
                '음악 박자에 맞춰 안정적으로 움직이고 있어요.',
                '동작의 타이밍이 자연스럽게 이어집니다.',
                '전체적인 퍼포먼스가 음악과 잘 어울립니다.',
            ],
        },
        improve: {
            title: '동작 타이밍을 조금 더 맞춰보세요.',
            subtitle: '이건 좀 고쳐보자!!',
            items: [
                '일부 동작이 음악보다 약간 빠르게 진행됩니다.',
                '박자가 바뀌는 구간에서 타이밍이 흔들립니다.',
                '리듬을 조금 더 천천히 맞춰보면 좋아요.',
            ],
        },
    },
    accuracy: {
        good: {
            title: '정확도가 좋은 춤이에요!',
            subtitle: '잘하고 있어요 계속 진행해!!',
            items: [
                '핵심 안무의 각도가 매우 정확해요.',
                '손끝과 발끝의 위치가 원본과 일치합니다.',
                '전반적인 신체 밸런스 및 자세가 훌륭합니다.',
            ],
        },
        improve: {
            title: '동작을 조금 더 정확하게 맞춰보세요.',
            subtitle: '이건 좀 고쳐보자!!',
            items: [
                '팔과 다리를 뻗는 동작에서 각도가 조금 아쉽습니다.',
                '무게 중심 이동이 다소 불안정합니다.',
                '안무의 끝맺음을 확실하게 정지해주세요.',
            ],
        },
    },
    expression: {
        good: {
            title: '표현력이 좋은 춤이에요!',
            subtitle: '잘하고 있어요 계속 진행해!!',
            items: [
                '동작의 강약 조절이 매우 뛰어나 시선을 사로잡습니다.',
                '움직임이 크고 자신감 있어 매력적이에요.',
                '춤의 느낌을 본인만의 스타일로 잘 표현했어요.',
            ],
        },
        improve: {
            title: '더 크고 과감하게 표현해보세요.',
            subtitle: '이건 좀 고쳐보자!!',
            items: [
                '동작이 다소 위축되고 굳어있는 듯한 느낌을 줍니다.',
                '팔과 다리의 움직임 범위를 조금 더 크게 가져가보세요.',
                '에너지가 필요한 포인트에서 힘을 더 실어주세요.',
            ],
        },
    },
};

// 90점 이상이면 아쉬운 점 카드를 숨깁니다.
const HIDE_IMPROVE_SCORE = 90;

// userChallengeId 없이 진입했을 때(데모) 사용하는 기본 코멘트/점수
const DEMO_COMMENT = '잘하고 있는데 기본기가 조금 더 필요한 것 같아.';
const DEMO_SCORE = 80;

const TAB_CONFIG = [
    { key: 'rhythm', img: <img src={rhythemIcon} alt="리듬" />, label: '리듬' },
    { key: 'accuracy', img: <img src={accuracyIcon} alt="정확도" />, label: '정확도' },
    { key: 'expression', img: <img src={expressionIcon} alt="표현력" />, label: '표현력' },
] as const;

type TabKey = (typeof TAB_CONFIG)[number]['key'];

export default function FeedbackPage() {
    const navigate = useNavigate();
    const { userChallengeId } = useParams<{ userChallengeId?: string }>();
    const [activeTab, setActiveTab] = useState<TabKey>('rhythm');

    const [result, setResult] = useState<PracticeResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ─── 연습 결과 불러오기 ─────────────────────────────────────
    useEffect(() => {
        if (!userChallengeId) return;

        const fetchResult = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get<ApiResponse<PracticeResult>>(
                    `/practice/result/${userChallengeId}`
                );
                console.log('연습 결과 불러오기 성공', res.data);
                setResult(res.data.data);
            } catch (err: any) {
                console.error('연습 결과 불러오기 실패', err);
                setError('연습 결과를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [userChallengeId]);

    const handleNext = () => {
        navigate('/main');
    };

    // ─── 화면에 표시할 값 계산 ───────────────────────────────────
    const tab = activeTab as PracticeCategory;

    // 카테고리 점수: 백엔드 결과가 있으면 해당 카테고리 점수, 없으면 데모 점수
    const categoryScore = result ? result?.data?.scores?.[tab] : DEMO_SCORE;

    // 상단 코멘트(말풍선): 백엔드 종합 코멘트 우선
    const comment = result
        ? result.data?.feedback?.overall ?? result.comment ?? ''
        : DEMO_COMMENT;

    const challengeName = result?.challenge?.name;

    // 카테고리별 잘한 점(3개)은 항상, 아쉬운 점(3개)은 90점 이상이면 숨김
    const content = CATEGORY_FEEDBACK[tab];
    const good = { ...content.good, iconBg: '#DAF0FF' };
    const improve =
        (categoryScore ?? 0) >= HIDE_IMPROVE_SCORE
            ? null
            : { ...content.improve, iconBg: '#FFCCCC' };

    const displayScore = categoryScore;

    return (
        <FeedbackPageContainer>
            {/* 헤더 */}
            <Header />

            {/* 타이틀 바 */}
            <TopBar>
                <BackBtn aria-label="뒤로가기" onClick={() => navigate(-1)}>
                    <img src={backIcon} alt="뒤로가기" />
                </BackBtn>
            </TopBar>

            {/* 캐릭터 영역 */}
            <CharacterSection>
                <SpeechBubble>
                    {loading ? '결과를 불러오는 중...' : error ? error : `"${comment}"`}
                </SpeechBubble>

                <CharacterImg src={char} alt="character" />
                <CharacterLabel>{challengeName ?? '디폴트 캐릭터'}</CharacterLabel>
            </CharacterSection>

            {/* 분석 탭 버튼 */}
            <TabRow>
                {TAB_CONFIG.map((tabItem) => (
                    <TabItem key={tabItem.key}>
                        <TabCircle
                            $active={activeTab === tabItem.key}
                            onClick={() => setActiveTab(tabItem.key)}
                            aria-pressed={activeTab === tabItem.key}
                        >
                            {tabItem.img}
                            <TabLabel $active={activeTab === tabItem.key}>
                                {tabItem.label}
                            </TabLabel>
                        </TabCircle>
                    </TabItem>
                ))}
            </TabRow>

            {displayScore !== undefined && <Score>{displayScore} score!</Score>}

            {/* 잘한 점 카드 */}
            {good && good.items.length > 0 && (
                <FeedbackCard $variant="green">
                    <CardTitle>{good.title}</CardTitle>
                    <CardSubtitle>{good.subtitle}</CardSubtitle>
                    <FeedbackList>
                        {good.items.map((item, i) => (
                            <FeedbackItem key={i}>
                                <FeedbackIcon $bg={good.iconBg}> <img src={checkIcon} alt="check" /> </FeedbackIcon>
                                {item}
                            </FeedbackItem>
                        ))}
                    </FeedbackList>
                </FeedbackCard>
            )}

            {/* 개선할 점 카드 */}
            {improve && improve.items.length > 0 && (
                <FeedbackCard $variant="pink">
                    <CardTitle>{improve.title}</CardTitle>
                    <CardSubtitle>{improve.subtitle}</CardSubtitle>
                    <FeedbackList>
                        {improve.items.map((item, i) => (
                            <FeedbackItem key={i}>
                                <FeedbackIcon $bg={improve.iconBg}> <img src={checkIcon} alt="check" /> </FeedbackIcon>
                                {item}
                            </FeedbackItem>
                        ))}
                    </FeedbackList>
                </FeedbackCard>
            )}

            {/* 다음으로 버튼 */}
            <NextBtn onClick={handleNext}>다음으로</NextBtn>
        </FeedbackPageContainer>
    );
};
