// ===== Enum 타입 정의 (백엔드와 완전 일치) =====
export type AccountType = 'USER' | 'ACADEMY' | 'ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ===== 사용자(User) 타입 정의 (백엔드 AccountResponse DTO와 완전 일치) =====
export interface User {
    id: number; // Long
    email: string;
    userName: string;
    phoneNumber: string;
    accountType: AccountType;
    approvalStatus: ApprovalStatus;
    address: string | null;
    affiliation: string | null;
    position: string | null;
    academyId?: number | null; // 기관 회원일 경우 기관 ID, 일반 회원은 null
}

// ===== 회원가입 폼 데이터 (백엔드 SignupRequest DTO와 완전 일치) =====
export interface SignupFormData {
    email: string;
    password: string;
    userName: string;
    phoneNumber: string;
    address: string | null;
    affiliation: string | null;
    position: string | null;
    accountType: AccountType;
    academyId: number | null;
}

// 백엔드 BoardCategory enum (NOTICE, QUESTION, COURSE_STORY, CODING_STORY)
export type BoardCategory = 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY';

// 과정 카테고리는 백엔드 CourseCategory 엔티티 참조
export type CourseCategoryType = '재직자' | '취업예정자';
export type CourseFormat = '온라인' | '오프라인' | '혼합';

// 백엔드 CategoryType enum
export type CategoryType = 'EMPLOYEE' | 'JOB_SEEKER';

// 상세 카테고리 (취업예정자용)
export type JobSeekerCategoryName =
    | '웹개발'
    | '모바일'
    | '데이터/AI'
    | '클라우드'
    | '보안'
    | 'IoT/임베디드'
    | '게임/블록체인';

// 상세 카테고리 (재직자용)
export type EmployeeCategoryName =
    | 'Infra운영'
    | '백엔드 개발'
    | '프론트엔드 개발'
    | 'DB'
    | 'AI'
    | 'SW요구분석'
    | '백엔드개발자'
    | '클라우드엔지니어'
    | '프론트엔드개발자'
    | '데이터엔지니어'
    | 'AI엔지니어'
    | 'SW아키텍트'
    | '정보보안전문가'
    | 'IT기획자/컨설턴트'
    | '데이터분석가'
    | '비즈니스분석가'
    | '데이터사이언티스트';

export type AcademyField = '프론트엔드' | '백엔드' | '풀스택' | '웹개발' | '모바일' | '데이터/AI' | 'AI/머신러닝' | '클라우드운영' | 'Infra운영' | '보안' | 'IoT/임베디드' | '게임/블록체인' | '데이터엔지니어링' | '데이터분석' | '빅데이터' | 'DB' | 'SW아키텍처' | 'SW구조' | '정보보안전문가' | 'IT기획/컨설팅' | '기획·마케팅·기타' | '디자인·3D' | '프로젝트·취준·창업' | '전체';

// UI 표시용 매핑 (백엔드 enum → 한글)
export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
    NOTICE: '공지사항',
    QUESTION: '문의사항',
    COURSE_STORY: '진로이야기',
    CODING_STORY: '코딩이야기',
};

// ===== 과정(Course) 관련 타입 정의 =====
export interface CourseCategory {
    id: number;
    categoryName: string; // 상세 카테고리명 (웹개발, 모바일 etc.)
    categoryType: CategoryType; // EMPLOYEE or JOB_SEEKER
    // UI 표시용
    name?: string; // 한글명 (재직자/취업예정자)
    description?: string;
}

// 커리큘럼 정보 (백엔드 CourseCurriculum 엔티티와 일치)
export interface CourseCurriculum {
    id?: number;
    chapterNumber: number;      // 백엔드: int chapterNumber
    chapterName: string;         // 백엔드: String chapterName
    chapterDetail?: string;      // 백엔드: String chapterDetail (TEXT)
    chapterTime: number;         // 백엔드: int chapterTime (시간)
}

export interface Course {
    id: number;
    name: string; // 백엔드 필드
    academy: Academy;
    category: CourseCategory;
    recruitStart?: string; // LocalDate
    recruitEnd?: string; // LocalDate
    courseStart?: string; // LocalDate
    courseEnd?: string; // LocalDate
    cost?: number;
    classDay?: string;
    location?: string;
    isKdt: boolean;
    isNailbaeum: boolean;
    isOffline: boolean;
    requirement?: string;
    isApproved: ApprovalStatus;
    approvedAt?: string;
    // 커리큘럼 정보 (백엔드: List<CourseCurriculum> curriculums)
    curriculums?: CourseCurriculum[];
    // UI 표시용 추가 필드 (백엔드에 없음)
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    imageUrl?: string;
    description?: string;
    highlights?: string[];
    // 호환성을 위한 필드
    title?: string;
    institution?: string;
    duration?: string;
    format?: string;
}

// ===== 기관(Academy) 관련 타입 정의 =====
export interface Academy {
    // 백엔드 필드
    id: number;
    name: string;
    address: string;
    businessNumber: string;
    email: string;
    isApproved: ApprovalStatus;
    approvedAt?: string;
    // UI 표시용 추가 필드 (백엔드에 없음)
    description?: string;
    logoUrl?: string;
    phone?: string;
    website?: string;
    establishedDate?: string;
    courseCount?: number;
    contentCount?: number;
    isRecruiting?: boolean;
    isUpdated?: boolean;
    fields?: AcademyField[];
    tags?: string[];
    rating?: number;
    reviewCount?: number;
}

// ===== 게시판(Board) 관련 타입 정의 =====
export interface Board {
    // 백엔드 필드
    id: number;
    title: string;
    text: string; // 백엔드 필드명
    category: BoardCategory;
    author: {
        id: number;
        userName: string;
        avatar?: string;
    };
    hits: number; // 백엔드 필드명
    secret: boolean; // 백엔드 필드명 (isSecret)
    createdAt: string;
    updatedAt: string;
    // 계산된 필드
    recommendCount?: number;
    commentCount?: number;
    hasAttachment?: boolean;
    isRecommended?: boolean;
    // 호환성
    // 호환성
    isSecret?: boolean;
}

export interface Comment {
    id: number;
    boardId: number;
    text: string;
    author: {
        id: number;
        userName: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
}

// 커뮤니티 메인 페이지용
export interface CommunityPost {
    id: number;
    title: string;
    author: string;
    recommendations: number;
    category: BoardCategory;
    createdAt: string;
    board?: string; // 호환성
}

export interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    link: string;
}

// ===== 과정 리뷰 관련 타입 정의 =====
export interface CourseReview {
    id: number;
    courseId: number;
    author: {
        id: number;
        userName: string;
        avatar?: string;
    };
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    isVerified?: boolean;
    helpfulCount?: number;
}

// ===== 과정 Q&A 관련 타입 정의 =====
export interface CourseQnA {
    id: number;
    courseId: number;
    author: {
        id: number;
        userName: string;
        avatar?: string;
    };
    title: string;
    content: string;
    isAnswered: boolean;
    answer?: {
        content: string;
        answeredBy: {
            id: number;
            userName: string;
            avatar?: string;
        };
        answeredAt: string;
    };
    createdAt: string;
    viewCount: number;
}
