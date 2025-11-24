// ===== Enum 타입 정의 (백엔드와 통일) =====
export type AccountType = 'USER' | 'ACADEMY' | 'ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING';
export type BoardCategory = 'NOTICE' | 'CAREER' | 'CODING' | 'QNA';

// 과정 카테고리는 백엔드 CourseCategory 엔티티의 name 필드 참조
export type CourseCategoryType = '재직자' | '취업예정자';
export type CourseFormat = '온라인' | '오프라인' | '혼합';
export type AcademyField = '웹개발' | '모바일' | '데이터·AI' | '클라우드·보안' | 'IoT·임베디드·반도체' | '게임·블록체인' | '기획·마케팅·기타' | '디자인·3D' | '프로젝트·취준·창업' | '전체';

// UI 표시용 매핑 (백엔드 enum → 한글)
export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
  NOTICE: '공지사항',
  CAREER: '진로이야기',
  CODING: '코딩이야기',
  QNA: '문의사항',
};

// ===== 과정(Course) 관련 타입 정의 =====
export interface CourseCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Course {
  id: number;
  name: string; // title → name (백엔드 통일)
  academy: Academy; // institution(문자열) → academy(객체)
  category: CourseCategory; // 카테고리 객체
  recruitStart?: string; // LocalDate
  recruitEnd?: string; // LocalDate
  courseStart?: string; // LocalDate
  courseEnd?: string; // LocalDate
  cost?: number;
  classDay?: string;
  location?: string;
  isKdt: boolean;
  isNailbaeum: boolean;
  isOffline: boolean; // format 대신 사용
  requirement?: string;
  isApproved: ApprovalStatus;
  approvedAt?: string;
  // UI 표시용 추가 필드
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  imageUrl?: string;
  description?: string;
  highlights?: string[];
}

// ===== 기관(Academy) 관련 타입 정의 =====
export interface Academy {
  id: number;
  name: string;
  address: string;
  businessNumber: string;
  email: string;
  isApproved: ApprovalStatus; // isVerified → isApproved (백엔드 통일)
  approvedAt?: string;
  // UI 표시용 추가 필드
  description?: string;
  logoUrl?: string;
  phone?: string;
  website?: string;
  establishedDate?: string;
  courseCount?: number;
  contentCount?: number;
  isRecruiting?: boolean; // 모집중 여부
  isUpdated?: boolean; // 최근 업데이트 여부
  fields?: AcademyField[]; // 교육 분야
  tags?: string[];
  rating?: number;
  reviewCount?: number;
}

// ===== 게시판(Board) 관련 타입 정의 =====
export interface Board {
  id: number;
  title: string;
  text: string; // content → text (백엔드 통일)
  category: BoardCategory;
  author: {
    id: number;
    userName: string; // name → userName (백엔드 통일)
    avatar?: string;
  };
  hits: number; // viewCount → hits (백엔드 통일)
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  // 계산된 필드 (백엔드 또는 프론트엔드에서 계산)
  recommendCount?: number; // boardRecommends.length
  commentCount?: number; // comments.length
  hasAttachment?: boolean;
  isRecommended?: boolean; // 현재 사용자의 추천 여부
}

export interface Comment {
  id: number;
  boardId: number; // postId → boardId (백엔드 통일)
  text: string; // content → text (백엔드 통일)
  author: {
    id: number;
    userName: string; // name → userName (백엔드 통일)
    avatar?: string;
  };
  topCommentId?: number; // parentId → topCommentId (백엔드 통일)
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean; // soft-delete 플래그
  // UI용 추가 필드
  subComments?: Comment[];
}

// 커뮤니티 메인 페이지용 간단한 게시글 정보
export interface CommunityPost {
  id: number;
  title: string;
  author: string;
  recommendations: number;
  category: BoardCategory; // board → category (백엔드 통일)
  createdAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
}

// ===== Q&A 관련 타입 정의 =====
// 기관 Q&A (백엔드의 AcademyQuestion + AcademyAnswer를 통합한 프론트엔드 타입)
export interface AcademyQnA {
  id: number;
  academyId: number;
  questionNumber?: string;
  title: string;
  text: string; // question → text (백엔드 통일)
  answer?: string; // AcademyAnswer의 text
  author: {
    id: number;
    userName: string; // name → userName (백엔드 통일)
    avatar?: string;
  };
  isApproved: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  approvedAt?: string;
}

// 과정 Q&A (백엔드의 CourseQuestion + CourseAnswer를 통합한 프론트엔드 타입)
export interface CourseQnA {
  id: number;
  courseId: number;
  title: string;
  text: string; // question → text (백엔드 통일)
  answer?: string; // CourseAnswer의 text
  author: {
    id: number;
    userName: string; // name → userName (백엔드 통일)
    avatar?: string;
  };
  isApproved: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
}

// ===== 계정(Account) 관련 타입 정의 =====
export interface Account {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string;
  accountType: AccountType; // role → accountType (백엔드 통일)
  affiliation?: string; // company → affiliation (백엔드 통일)
  position?: string; // department → position (백엔드 통일)
  address?: string;
  accountApproved?: ApprovalStatus; // 기관 계정 승인 상태
  profileImage?: string;
  createdAt: string;
  // 기관 계정인 경우 기관 정보
  academyInfo?: {
    id: number;
    name: string;
    isApproved: ApprovalStatus; // isVerified → isApproved
  };
}

// 회원가입 요청 타입
export interface AccountCreateRequest {
  userName: string;
  password: string;
  passwordConfirm: string;
  email: string;
  phoneNumber: string;
  accountType: AccountType; // role → accountType
  affiliation?: string; // company → affiliation
  position?: string; // department → position
  academyId?: number; // 기관회원일 경우 선택한 기관 ID
}

// 기관 생성 요청 타입
export interface AcademyCreateRequest {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  businessNumber: string; // 사업자등록번호
}

// ===== 마이페이지 관련 타입 정의 =====
export interface MyPost {
  id: number;
  title: string;
  category: BoardCategory; // CommunityCategory → BoardCategory
  hits: number; // viewCount → hits
  recommendCount?: number;
  commentCount?: number;
  createdAt: string;
}

export interface MyComment {
  id: number;
  boardId: number; // postId → boardId
  postTitle: string;
  text: string; // content → text
  category: BoardCategory; // CommunityCategory → BoardCategory
  createdAt: string;
}

export interface CourseFavorite {
  id: number;
  courseId: number;
  courseName: string; // courseTitle → courseName
  academy: string; // institution → academy (간단 표시용은 문자열)
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  createdAt: string; // bookmarkedAt → createdAt
}

// ===== 하위 호환성을 위한 타입 별칭 (Deprecated) =====
// 기존 코드와의 호환성을 위해 임시로 유지, 추후 제거 예정
/** @deprecated Use BoardCategory instead */
export type CommunityCategory = BoardCategory;

/** @deprecated Use Board instead */
export type BoardPost = Board;

/** @deprecated Use Account instead */
export type UserProfile = Account;

/** @deprecated Use AccountCreateRequest instead */
export type SignupFormData = AccountCreateRequest;

/** @deprecated Use AcademyCreateRequest instead */
export type AcademyCreateFormData = AcademyCreateRequest;

/** @deprecated Use AccountType instead */
export type UserRole = AccountType;

/** @deprecated Use CourseFavorite instead */
export type BookmarkedCourse = CourseFavorite;
