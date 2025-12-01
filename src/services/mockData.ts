import type { Banner, Course, CommunityPost, Academy, CourseQna, AcademyQA } from '../types';

// ===== Mock Banners =====
export const mockBanners: Banner[] = [
    {
        id: 1,
        title: "미래를 여는 개발자 커리어",
        subtitle: "소프트웨어캠퍼스와 함께 시작하세요",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        link: "/lectures"
    },
    {
        id: 2,
        title: "실무 중심의 프로젝트 교육",
        subtitle: "현업 전문가 멘토링과 함께 성장합니다",
        imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        link: "/lectures?target=student"
    },
    {
        id: 3,
        title: "재직자를 위한 직무 향상 과정",
        subtitle: "최신 기술 트렌드를 놓치지 마세요",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        link: "/lectures?target=employee"
    }
];

// ===== Mock Academies (백엔드 스키마 기준) =====
export const mockAcademies: Academy[] = [
    {
        // 백엔드 필드
        id: 1,
        name: "소프트웨어캠퍼스",
        address: "서울시 강남구 테헤란로 123",
        businessNumber: "123-45-67890",
        email: "info@softwarecampus.com",
        approvalStatus: "APPROVED",
        approvedAt: "2015-03-15T10:00:00",
        // 프론트엔드 전용 필드 (백엔드에 없음)
        description: "소프트웨어캠퍼스는 실무 중심의 IT 인재를 양성하는 전문 교육기관입니다.",
        logoUrl: "https://ui-avatars.com/api/?name=Software+Campus&background=0D8ABC&color=fff",
        phone: "02-1234-5678",
        website: "https://softwarecampus.com",
        establishedDate: "2015-03-01",
        courseCount: 4,
        contentCount: 20,
        isRecruiting: true,
        isUpdated: true,
        fields: ['웹개발' as const, '데이터/AI' as const],
        tags: ["국비지원", "취업연계"],
        rating: 4.7,
        reviewCount: 45
    },
    {
        id: 2,
        name: "코딩마스터 아카데미",
        address: "서울시 구로구 디지털로 456",
        businessNumber: "987-65-43210",
        email: "contact@codingmaster.com",
        approvalStatus: "APPROVED",
        approvedAt: "2018-07-20T14:30:00",
        description: "코딩마스터 아카데미는 기초부터 심화까지 체계적인 코딩 교육을 제공합니다.",
        logoUrl: "https://ui-avatars.com/api/?name=Coding+Master&background=6366f1&color=fff",
        phone: "02-9876-5432",
        website: "https://codingmaster.com",
        establishedDate: "2018-07-15",
        courseCount: 4,
        contentCount: 12,
        isRecruiting: true,
        isUpdated: false,
        fields: ['프론트엔드' as const, '백엔드' as const],
        tags: ["코딩기초", "프로젝트"],
        rating: 4.6,
        reviewCount: 38
    },
    {
        id: 3,
        name: "데이터 인사이트",
        address: "서울시 종로구 종로 789",
        businessNumber: "456-78-90123",
        email: "support@datainsight.com",
        approvalStatus: "APPROVED",
        approvedAt: "2020-01-25T09:00:00",
        description: "데이터 분석 및 AI 전문가 양성을 위한 전문 교육 기관입니다.",
        logoUrl: "https://ui-avatars.com/api/?name=Data+Insight&background=10b981&color=fff",
        phone: "02-5555-7777",
        website: "https://datainsight.com",
        establishedDate: "2020-01-20",
        courseCount: 4,
        contentCount: 8,
        isRecruiting: false,
        isUpdated: true,
        fields: ['데이터/AI' as const],
        tags: ["빅데이터", "AI"],
        rating: 4.8,
        reviewCount: 29
    }
];

