/**
 * 공통 포맷팅 유틸리티 함수
 */

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 단위의 파일 크기 (optional)
 * @param showUnknownForZero - 0일 때 '크기 정보 없음' 표시 여부 (기본: true)
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export const formatFileSize = (bytes?: number, showUnknownForZero: boolean = true): string => {
    // bytes가 undefined, null, NaN인 경우 처리
    if (bytes === undefined || bytes === null || isNaN(bytes)) {
        return '크기 정보 없음';
    }
    // 백엔드에서 에디터 업로드 이미지의 경우 fileSize를 0으로 저장하므로
    // 0인 경우도 '크기 정보 없음'으로 표시 (옵션으로 제어 가능)
    if (bytes === 0) return showUnknownForZero ? '크기 정보 없음' : '0 Bytes';
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
