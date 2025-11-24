/**
 * 네비게이션 구조 정의
 */

export interface QueryParams {
  target?: 'employee' | 'student';
  format?: 'online' | 'offline' | 'hybrid';
  q?: string;
  category?: string;
}

export interface RawNavNode {
  label: string;
  query?: QueryParams;
  children?: RawNavNode[];
  path?: string; // 커뮤니티용 직접 경로
}

export const rawCourseNav: RawNavNode[] = [
  {
    label: '채용예정자 과정',
    query: { target: 'student' },
    children: [
      {
        label: '온라인',
        query: { format: 'online' },
        children: [
          { label: '웹개발', query: { q: '웹개발' } },
          { label: '모바일', query: { q: '모바일' } },
          { label: '데이터/AI', query: { q: '데이터 AI' } },
          { label: '클라우드', query: { q: '클라우드' } },
          { label: '보안', query: { q: '보안' } },
          { label: 'IoT/임베디드', query: { q: 'IoT 임베디드' } },
          { label: '게임/블록체인', query: { q: '게임 블록체인' } },
        ]
      },
      {
        label: '오프라인',
        query: { format: 'offline' },
        children: [
          { label: '웹개발', query: { q: '웹개발' } },
          { label: '모바일', query: { q: '모바일' } },
          { label: '데이터/AI', query: { q: '데이터 AI' } },
          { label: '클라우드', query: { q: '클라우드' } },
          { label: '보안', query: { q: '보안' } },
          { label: 'IoT/임베디드', query: { q: 'IoT 임베디드' } },
          { label: '게임/블록체인', query: { q: '게임 블록체인' } },
        ]
      }
    ]
  },
  {
    label: '재직자 과정',
    query: { target: 'employee' },
    children: [
      {
        label: '온라인',
        query: { format: 'online' },
        children: [
          { label: 'Infra 운영', query: { q: 'Infra 운영' } },
          { label: 'Back-End 개발', query: { q: 'Back-End 개발' } },
          { label: 'Front-End 개발', query: { q: 'Front-End 개발' } },
          { label: 'DB', query: { q: 'DB' } },
          { label: 'AI', query: { q: 'AI' } },
          { label: 'SW요구분석', query: { q: 'SW요구분석' } },
          { label: '백엔드개발자', query: { q: '백엔드개발자' } },
          { label: 'Cloud엔지니어', query: { q: 'Cloud엔지니어' } },
          { label: '프론트엔드개발자', query: { q: '프론트엔드개발자' } },
          { label: '데이터엔지니어', query: { q: '데이터엔지니어' } },
          { label: 'AI엔지니어', query: { q: 'AI엔지니어' } },
          { label: 'SW아키텍트', query: { q: 'SW아키텍트' } },
          { label: '정보보안전문가', query: { q: '정보보안전문가' } },
          { label: 'IT기획자/컨설턴트', query: { q: 'IT기획자 컨설턴트' } },
          { label: '데이터분석가', query: { q: '데이터분석가' } },
          { label: '비즈니스분석가', query: { q: '비즈니스분석가' } },
          { label: '데이터사이언티스트', query: { q: '데이터사이언티스트' } },
        ]
      },
      {
        label: '오프라인',
        query: { format: 'offline' },
        children: [
          { label: 'Infra 운영', query: { q: 'Infra 운영' } },
          { label: 'Back-End 개발', query: { q: 'Back-End 개발' } },
          { label: 'Front-End 개발', query: { q: 'Front-End 개발' } },
          { label: 'DB', query: { q: 'DB' } },
          { label: 'AI', query: { q: 'AI' } },
          { label: 'SW요구분석', query: { q: 'SW요구분석' } },
          { label: '백엔드개발자', query: { q: '백엔드개발자' } },
          { label: 'Cloud엔지니어', query: { q: 'Cloud엔지니어' } },
          { label: '프론트엔드개발자', query: { q: '프론트엔드개발자' } },
          { label: '데이터엔지니어', query: { q: '데이터엔지니어' } },
          { label: 'AI엔지니어', query: { q: 'AI엔지니어' } },
          { label: 'SW아키텍트', query: { q: 'SW아키텍트' } },
          { label: '정보보안전문가', query: { q: '정보보안전문가' } },
          { label: 'IT기획자/컨설턴트', query: { q: 'IT기획자 컨설턴트' } },
          { label: '데이터분석가', query: { q: '데이터분석가' } },
          { label: '비즈니스분석가', query: { q: '비즈니스분석가' } },
          { label: '데이터사이언티스트', query: { q: '데이터사이언티스트' } },
        ]
      }
    ]
  }
];

/**
 * 커뮤니티 네비게이션 구조
 * path는 부모의 '/community'와 각 자식의 query를 조합하여 동적 생성
 */
export const rawCommunityNav: RawNavNode = {
  label: '커뮤니티',
  path: '/community',
  children: [
    { label: '공지사항', query: { category: 'NOTICE' } },
    { label: '진로이야기', query: { category: 'CAREER' } },
    { label: '코딩이야기', query: { category: 'CODING' } },
  ]
};
