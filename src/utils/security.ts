import DOMPurify from 'dompurify';

/**
 * 기본 입력 살균 (Sanitization) 함수
 * - DOMPurify를 사용하여 XSS 공격을 방지합니다.
 * - 허용된 태그와 속성만 남기고 위험한 요소는 제거합니다.
 */
export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    return DOMPurify.sanitize(input);
};

/**
 * 객체 내의 모든 문자열 값을 재귀적으로 살균합니다.
 */
export const sanitizeObject = <T>(obj: T): T => {
    if (typeof obj === 'string') {
        return sanitizeInput(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item)) as unknown as T;
    }

    if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = sanitizeObject((obj as any)[key]);
            }
        }
        return result;
    }

    return obj;
};

/**
 * URL 살균 함수 (허용 목록 기반)
 * - 안전한 프로토콜(http://, https://)과 상대 경로만 허용합니다.
 * - javascript:, data:, vbscript:, file: 등 위험한 프로토콜을 차단합니다.
 * - CSS background-image 등에서 악용될 수 있는 data: URI도 차단합니다.
 * 
 * @param url - 검증할 URL 문자열
 * @param allowDataUri - data: URI 허용 여부 (기본값: false)
 * @returns 안전한 URL 또는 빈 문자열
 */
export const sanitizeUrl = (url: string, allowDataUri: boolean = false): string => {
    if (!url) return '';

    // 공백 제거
    const trimmedUrl = url.trim();

    // 빈 문자열 체크
    if (!trimmedUrl) return '';

    // 위험한 프로토콜 블랙리스트 (추가 보안 계층)
    const dangerousProtocols = [
        'javascript:',
        'vbscript:',
        'file:',
        'about:',
    ];

    // data: URI는 옵션에 따라 처리
    if (!allowDataUri) {
        dangerousProtocols.push('data:');
    }

    // 위험한 프로토콜 체크 (대소문자 무시)
    const lowerUrl = trimmedUrl.toLowerCase();
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            console.warn(`[Security] Blocked dangerous protocol: ${protocol} in URL: ${trimmedUrl.substring(0, 50)}...`);
            return '';
        }
    }

    // 허용 목록 기반 검증
    // 1. http:// 또는 https://로 시작하는 절대 URL
    if (/^https?:\/\//i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 2. 프로토콜 상대 URL (//example.com)
    if (/^\/\//.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 3. 경로 절대 URL (/path/to/resource)
    if (/^\/[^/]/.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 4. 상대 URL (./path 또는 ../path 또는 path)
    if (/^\.{0,2}\//.test(trimmedUrl) || !/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 5. data: URI (allowDataUri가 true일 때만)
    if (allowDataUri && /^data:image\/(png|jpg|jpeg|gif|svg\+xml|webp);base64,/i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 6. blob: URI (이미지 미리보기 등)
    if (/^blob:/i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // 허용되지 않은 형식
    console.warn(`[Security] Blocked URL with unrecognized format: ${trimmedUrl.substring(0, 50)}...`);
    return '';
};
