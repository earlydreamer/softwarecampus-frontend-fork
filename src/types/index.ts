// ===== Enum 타입 정의 (백엔드와 완전 일치) =====
export type AccountType = 'USER' | 'ACADEMY' | 'ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ===== 공통 모달 상태 타입 정의 =====
/**
 * AlertModal 컴포넌트의 상태를 관리하기 위한 공통 타입
 * 여러 컴포넌트에서 재사용되어 일관된 알림 UX를 제공합니다.
 */
export type AlertModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    onCloseCallback?: () => void;
};

// ===== 사용자(Account) 타입 정의 (백엔드 Account 엔티티 참조) =====
// 변경: User -> Account
export interface Account {
    id: number; // Long
    email: string;
    userName: string;
    phoneNumber: string;
    accountType: AccountType;
    approvalStatus: ApprovalStatus; // 변경: accountApproved -> approvalStatus (백엔드 일치)
    address: string | null;
    affiliation: string | null;
    position: string | null;
    academyId?: number | null; // 기관 회원일 경우 기관 ID, 일반 회원은 null
    profileImage?: string | null; // 프로필 이미지 URL
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
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
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
    kdt: boolean;
    nailbaeum: boolean;
    offline: boolean;
    requirement?: string;
    approvalStatus: ApprovalStatus;
    approvedAt?: string;
    // 과정 등록자 정보 (백엔드: requester)
    requesterId?: number;
    requesterName?: string;
    // 커리큘럼 정보 (백엔드: List<CourseCurriculum> curriculums)
    curriculums?: CourseCurriculum[];
    // UI 표시용 추가 필드 (백엔드에 없음 - 추후 추가 필요)
    rating?: number;
    reviewCount?: number;
    tags?: string[];
    imageUrl?: string; // 썸네일 이미지 (목록용)
    thumbnailImageId?: number; // 썸네일 이미지 ID (삭제 API용)
    headerImageUrl?: string; // 헤더 이미지 (상세 페이지 배경)
    headerImageId?: number; // 헤더 이미지 ID (삭제 API용)
    description?: string;
    highlights?: string[];
    externalLink?: string;
    // 호환성을 위한 필드 (제거 예정)
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
    approvalStatus: ApprovalStatus;
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

// 게시판 첨부파일
export interface BoardAttachment {
    id: number;
    originalFile: string;  // 원본 파일명
    savedFile: string;     // 저장된 파일명
    fileSize: number;
    isNew?: boolean;       // 프론트엔드에서 새로 추가된 파일인지 여부
    file?: File;           // 업로드 전 파일 객체
    previewUrl?: string;   // 이미지 미리보기 URL
}

export interface Board {
    // 백엔드 필드
    id: number;
    title: string;
    text: string; // 백엔드 필드명
    category: BoardCategory;
    account: { // 변경: author -> account
        id: number;
        userName: string;
        avatar?: string;
    };
    hits: number; // 백엔드 필드명
    secret: boolean; // 백엔드 필드명 (isSecret)
    createdAt: string;
    updatedAt?: string;

    // 백엔드 추가 필드
    likeCount: number;
    like?: boolean; // 백엔드 필드명: like
    owner?: boolean; // 백엔드 필드명: owner

    // 계산된 필드 및 호환성
    commentCount?: number;
    hasAttachment?: boolean;
    isSecret?: boolean; // 호환성
    comments?: Comment[]; // 상세 조회 시 포함됨
    attachments?: BoardAttachment[]; // 첨부파일 목록
}

export interface Comment {
    id: number;
    boardId?: number;
    text: string;
    account: {
        id: number;
        userName: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
    subComments?: Comment[]; // 대댓글 지원
}

// 커뮤니티 메인 페이지용
export interface CommunityPost {
    id: number;
    title: string;
    account: {
        userName: string;
    };
    likeCount: number; // 변경: recommendations -> likeCount
    viewCount: number; // 추가
    commentCount: number; // 추가
    category: BoardCategory;
    categoryName: string; // 변경: board -> categoryName
    createdAt: string;
}

export interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    link: string;
}

// ===== 과정 리뷰 관련 타입 정의 =====
export type ReviewSectionType = 'CURRICULUM' | 'COURSEWARE' | 'INSTRUCTOR' | 'EQUIPMENT' | 'OTHER';

export const REVIEW_SECTION_LABELS: Record<ReviewSectionType, string> = {
    CURRICULUM: '커리큘럼',
    COURSEWARE: '교재/강의자료',
    INSTRUCTOR: '강사',
    EQUIPMENT: '실습장비',
    OTHER: '기타의견',
};

export interface ReviewSection {
    sectionType: ReviewSectionType;
    score: number;
    comment?: string;
}

export interface ReviewAttachment {
    id: number;
    originalFileName: string;
    downloadUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
}

export interface CourseReview {
    id: number;
    courseId: number;
    courseName?: string; // 백엔드에서 제공하는 과정명
    writerId: number;
    writerName: string; // 백엔드에서 제공
    averageScore: number; // 백엔드: averageScore
    sections: ReviewSection[]; // 백엔드: sections (CURRICULUM, COURSEWARE, INSTRUCTOR, EQUIPMENT)
    comment: string; // 기타 의견
    attachments: ReviewAttachment[]; // 첨부파일
    likeCount: number;
    dislikeCount: number;
    myLikeType?: string; // 추가: 내 좋아요 상태 (LIKE, DISLIKE, NONE)
    approvalStatus: ApprovalStatus;
    createdAt: string; // 백엔드에서 제공 (ISO 8601)
}

// ===== 과정 Q&A 관련 타입 정의 =====

/** Course Q&A 첨부파일 정보 */
export interface CourseQnaFile {
    id: number;
    originName: string;
    fileUrl: string;
}

export interface CourseQna { // 변경: CourseQnA -> CourseQna
    id: number;
    courseId?: number; // 백엔드 응답에 없지만 프론트엔드에서 필요할 수 있음

