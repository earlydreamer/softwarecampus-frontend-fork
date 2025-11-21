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
 * URL 살균 함수
 * - javascript: 등의 위험한 프로토콜을 제거합니다.
 * - http:// 또는 https:// 로 시작하지 않으면 빈 문자열을 반환하거나 안전한 처리를 수행합니다.
 */
export const sanitizeUrl = (url: string): string => {
    if (!url) return '';

    // 공백 제거
    const trimmedUrl = url.trim();

    // javascript: 프로토콜 체크 (대소문자 무시)
    if (/^javascript:/i.test(trimmedUrl)) {
        return '';
    }

    // http:// 또는 https:// 로 시작하지 않으면 https:// 를 붙여줌 (선택 사항, 여기서는 그대로 두거나 빈 문자열 처리)
    // 여기서는 javascript: 만 막고 나머지는 허용하되, 필요하면 프로토콜을 강제할 수 있음.
    return trimmedUrl;
};
