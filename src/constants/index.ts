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
