import { Course, CommunityPost, Banner } from '../types';

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Spring Security 실전 완성',
    institution: '코리아 IT 아카데미',
    duration: '2024.07.01 ~ 2024.08.31',
    rating: 4.9,
    reviewCount: 128,
    tags: ['Spring Boot', 'Security', 'JWT'],
    imageUrl: 'https://picsum.photos/seed/course-1/400/250',
    category: '재직자',
    format: '온라인',
    description: '실제 운영 환경에서 바로 적용 가능한 Spring Security 아키텍처를 설계하고 JWT 기반 인증을 직접 구현합니다.',
    highlights: [
      '실무 시나리오 기반 문제 해결',
      'JWT 인증/인가 전 과정 실습',
      '보안 감사 대응 전략 학습'
    ]
  },
  {
    id: 2,
    title: 'React Query & Zustand 마스터 클래스',
    institution: '소프트캠퍼스',
    duration: '2024.07.15 ~ 2024.09.15',
    rating: 4.8,
    reviewCount: 97,
    tags: ['React', 'TypeScript', 'State Management'],
    imageUrl: 'https://picsum.photos/seed/course-2/400/250',
    category: '재직자',
    format: '온라인',
    description: '프론트엔드에서 서버/클라이언트 상태를 안정적으로 관리하기 위한 최신 패턴과 도구를 익힙니다.',
    highlights: [
      'React Query 고급 캐싱 전략',
      'Zustand 기반 모듈형 상태 구축',
      'TypeScript로 타입 안전성 확보'
    ]
  },
  {
    id: 3,
    title: '클라우드 네이티브 DevOps 캠프',
    institution: '멀티캠퍼스',
    duration: '2024.08.01 ~ 2024.11.30',
    rating: 4.8,
    reviewCount: 76,
    tags: ['AWS', 'Docker', 'Kubernetes'],
    imageUrl: 'https://picsum.photos/seed/course-3/400/250',
    category: '취업예정자',
    format: '오프라인',
    description: '개발부터 배포까지 자동화 파이프라인을 설계하고 클라우드 운영 역량을 강화하는 집중 과정입니다.',
    highlights: [
      'AWS 기반 인프라 구축 실습',
      'CI/CD 파이프라인 통합',
      '컨테이너 오케스트레이션 최적화'
    ]
  },
  {
    id: 4,
    title: '실전 UI/UX 디자인 with Figma',
    institution: '디자인 베이스',
    duration: '상시 모집',
    rating: 4.7,
    reviewCount: 152,
    tags: ['Figma', 'UI/UX', 'Design System'],
    imageUrl: 'https://picsum.photos/seed/course-4/400/250',
    category: '취업예정자',
    format: '온라인',
    description: '사용자 여정 분석부터 컴포넌트 라이브러리 설계까지 UI/UX 프로젝트 전 과정을 다룹니다.',
    highlights: [
      '실사용자 리서치 노하우',
      'Figma 컴포넌트 시스템 설계',
      '디자인 QA 체계 구축'
    ]
  },
  {
    id: 5,
    title: 'JPA/Hibernate 성능 튜닝 캠프',
    institution: '패스트캠퍼스',
    duration: '2024.07.05 ~ 2024.08.20',
    rating: 4.7,
    reviewCount: 88,
    tags: ['JPA', 'Hibernate', 'Database'],
    imageUrl: 'https://picsum.photos/seed/course-5/400/250',
    category: '재직자',
    format: '온라인',
    description: '대규모 트래픽을 처리하는 엔터프라이즈 환경에서의 ORM 최적화 기법을 집중적으로 학습합니다.',
    highlights: [
      '쿼리 최적화 패턴 분석',
      '배치 처리 및 캐싱 전략',
      '실전 성능 모니터링 실습'
    ]
  },
  {
    id: 6,
    title: 'Vue.js 3 프로젝트 부트캠프',
    institution: '코리아 IT 아카데미',
    duration: '2024.07.10 ~ 2024.09.05',
    rating: 4.6,
    reviewCount: 65,
    tags: ['Vue.js', 'Frontend', 'Project'],
    imageUrl: 'https://picsum.photos/seed/course-6/400/250',
    category: '취업예정자',
    format: '오프라인',
    description: '실제 서비스 수준의 Vue.js 애플리케이션을 팀 단위로 설계하고 배포합니다.',
    highlights: [
      '컴포넌트 설계와 재사용성 극대화',
      'Pinia 상태 관리 심화',
      'Netlify 배포 자동화'
    ]
  },
  {
    id: 7,
    title: 'Kotlin과 함께하는 안드로이드 앱 개발',
    institution: '하이브코딩랩',
    duration: '2024.07.12 ~ 2024.10.12',
    rating: 4.9,
    reviewCount: 112,
    tags: ['Android', 'Kotlin', 'Mobile'],
    imageUrl: 'https://picsum.photos/seed/course-7/400/250',
    category: '취업예정자',
    format: '온라인',
    description: 'Jetpack Compose를 활용해 현대적인 안드로이드 앱을 구현하고 배포 전략을 수립합니다.',
    highlights: [
      'Jetpack Compose UI 설계',
      'Firebase 연동과 분석',
      '앱 스토어 출시 준비'
    ]
  },
  {
    id: 8,
    title: '알고리즘 & 자료구조 집중 마스터',
    institution: '프로그래머스',
    duration: '2024.07.15 ~ 2024.09.15',
    rating: 4.8,
    reviewCount: 204,
    tags: ['Algorithm', 'Data Structure', 'Coding Test'],
    imageUrl: 'https://picsum.photos/seed/course-8/400/250',
    category: '재직자',
    format: '온라인',
    description: '코딩 테스트와 실무 모두에 필요한 알고리즘 사고력과 자료구조 활용 능력을 강화합니다.',
    highlights: [
      '기출 패턴 집중 분석',
      '실시간 코드 리뷰 세션',
      '시간 복잡도 최적화 전략'
    ]
  }
];