// ===== Mock Courses (백엔드 스키마 기준) =====
export const mockCourses: Course[] = [
    // 재직자 + 오프라인
    {
        // 백엔드 필드
        id: 1,
        academy: mockAcademies[0],
        category: { id: 33, categoryName: '백엔드 개발', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "Spring Boot 실무 프로젝트",
        recruitStart: "2025-01-01",
        recruitEnd: "2025-01-31",
        courseStart: "2025-02-01",
        courseEnd: "2025-04-30",
        cost: 0,
        classDay: "평일 19:00~22:00",
        location: mockAcademies[0].address,
        kdt: false,
        nailbaeum: true,
        offline: true,
        requirement: "Java 기초 지식",
        approvalStatus: "APPROVED",
        // 프론트엔드 전용 필드
        title: "Spring Boot 실무 프로젝트",
        institution: mockAcademies[0].name,
        duration: "3개월",
        format: "오프라인",
        rating: 4.7,
        reviewCount: 24,
        tags: ["Spring Boot", "JPA", "REST API"],
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Spring Boot를 활용한 실무 중심의 백엔드 개발 과정입니다.",
        highlights: ["현업 프로젝트 기반", "코드 리뷰", "AWS 배포", "포트폴리오 제작"]
    },
    {
        id: 2,
        academy: mockAcademies[1],
        category: { id: 34, categoryName: '프론트엔드', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "React 심화 과정",
        recruitStart: "2025-01-15",
        recruitEnd: "2025-02-14",
        courseStart: "2025-02-15",
        courseEnd: "2025-05-15",
        cost: 0,
        classDay: "평일 19:00~22:00",
        location: mockAcademies[1].address,
        kdt: false,
        nailbaeum: true,
        offline: true,
        requirement: "React 기초",
        approvalStatus: "APPROVED",
        title: "React 심화 과정",
        institution: mockAcademies[1].name,
        duration: "3개월",
        format: "오프라인",
        rating: 4.6,
        reviewCount: 18,
        tags: ["React", "TypeScript", "Next.js"],
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "React 고급 패턴과 TypeScript를 활용한 프론트엔드 개발 심화 과정입니다.",
        highlights: ["TypeScript 완벽 가이드", "Next.js SSR/SSG", "상태 관리", "성능 최적화"]
    },
    {
        id: 3,
        academy: mockAcademies[2],
        category: { id: 41, categoryName: '데이터엔지니어링', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "데이터 엔지니어링 실무",
        recruitStart: "2025-02-01",
        recruitEnd: "2025-02-28",
        courseStart: "2025-03-01",
        courseEnd: "2025-06-30",
        cost: 0,
        classDay: "평일 19:30~22:30",
        location: mockAcademies[2].address,
        kdt: false,
        nailbaeum: false,
        offline: true,
        requirement: "Python 기초",
        approvalStatus: "APPROVED",
        title: "데이터 엔지니어링 실무",
        institution: mockAcademies[2].name,
        duration: "4개월",
        format: "오프라인",
        rating: 4.8,
        reviewCount: 15,
        tags: ["Python", "Spark", "Airflow"],
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "빅데이터 처리와 파이프라인 구축을 위한 데이터 엔지니어링 실무 과정입니다.",
        highlights: ["Spark 대용량 처리", "Airflow 파이프라인", "클라우드 플랫폼", "실시간 처리"]
    },
    // 재직자 + 온라인
    {
        id: 4,
        academy: mockAcademies[0],
        category: { id: 39, categoryName: '클라우드운영', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "클라우드 아키텍처 설계",
        recruitStart: "2025-01-10",
        recruitEnd: "2025-02-09",
        courseStart: "2025-02-10",
        courseEnd: "2025-05-10",
        cost: 0,
        classDay: "화목 20:00~22:00",
        location: "온라인",
        kdt: false,
        nailbaeum: true,
        offline: false,
        requirement: "리눅스 기초",
        approvalStatus: "APPROVED",
        title: "클라우드 아키텍처 설계",
        institution: mockAcademies[0].name,
        duration: "3개월",
        format: "온라인",
        rating: 4.5,
        reviewCount: 22,
        tags: ["AWS", "Kubernetes", "Docker"],
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "AWS 기반의 클라우드 인프라 설계와 운영을 학습하는 온라인 과정입니다.",
        highlights: ["AWS 자격증 대비", "마이크로서비스", "컨테이너 오케스트레이션", "모니터링"]
    },
    {
        id: 5,
        academy: mockAcademies[1],
        category: { id: 32, categoryName: 'Infra운영', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "DevOps 엔지니어 양성",
        recruitStart: "2025-01-20",
        recruitEnd: "2025-02-19",
        courseStart: "2025-02-20",
        courseEnd: "2025-05-20",
        cost: 0,
        classDay: "수금 20:00~22:30",
        location: "온라인",
        kdt: false,
        nailbaeum: false,
        offline: false,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "DevOps 엔지니어 양성",
        institution: mockAcademies[1].name,
        duration: "3개월",
        format: "온라인",
        rating: 4.4,
        reviewCount: 19,
        tags: ["CI/CD", "Jenkins", "Terraform"],
        imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "CI/CD 파이프라인 구축과 인프라 자동화를 학습하는 DevOps 과정입니다.",
        highlights: ["Jenkins 파이프라인", "IaC", "모니터링 자동화", "보안"]
    },
    {
        id: 6,
        academy: mockAcademies[2],
        category: { id: 42, categoryName: 'AI/머신러닝', categoryType: 'EMPLOYEE', name: '재직자' },
        name: "AI/ML 실무 적용",
        recruitStart: "2025-02-01",
        recruitEnd: "2025-03-01",
        courseStart: "2025-03-02",
        courseEnd: "2025-06-30",
        cost: 0,
        classDay: "월수금 19:30~22:00",
        location: "온라인",
        kdt: false,
        nailbaeum: true,
        offline: false,
        requirement: "Python 중급",
        approvalStatus: "APPROVED",
        title: "AI/ML 실무 적용",
        institution: mockAcademies[2].name,
        duration: "4개월",
        format: "온라인",
        rating: 4.9,
        reviewCount: 31,
        tags: ["Python", "TensorFlow", "PyTorch"],
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "머신러닝과 딥러닝을 실무에 적용하는 AI 과정입니다.",
        highlights: ["ML 모델 개발", "딥러닝 프레임워크", "모델 배포", "MLOps"]
    },
    // 취업예정자 + 오프라인
    {
        id: 7,
        academy: mockAcademies[0],
        category: { id: 8, categoryName: '웹개발', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "풀스택 개발자 부트캠프",
        recruitStart: "2025-01-01",
        recruitEnd: "2025-01-31",
        courseStart: "2025-02-01",
        courseEnd: "2025-07-31",
        cost: 0,
        classDay: "월~금 09:00~18:00",
        location: mockAcademies[0].address,
        kdt: true,
        nailbaeum: true,
        offline: true,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "풀스택 개발자 부트캠프",
        institution: mockAcademies[0].name,
        duration: "6개월",
        format: "오프라인",
        rating: 4.8,
        reviewCount: 45,
        tags: ["Java", "Spring", "React", "MySQL"],
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "비전공자도 풀스택 개발자로 성장할 수 있는 종합 부트캠프입니다.",
        highlights: ["비전공자 맞춤", "실전 프로젝트 5회", "취업 연계", "포트폴리오 완성"]
    },
    {
        id: 8,
        academy: mockAcademies[1],
        category: { id: 8, categoryName: '웹개발', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "프론트엔드 개발자 양성",
        recruitStart: "2025-01-15",
        recruitEnd: "2025-02-14",
        courseStart: "2025-02-15",
        courseEnd: "2025-08-14",
        cost: 0,
        classDay: "월~금 09:00~18:00",
        location: mockAcademies[1].address,
        kdt: true,
        nailbaeum: true,
        offline: true,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "프론트엔드 개발자 양성",
        institution: mockAcademies[1].name,
        duration: "6개월",
        format: "오프라인",
        rating: 4.7,
        reviewCount: 38,
        tags: ["HTML", "CSS", "JavaScript", "React"],
        imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "웹 퍼블리싱부터 React까지 프론트엔드 전문가로 성장하는 과정입니다.",
        highlights: ["기초부터 차근차근", "반응형 웹", "SPA 프레임워크", "취업 멘토링"]
    },
    {
        id: 9,
        academy: mockAcademies[2],
        category: { id: 8, categoryName: '웹개발', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "백엔드 개발자 취업 과정",
        recruitStart: "2025-02-01",
        recruitEnd: "2025-02-28",
        courseStart: "2025-03-01",
        courseEnd: "2025-08-31",
        cost: 0,
        classDay: "월~금 09:00~18:00",
        location: mockAcademies[2].address,
        kdt: true,
        nailbaeum: false,
        offline: true,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "백엔드 개발자 취업 과정",
        institution: mockAcademies[2].name,
        duration: "6개월",
        format: "오프라인",
        rating: 4.6,
        reviewCount: 28,
        tags: ["Java", "Spring Boot", "Database"],
        imageUrl: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "서버 개발의 모든 것을 배우고 백엔드 개발자로 취업하는 과정입니다.",
        highlights: ["Java 기초~심화", "Spring Boot 실전", "DB 설계", "채용 연계"]
    },
    // 취업예정자 + 온라인
    {
        id: 10,
        academy: mockAcademies[0],
        category: { id: 1, categoryName: '웹개발', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "코딩 기초 입문 과정",
        recruitStart: "2025-01-10",
        recruitEnd: "2025-02-09",
        courseStart: "2025-02-10",
        courseEnd: "2025-05-10",
        cost: 0,
        classDay: "매일 19:00~21:00",
        location: "온라인",
        kdt: true,
        nailbaeum: true,
        offline: false,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "코딩 기초 입문 과정",
        institution: mockAcademies[0].name,
        duration: "3개월",
        format: "온라인",
        rating: 4.5,
        reviewCount: 52,
        tags: ["Python", "알고리즘", "자료구조"],
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "비전공자를 위한 프로그래밍 기초 입문 과정입니다.",
        highlights: ["완전 초보 환영", "1:1 튜터링", "알고리즘 기초", "미니 프로젝트"]
    },
    {
        id: 11,
        academy: mockAcademies[1],
        category: { id: 1, categoryName: '웹개발', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "웹 개발 종합 과정",
        recruitStart: "2025-01-20",
        recruitEnd: "2025-02-19",
        courseStart: "2025-02-20",
        courseEnd: "2025-08-19",
        cost: 0,
        classDay: "월수금 19:00~22:00",
        location: "온라인",
        kdt: true,
        nailbaeum: true,
        offline: false,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "웹 개발 종합 과정",
        institution: mockAcademies[1].name,
        duration: "6개월",
        format: "온라인",
        rating: 4.6,
        reviewCount: 34,
        tags: ["HTML", "CSS", "JavaScript", "Node.js"],
        imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "웹 개발의 A부터 Z까지 온라인으로 편하게 배우는 종합 과정입니다.",
        highlights: ["실시간 강의", "녹화본 복습", "Q&A 지원", "프로젝트 피드백"]
    },
    {
        id: 12,
        academy: mockAcademies[2],
        category: { id: 3, categoryName: '데이터/AI', categoryType: 'JOB_SEEKER', name: '취업예정자' },
        name: "데이터 분석가 양성 과정",
        recruitStart: "2025-02-01",
        recruitEnd: "2025-03-01",
        courseStart: "2025-03-02",
        courseEnd: "2025-09-01",
        cost: 0,
        classDay: "화목 19:00~22:00",
        location: "온라인",
        kdt: true,
        nailbaeum: false,
        offline: false,
        requirement: "없음",
        approvalStatus: "APPROVED",
        title: "데이터 분석가 양성 과정",
        institution: mockAcademies[2].name,
        duration: "6개월",
        format: "온라인",
        rating: 4.7,
        reviewCount: 29,
        tags: ["Python", "SQL", "Pandas", "Tableau"],
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "데이터 수집부터 분석, 시각화까지 데이터 분석가로 성장하는 온라인 과정입니다.",
        highlights: ["실무 프로젝트", "SQL 마스터", "시각화 도구", "포트폴리오 3개"]
    }
];

// mockCommunityPosts, mockBoardPosts는 communityService.ts의 실제 API로 대체되었습니다.

// ===== Mock Course Q&A =====
export const mockCourseQnAs: CourseQna[] = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    courseId: (i % 12) + 1,
    accountId: i + 200,
    writerName: `학습자${i + 1}`,
    title: i % 4 === 0
        ? "비전공자도 수강 가능한가요?"
        : i % 4 === 1
            ? "수업 시간표가 어떻게 되나요?"
            : i % 4 === 2
                ? "취업 지원은 어떻게 이루어지나요?"
                : "노트북 사양이 어느 정도 되어야 하나요?",
    questionText: i % 4 === 0
        ? "비전공자인데 수강 가능할까요? 사전에 준비해야 할 것이 있다면 알려주세요."
        : i % 4 === 1
            ? "평일 주간반인가요, 야간반인가요? 주말 수업도 있나요?"
            : i % 4 === 2
                ? "취업 지원 프로그램에는 어떤 것들이 포함되어 있나요?"
                : "개인 노트북으로 수업을 들어야 하나요? 어느 정도 사양이 필요한가요?",
    isAnswered: i % 3 !== 0,
    answerText: i % 3 !== 0 ? (i % 4 === 0
        ? "네, 비전공자도 충분히 수강 가능합니다. 기초부터 체계적으로 가르쳐드리며, 별도의 사전 지식은 필요하지 않습니다."
        : i % 4 === 1
            ? "평일 오전 9시부터 오후 6시까지 진행되며, 주말 수업은 없습니다."
            : i % 4 === 2
                ? "이력서/포트폴리오 작성 지원, 모의 면접, 기업 매칭 등의 서비스를 제공합니다."
                : "개인 노트북 지참을 권장합니다. 최소 RAM 8GB, SSD 256GB 이상을 추천드립니다.") : undefined,
    answeredById: i % 3 !== 0 ? 1 : undefined,
    answeredByName: i % 3 !== 0 ? "담당자" : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    viewCount: 50 + i * 10
}));

// ===== Mock Academy Q&A =====
export const mockAcademyQnAs: AcademyQA[] = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    academyId: (i % 3) + 1,
    title: i % 3 === 0
        ? "국비지원 과정 신청 자격이 어떻게 되나요?"
        : i % 3 === 1
            ? "주말 반도 운영하시나요?"
            : "수료 후 취업 연계는 어떤 식으로 진행되나요?",
    questionText: i % 3 === 0
        ? "현재 대학생인데 국비지원 과정 신청이 가능한지 궁금합니다. 졸업 예정자만 가능한가요?"
        : i % 3 === 1
            ? "직장인이라 평일에는 시간이 안 되는데 주말 반 개설 계획이 있으신가요?"
            : "수료 후에 어떤 기업으로 취업이 가능한지, 그리고 취업 지원 기간은 얼마나 되는지 알고 싶습니다.",
    isApproved: i % 2 === 0 ? 'APPROVED' : 'PENDING',
    answerText: i % 2 === 0 ? (i % 3 === 0
        ? "네, 졸업 예정자(4학년)부터 신청 가능합니다. 자세한 자격 요건은 고용노동부 HRD-Net을 참고해주세요."
        : i % 3 === 1
            ? "현재 주말 반은 운영하고 있지 않습니다. 추후 개설 시 공지해 드리겠습니다."
            : "수료 후 6개월간 취업 지원을 해드리며, 협약 기업 매칭 및 면접 컨설팅을 제공합니다.") : undefined,
    answeredById: i % 2 === 0 ? 1 : undefined,
    answeredByName: i % 2 === 0 ? "담당자" : undefined,
    approvedAt: i % 2 === 0 ? new Date(Date.now() - i * 86400000 + 3600000).toISOString() : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    viewCount: 30 + i * 5,
    accountId: i + 100,
    writerName: `사용자${i + 1}`,
    isAnswered: i % 2 === 0
}));

// ===== Service Functions =====
export const fetchHomeBanners = async (): Promise<Banner[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBanners;
};

export const fetchHomeCourseSections = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        employeeBest: mockCourses.filter(c => c.category.categoryType === 'EMPLOYEE').slice(0, 4),
        jobSeekerBest: mockCourses.filter(c => c.category.categoryType === 'JOB_SEEKER').slice(0, 4),
        closingSoon: mockCourses.slice(4, 8)
    };
};

// fetchCommunityHighlights는 homeApi.ts의 실제 API로 대체되었습니다.

export const fetchCourses = async (filters: any): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let filtered = [...mockCourses];

    if (filters.keyword) {
        filtered = filtered.filter(c => c.name.includes(filters.keyword));
    }

    if (filters.categoryType) {
        filtered = filtered.filter(c => c.category.categoryType === filters.categoryType);
    }

    // 상세 카테고리 필터링 (categoryName)
    if (filters.category) {
        filtered = filtered.filter(c => c.category.categoryName === filters.category);
    }

    if (filters.offline !== undefined) {
        filtered = filtered.filter(c => c.offline === filters.offline);
    }

    return filtered;
};

export const fetchCourseById = async (courseId: number): Promise<Course | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCourses.find(c => c.id === courseId);
};

