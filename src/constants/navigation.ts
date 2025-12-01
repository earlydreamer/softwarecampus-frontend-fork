/**
 * 네비게이션 구조 정의 (카테고리 기반)
 */

export interface QueryParams {
    target?: 'employee' | 'student'; // categoryType과 매핑됨
    format?: 'online' | 'offline'; // isOffline과 매핑됨
    category?: string; // categoryName
}

export interface RawNavNode {
    label: string;
    query?: QueryParams;
    children?: RawNavNode[];
    path?: string;
    isClickable?: boolean; // 상위 그룹도 클릭 가능
}

// 카테고리 기반 네비게이션 (CATEGORY_CLASSIFICATION.md 참조)
export const rawCourseNav: RawNavNode[] = [
    {
        label: '취업예정자 과정',
        query: { target: 'student' },
        isClickable: true, // 클릭 시 취업예정자 전체 과정
        children: [
            {
                label: '온라인',
                query: { format: 'online' },
                isClickable: true, // 클릭 시 취업예정자 + 온라인
                children: [
                    { label: '웹개발', query: { category: '웹개발' } },
                    { label: '모바일', query: { category: '모바일' } },
                    { label: '데이터/AI', query: { category: '데이터/AI' } },
                    { label: '클라우드', query: { category: '클라우드' } },
                    { label: '보안', query: { category: '보안' } },
                    { label: 'IoT/임베디드', query: { category: 'IoT/임베디드' } },
                    { label: '게임/블록체인', query: { category: '게임/블록체인' } },
                ]
            },
            {
                label: '오프라인',
                query: { format: 'offline' },
                isClickable: true, // 클릭 시 취업예정자 + 오프라인
                children: [
                    { label: '웹개발', query: { category: '웹개발' } },
                    { label: '모바일', query: { category: '모바일' } },
                    { label: '데이터/AI', query: { category: '데이터/AI' } },
                    { label: '클라우드', query: { category: '클라우드' } },
                    { label: '보안', query: { category: '보안' } },
                    { label: 'IoT/임베디드', query: { category: 'IoT/임베디드' } },
                    { label: '게임/블록체인', query: { category: '게임/블록체인' } },
                ]
            }
        ]
    },
    {
        label: '재직자 과정',
        query: { target: 'employee' },
        isClickable: true, // 클릭 시 재직자 전체 과정
        children: [
            {
                label: '온라인',
                query: { format: 'online' },
                isClickable: true, // 클릭 시 재직자 + 온라인
                children: [
                    { label: 'Infra운영', query: { category: 'Infra운영' } },
                    { label: '백엔드 개발', query: { category: '백엔드 개발' } },
                    { label: '프론트엔드 개발', query: { category: '프론트엔드 개발' } },
                    { label: 'DB', query: { category: 'DB' } },
                    { label: 'AI', query: { category: 'AI' } },
                    { label: 'SW요구분석', query: { category: 'SW요구분석' } },
                    { label: '백엔드개발자', query: { category: '백엔드개발자' } },
                    { label: '클라우드엔지니어', query: { category: '클라우드엔지니어' } },
                    { label: '프론트엔드개발자', query: { category: '프론트엔드개발자' } },
                    { label: '데이터엔지니어', query: { category: '데이터엔지니어' } },
                    { label: 'AI엔지니어', query: { category: 'AI엔지니어' } },
                    { label: 'SW아키텍트', query: { category: 'SW아키텍트' } },
                    { label: '정보보안전문가', query: { category: '정보보안전문가' } },
                    { label: 'IT기획자/컨설턴트', query: { category: 'IT기획자/컨설턴트' } },
                    { label: '데이터분석가', query: { category: '데이터분석가' } },
                    { label: '비즈니스분석가', query: { category: '비즈니스분석가' } },
                    { label: '데이터사이언티스트', query: { category: '데이터사이언티스트' } },
                ]
            },
            {
                label: '오프라인',
                query: { format: 'offline' },
                isClickable: true, // 클릭 시 재직자 + 오프라인
                children: [
                    { label: 'Infra운영', query: { category: 'Infra운영' } },
                    { label: '백엔드 개발', query: { category: '백엔드 개발' } },
                    { label: '프론트엔드 개발', query: { category: '프론트엔드 개발' } },
                    { label: 'DB', query: { category: 'DB' } },
                    { label: 'AI', query: { category: 'AI' } },
                    { label: 'SW요구분석', query: { category: 'SW요구분석' } },
                    { label: '백엔드개발자', query: { category: '백엔드개발자' } },
                    { label: '클라우드엔지니어', query: { category: '클라우드엔지니어' } },
                    { label: '프론트엔드개발자', query: { category: '프론트엔드개발자' } },
                    { label: '데이터엔지니어', query: { category: '데이터엔지니어' } },
                    { label: 'AI엔지니어', query: { category: 'AI엔지니어' } },
                    { label: 'SW아키텍트', query: { category: 'SW아키텍트' } },
                    { label: '정보보안전문가', query: { category: '정보보안전문가' } },
                    { label: 'IT기획자/컨설턴트', query: { category: 'IT기획자/컨설턴트' } },
                    { label: '데이터분석가', query: { category: '데이터분석가' } },
                    { label: '비즈니스분석가', query: { category: '비즈니스분석가' } },
                    { label: '데이터사이언티스트', query: { category: '데이터사이언티스트' } },
                ]
            }
        ]
    }
];

export const rawCommunityNav: RawNavNode = {
    label: '커뮤니티',
    path: '/community',
    children: [
        { label: '공지사항', query: { category: 'NOTICE' } },
        { label: '문의사항', query: { category: 'QUESTION' } },
        { label: '진로이야기', query: { category: 'COURSE_STORY' } },
        { label: '코딩이야기', query: { category: 'CODING_STORY' } },
    ]
};