export const mockBanners: Banner[] = [
  {
    id: 1,
    title: 'Spring Security 실전 캠프 모집',
    subtitle: 'JWT부터 OAuth2까지, 현업 보안 아키텍트가 전하는 실무 노하우를 만나보세요.',
    imageUrl: 'https://picsum.photos/seed/banner-1/1200/500',
    link: '/lectures/1'
  },
  {
    id: 2,
    title: 'React + TypeScript 집중 완성',
    subtitle: '안정적인 컴포넌트 아키텍처와 테스트 전략까지 한 번에 정리합니다.',
    imageUrl: 'https://picsum.photos/seed/banner-2/1200/500',
    link: '/lectures/2'
  },
  {
    id: 3,
    title: 'DevOps 통합 실습 과정',
    subtitle: 'Docker, Jenkins, Kubernetes로 자동화된 배포 환경을 직접 구축해 보세요.',
    imageUrl: 'https://picsum.photos/seed/banner-3/1200/500',
    link: '/lectures/3'
  }
];

export const mockBestCourses: Course[] = mockCourses.slice(0, 4);
export const mockClosingSoonCourses: Course[] = mockCourses.slice(4, 8);

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 1,
    title: 'Spring Security JWT 구현 팁 공유합니다',
    author: '개발꿈나무',
    recommendations: 25,
    board: '코딩이야기',
    createdAt: '2시간 전'
  },
  {
    id: 2,
    title: '비전공자 취업 준비, 어떻게 시작할까요?',
    author: '진로고민중',
    recommendations: 42,
    board: '진로이야기',
    createdAt: '5시간 전'
  },
  {
    id: 3,
    title: 'React 컴포넌트 재사용성 높이는 패턴',
    author: '리액트장인',
    recommendations: 18,
    board: '코딩이야기',
    createdAt: '1일 전'
  }
];