export const fetchAcademies = async (): Promise<Academy[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockAcademies;
};

export const fetchAcademyById = async (academyId: number): Promise<Academy | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAcademies.find(a => a.id === academyId);
};

export const fetchCoursesByAcademyId = async (academyId: number): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockCourses.filter(c => c.academy.id === academyId);
};

// fetchBoardPosts, fetchCommunityHighlights는 communityService.ts와 homeApi.ts의 실제 API로 대체되었습니다.

export const fetchCourseQnAs = async (
    courseId: number,
    page: number = 1,
    limit: number = 5,
    searchKeyword?: string
): Promise<{ qnas: CourseQna[], totalCount: number }> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    let filtered = mockCourseQnAs.filter(q => q.courseId === courseId);

    // 검색 필터
    if (searchKeyword && searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(keyword) ||
            q.questionText.toLowerCase().includes(keyword) ||
            (q.answerText && q.answerText.toLowerCase().includes(keyword))
        );
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
        qnas: filtered.slice(start, end),
        totalCount: filtered.length
    };
};

export const fetchAcademyQnAs = async (
    academyId: number,
    page: number = 1,
    limit: number = 5,
    searchKeyword?: string
): Promise<{ qnas: AcademyQA[], totalCount: number }> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    let filtered = mockAcademyQnAs.filter(q => q.academyId === academyId);

    // 검색 필터
    if (searchKeyword && searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(keyword) ||
            q.questionText.toLowerCase().includes(keyword) ||
            (q.answerText && q.answerText.toLowerCase().includes(keyword))
        );
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
        qnas: filtered.slice(start, end),
        totalCount: filtered.length
    };
};
