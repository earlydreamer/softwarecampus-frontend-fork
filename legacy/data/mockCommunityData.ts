import type { Board, Comment } from '../types';

/**
 * 커뮤니티 게시판 Mock 데이터
 */
export const mockBoardPosts: Board[] = [
  {
    id: 1,
    title: '[필독] 커뮤니티 이용 규칙 안내',
    text: `
      <h2>소프트웨어캠퍼스 커뮤니티 이용 규칙</h2>
      <p>안녕하세요. 소프트웨어캠퍼스 커뮤니티를 이용해주셔서 감사합니다.</p>
      <p>원활한 커뮤니티 운영을 위해 다음 규칙을 준수해주시기 바랍니다.</p>
      <ul>
        <li>타인을 존중하고 예의를 지켜주세요.</li>
        <li>광고성 게시물은 삼가주세요.</li>
        <li>불법 콘텐츠 게시를 금지합니다.</li>
        <li>개인정보 유출에 주의해주세요.</li>
      </ul>
    `,
    category: 'NOTICE',
    author: {
      id: 1,
      userName: '관리자',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
    hits: 1523,
    isSecret: false,
    recommendCount: 89,
    commentCount: 2,
    hasAttachment: false,
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 2,
    title: '2025년 상반기 교육 일정 안내',
    text: `
      <h2>2025년 상반기 교육과정 일정</h2>
      <p>2025년 상반기 교육과정 일정을 안내드립니다.</p>
      <p>자세한 내용은 첨부파일을 확인해주세요.</p>
    `,
    category: 'NOTICE',
    author: {
      id: 1,
      userName: '관리자',
    },
    hits: 892,
    isSecret: false,
    recommendCount: 45,
    commentCount: 0,
    hasAttachment: true,
    createdAt: '2025-02-01T10:30:00Z',
    updatedAt: '2025-02-01T10:30:00Z',
  },
  {
    id: 3,
    title: '비전공자에서 개발자가 되기까지의 여정',
    text: `
      <h2>제 이야기를 들려드립니다</h2>
      <p>안녕하세요. 저는 문과 출신으로 개발자가 된 3년차 주니어 개발자입니다.</p>
      <p>많은 분들이 비전공자로서 개발자가 되는 것에 대해 고민하시는 것 같아 제 경험을 공유하고자 합니다.</p>
      <h3>1. 시작</h3>
      <p>저는 대학에서 경영학을 전공했습니다. 졸업 후 일반 사무직으로 일하다가...</p>
      <h3>2. 교육과정</h3>
      <p>국비교육을 통해 기초를 다졌습니다. 하루 8시간 수업 + 4시간 복습...</p>
    `,
    category: 'CAREER',
    author: {
      id: 2,
      userName: '김개발',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimdev',
    },
    hits: 2341,
    isSecret: false,
    recommendCount: 156,
    commentCount: 3,
    hasAttachment: false,
    createdAt: '2025-03-10T14:20:00Z',
    updatedAt: '2025-03-10T14:20:00Z',
  },
  {
    id: 4,
    title: '프론트엔드 vs 백엔드, 어떤 걸 선택해야 할까요?',
    text: `
      <h2>진로 고민 중입니다</h2>
      <p>부트캠프를 시작하려고 하는데, 프론트엔드와 백엔드 중 어떤 것을 선택해야 할지 고민입니다.</p>
      <p>각각의 장단점과 취업 시장 상황이 궁금합니다.</p>
      <p>경험 있으신 분들의 조언 부탁드립니다!</p>
    `,
    category: 'CAREER',
    author: {
      id: 3,
      userName: '이준비',
    },
    hits: 1456,
    isSecret: false,
    recommendCount: 67,
    commentCount: 2,
    hasAttachment: false,
    createdAt: '2025-03-20T16:45:00Z',
    updatedAt: '2025-03-20T16:45:00Z',
  },
  {
    id: 5,
    title: 'React Query 사용 시 주의할 점',
    text: `
      <h2>React Query 실전 팁</h2>
      <p>React Query를 프로젝트에 도입하면서 겪은 시행착오를 공유합니다.</p>
      <h3>1. staleTime과 cacheTime의 차이</h3>
      <p>많은 분들이 헷갈려하시는 부분입니다...</p>
      <h3>2. Optimistic Update</h3>
      <p>사용자 경험을 개선하기 위한 낙관적 업데이트 패턴...</p>
    `,
    category: 'CODING',
    author: {
      id: 4,
      userName: '박프론트',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=parkfront',
    },
    hits: 987,
    isSecret: false,
    recommendCount: 112,
    commentCount: 2,
    hasAttachment: false,
    createdAt: '2025-04-05T11:15:00Z',
    updatedAt: '2025-04-05T11:15:00Z',
  },
  {
    id: 6,
    title: 'TypeScript 제네릭 완벽 정복하기',
    text: `
      <h2>TypeScript 제네릭 마스터하기</h2>
      <p>제네릭은 TypeScript의 강력한 기능 중 하나입니다.</p>
      <pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}</code></pre>
      <p>이런 기본적인 예제부터 시작해서...</p>
    `,
    category: 'CODING',
    author: {
      id: 5,
      userName: '최타입',
    },
    hits: 1234,
    isSecret: false,
    recommendCount: 98,
    commentCount: 0,
    hasAttachment: false,
    createdAt: '2025-04-12T09:30:00Z',
    updatedAt: '2025-04-12T09:30:00Z',
  },
  {
    id: 7,
    title: 'Git 브랜치 전략 - Git Flow vs GitHub Flow',
    text: `
      <h2>Git 브랜치 전략 비교</h2>
      <p>프로젝트 규모와 팀 구성에 따른 적절한 브랜치 전략을 알아봅시다.</p>
    `,
    category: 'CODING',
    author: {
      id: 6,
      userName: '정깃허브',
    },
    hits: 765,
    isSecret: false,
    recommendCount: 54,
    commentCount: 0,
    hasAttachment: true,
    createdAt: '2025-04-18T13:20:00Z',
    updatedAt: '2025-04-18T13:20:00Z',
  },
];

/**
 * 댓글 Mock 데이터
 */
export const mockComments: Comment[] = [
  {
    id: 1,
    boardId: 1,
    text: '유익한 정보 감사합니다!',
    author: {
      id: 10,
      userName: '사용자A',
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    isDeleted: false,
  },
  {
    id: 2,
    boardId: 1,
    text: '잘 지키겠습니다~',
    author: {
      id: 11,
      userName: '사용자B',
    },
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
    isDeleted: false,
  },
  {
    id: 3,
    boardId: 3,
    text: '저도 비전공자인데 정말 공감되는 내용이네요. 응원합니다!',
    author: {
      id: 12,
      userName: '사용자C',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=userc',
    },
    createdAt: '2025-03-10T15:00:00Z',
    updatedAt: '2025-03-10T15:00:00Z',
    isDeleted: false,
  },
  {
    id: 4,
    boardId: 3,
    text: '좋은 글 감사합니다. 저도 용기를 내볼게요!',
    author: {
      id: 13,
      userName: '사용자D',
    },
    createdAt: '2025-03-10T16:30:00Z',
    updatedAt: '2025-03-10T16:30:00Z',
    isDeleted: false,
  },
  {
    id: 5,
    boardId: 3,
    text: '비전공자 출신으로서 많은 도움이 되었습니다. 혹시 어떤 교육과정을 수강하셨나요?',
    author: {
      id: 14,
      userName: '사용자E',
    },
    createdAt: '2025-03-11T09:00:00Z',
    updatedAt: '2025-03-11T09:00:00Z',
    isDeleted: false,
  },
  {
    id: 6,
    boardId: 4,
    text: '저는 프론트엔드를 추천합니다. 시각적인 결과물을 바로 확인할 수 있어서 재미있어요!',
    author: {
      id: 15,
      userName: '프론트개발자',
    },
    createdAt: '2025-03-20T17:00:00Z',
    updatedAt: '2025-03-20T17:00:00Z',
    isDeleted: false,
  },
  {
    id: 7,
    boardId: 4,
    text: '백엔드도 좋습니다. 데이터 처리와 시스템 설계에 관심이 있다면 백엔드를 추천드려요.',
    author: {
      id: 16,
      userName: '백엔드개발자',
    },
    createdAt: '2025-03-20T17:30:00Z',
    updatedAt: '2025-03-20T17:30:00Z',
    isDeleted: false,
  },
  {
    id: 8,
    boardId: 5,
    text: 'staleTime과 cacheTime 설명 정말 도움됐습니다!',
    author: {
      id: 17,
      userName: 'React초보',
    },
    createdAt: '2025-04-05T12:00:00Z',
    updatedAt: '2025-04-05T12:00:00Z',
    isDeleted: false,
  },
  {
    id: 9,
    boardId: 5,
    text: 'Optimistic Update 부분 더 자세히 알려주실 수 있나요?',
    author: {
      id: 18,
      userName: '궁금이',
    },
    createdAt: '2025-04-05T13:30:00Z',
    updatedAt: '2025-04-05T13:30:00Z',
    isDeleted: false,
  },
];