    // 구조 변경: writer 객체 -> 평탄화
    accountId: number;
    writerName: string;

    title: string;
    questionText: string; // 변경: content -> questionText
    isAnswered: boolean;

    // 구조 변경: answer 객체 제거 및 평탄화
    answerText?: string;

    // 구조 변경: answeredBy 객체 -> 평탄화
    answeredById?: number;
    answeredByName?: string;

    createdAt: string;
    updatedAt: string;
    viewCount?: number;

    /** 첨부파일 목록 */
    files?: CourseQnaFile[];
}

// ===== 기관 Q&A 관련 타입 정의 =====
export interface AcademyQA { // 변경: AcademyQnA -> AcademyQA
    id: number;
    academyId: number;

    // 구조 변경: writer 객체 -> 평탄화
    accountId: number;
    writerName: string;

    title: string;
    questionText: string; // 변경: content -> questionText

    // 구조 변경
    answerText?: string;
    isAnswered: boolean; // 추가: 답변 완료 여부

    // 구조 변경: answeredBy 객체 -> 평탄화
    answeredById?: number;
    answeredByName?: string;

    isApproved?: ApprovalStatus; // 백엔드 DTO에는 없으나 컨트롤러 로직 확인 필요 (일단 선택적)
    approvedAt?: string;

    createdAt: string;
    updatedAt: string;
    viewCount?: number;
}

// ===== 관리자 페이지용 타입 정의 =====
export type CourseTarget = '취업예정자' | '재직자';

export interface CourseApprovalRequest {
    id: number;
    courseName: string;
    academyId: number;      // 요청 기관 ID
    academyName: string;    // 요청 기관명
    requesterId?: number;   // 등록자 ID (기관 담당자)
    requesterName?: string; // 등록자 이름 (기관 담당자)
    category: string;
    target: CourseTarget;
    format: CourseFormat;
    requestType: '등록' | '삭제' | '수정';
    requestDate: string;
    status: '대기' | '승인' | '거부';
    recruitStart?: string;
    recruitEnd?: string;
    courseStart?: string;
    courseEnd?: string;
    cost?: number;
    classDay?: string;      // 수업 요일
    isKdt?: boolean;
    isNailbaeum?: boolean;
    isOffline?: boolean;
    location?: string;
    description?: string;
    imageUrl?: string;           // 썸네일 이미지
    thumbnailImageId?: number;   // 썸네일 이미지 ID (삭제 API용)
    headerImageUrl?: string;     // 헤더 배경 이미지
    headerImageId?: number;      // 헤더 이미지 ID (삭제 API용)
}

export interface ReviewApprovalRequest {
    id: number;
    reviewId: number;
    courseName: string;
    academyId: number;
    writerName: string;
    rating: number;
    comment: string;
    requestType: '등록' | '삭제';
    requestDate: string;
    status: '대기' | '승인' | '거부';
}

export interface BannerData {
    id: number;
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl: string;
    displayOrder: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdDate: string;
}

export interface AdminUser {
    id: number;
    userName: string;
    email: string;
    accountType: 'ADMIN' | 'USER' | 'ACADEMY';
    registeredDate: string;
    lastLogin: string;
    status: '활성' | '정지' | '탈퇴';
    postCount: number;
    commentCount: number;
}

export interface AdminAcademy {
    id: number;
    name: string;
    businessNumber: string;
    address: string;
    phone: string;
    email: string;
    registeredDate: string;
    courseCount: number;
    status: '활성' | '정지' | '대기';
}
