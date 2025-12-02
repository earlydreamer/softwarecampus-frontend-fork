/**
 * 공통 포맷팅 유틸리티 함수
 */

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 단위의 파일 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * HTML 문자열에서 텍스트 내용만 추출
 * 주의: 내부 비교/길이 계산 용도로만 사용, 렌더링에는 사용하지 않음
 * @param html - HTML 문자열
 * @returns 순수 텍스트 내용
 */
export const getTextContent = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};
