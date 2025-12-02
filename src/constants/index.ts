export const QNA_PER_PAGE = 5;

/**
 * 기본 이미지 URL 상수
 * - 외부 Unsplash URL 사용 중, 추후 자체 호스팅 이미지로 마이그레이션 가능
 * - 이미지 변경 시 이 파일만 수정하면 전체 애플리케이션에 반영됨
 */
export const DEFAULT_IMAGES = {
    /** 과정 목록에서 표시되는 썸네일 기본 이미지 */
    COURSE_THUMBNAIL: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    /** 과정 상세 페이지의 헤더 배경 기본 이미지 */
    COURSE_HEADER: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
} as const;

/**
 * 파일 업로드 설정
 * - 게시판 첨부파일 및 에디터 이미지에 적용되는 공통 설정
 * - 에디터 이미지도 첨부파일로 통합 관리됨
 */
export const FILE_UPLOAD_CONFIG = {
    /** 최대 첨부파일 개수 (에디터 본문 이미지 포함) */
    MAX_FILE_COUNT: 10,
    /** 최대 파일 크기 (바이트 단위) - 50MB */
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    /** 허용 확장자 목록 */
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'zip', 'rar'],
    /** 이미지 확장자 목록 */
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    /** 허용 MIME 타입 */
    ALLOWED_MIME_TYPES: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/markdown', 'text/csv',
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
    ],
    /** 이미지 MIME 타입 */
    IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;
