import DOMPurify from 'dompurify';
import { sanitizeUrl } from './security';

/**
 * Tiptap 에디터 콘텐츠를 안전하게 살균하는 유틸리티
 * - 안전한 프로토콜만 허용 (http, https, mailto, tel)
 * - 외부 링크에 rel="noopener noreferrer" 자동 추가
 * - 위험한 URL을 가진 이미지 제거
 * - 안전한 CSS 속성만 허용 (텍스트 스타일링 관련)
 */

// Tiptap이 사용하는 안전한 CSS 속성 목록
// 위험한 속성 제외: position, z-index, background (url 가능), background-image,
//                  content, cursor, display, visibility, filter, transform, animation
const ALLOWED_CSS_PROPERTIES = [
    // 텍스트 정렬 및 색상
    'text-align', 'color', 'background-color',
    // 글꼴 스타일
    'font-weight', 'font-style', 'font-size', 'font-family',
    // 텍스트 장식
    'text-decoration', 'text-decoration-line', 'text-decoration-color', 'text-decoration-style',
    'text-indent', 'text-transform',
    // 간격
    'line-height', 'letter-spacing', 'word-spacing',
    // 정렬
    'vertical-align', 'white-space',
    // 여백 (개별 속성)
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    // 테두리 (색상/스타일만, width 제한적 허용)
    'border-color', 'border-style', 'border-width',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-radius',
    // 목록
    'list-style-type', 'list-style-position',
    // 기타 안전한 속성
    'opacity', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
];

// CSS 색상 이름 (주요 색상)
const NAMED_COLORS = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 
    'pink', 'gray', 'grey', 'brown', 'cyan', 'magenta', 'transparent', 
    'inherit', 'initial', 'unset', 'currentcolor'
];

/**
 * 안전한 CSS 색상 값 검증 (hex, rgb, rgba, hsl, 색상 이름)
 */
const isValidCssColor = (value: string): boolean => {
    const v = value.toLowerCase().trim();
    // hex 색상: #rgb, #rrggbb, #rrggbbaa
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
    // rgb/rgba
    if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/i.test(v)) return true;
    // hsl/hsla
    if (/^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+))?\s*\)$/i.test(v)) return true;
    // CSS 색상 이름
    if (NAMED_COLORS.includes(v)) return true;
    return false;
};

/**
 * 안전한 CSS 길이/크기 값 검증
 */
const isValidCssLength = (value: string): boolean => {
    const v = value.toLowerCase().trim();
    // 숫자 + 단위 (px, em, rem, %, pt, vh, vw 등)
    if (/^-?\d+(\.\d+)?(px|em|rem|%|pt|pc|cm|mm|in|vh|vw|vmin|vmax|ch|ex)?$/i.test(v)) return true;
    // auto, inherit, initial, unset
    if (['auto', 'inherit', 'initial', 'unset', 'none', '0'].includes(v)) return true;
    return false;
};

/**
 * CSS style 속성 필터링 함수
 */
const sanitizeStyle = (style: string): string => {
    if (!style) return '';
    
    const safeStyles: string[] = [];
    // CSS 선언을 파싱 (세미콜론으로 분리)
    const declarations = style.split(';').map(d => d.trim()).filter(Boolean);
    
    for (const declaration of declarations) {
        const colonIndex = declaration.indexOf(':');
        if (colonIndex === -1) continue;
        
        const property = declaration.substring(0, colonIndex).trim().toLowerCase();
        const value = declaration.substring(colonIndex + 1).trim();
        
        // 허용된 속성만 통과
        if (!ALLOWED_CSS_PROPERTIES.includes(property)) continue;
        
        // 속성별 값 검증
        let isValid = false;
        
        // text-align 값 검증
        if (property === 'text-align') {
            const safeValues = ['left', 'center', 'right', 'justify', 'start', 'end'];
            isValid = safeValues.includes(value.toLowerCase());
        }
        // 색상 관련 속성 검증
        else if (property === 'color' || property === 'background-color' || 
                 property.includes('border') && property.includes('color') ||
                 property === 'text-decoration-color') {
            isValid = isValidCssColor(value);
        }
        // 길이/크기 관련 속성 검증
        else if (['font-size', 'line-height', 'letter-spacing', 'word-spacing', 'text-indent',
                  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                  'border-width', 'border-radius',
                  'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'].includes(property)) {
            isValid = isValidCssLength(value);
        }
        // font-weight 검증
        else if (property === 'font-weight') {
            isValid = /^(normal|bold|bolder|lighter|\d{3})$/i.test(value);
        }
        // font-style 검증
        else if (property === 'font-style') {
            isValid = ['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // font-family 검증 (위험한 문자 제외)
        else if (property === 'font-family') {
            isValid = !/[<>"'`;(){}]/.test(value);
        }
        // text-decoration 검증
        else if (property === 'text-decoration' || property === 'text-decoration-line') {
            isValid = /^(none|underline|overline|line-through|inherit|initial|unset)(\s+(underline|overline|line-through))*$/i.test(value);
        }
        // text-decoration-style 검증
        else if (property === 'text-decoration-style') {
            isValid = ['solid', 'double', 'dotted', 'dashed', 'wavy', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // text-transform 검증
        else if (property === 'text-transform') {
            isValid = ['none', 'capitalize', 'uppercase', 'lowercase', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // vertical-align 검증
        else if (property === 'vertical-align') {
            isValid = ['baseline', 'sub', 'super', 'top', 'text-top', 'middle', 'bottom', 'text-bottom', 'inherit', 'initial', 'unset'].includes(value.toLowerCase()) || isValidCssLength(value);
        }
        // white-space 검증
        else if (property === 'white-space') {
            isValid = ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // border-style 검증
        else if (property === 'border-style') {
            isValid = /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|unset)(\s+(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset))*$/i.test(value);
        }
        // list-style-type 검증
        else if (property === 'list-style-type') {
            isValid = ['none', 'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha', 'lower-latin', 'upper-latin', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // list-style-position 검증
        else if (property === 'list-style-position') {
            isValid = ['inside', 'outside', 'inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        // opacity 검증
        else if (property === 'opacity') {
            isValid = /^(0|1|0?\.\d+)$/i.test(value) || ['inherit', 'initial', 'unset'].includes(value.toLowerCase());
        }
        
        if (isValid) {
            safeStyles.push(`${property}: ${value}`);
        }
    }
    
    return safeStyles.join('; ');
};

/**
 * Tiptap 에디터 콘텐츠를 안전하게 살균
 * @param html - 살균할 HTML 문자열
 * @returns 살균된 HTML 문자열
 */
export const sanitizeTiptapContent = (html: string): string => {
    // DOMPurify 훅 등록
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        // 링크 보안 처리
        if (node.tagName === 'A') {
            const href = node.getAttribute('href');
            if (href) {
                const safeHref = sanitizeUrl(href);
                if (!safeHref) {
                    node.setAttribute('href', '#');
                } else if (safeHref !== href) {
                    node.setAttribute('href', safeHref);
                }
            }
            // 외부 링크 보안 속성 추가
            node.setAttribute('rel', 'noopener noreferrer');
        }
        // 이미지 보안 처리
        if (node.tagName === 'IMG') {
            const src = node.getAttribute('src');
            if (src) {
                const safeSrc = sanitizeUrl(src);
                if (!safeSrc) {
                    node.parentNode?.removeChild(node);
                } else if (safeSrc !== src) {
                    node.setAttribute('src', safeSrc);
                }
            }
        }
        // CSS style 속성 필터링
        if (node instanceof Element && node.hasAttribute('style')) {
            const originalStyle = node.getAttribute('style') || '';
            const safeStyle = sanitizeStyle(originalStyle);
            if (safeStyle) {
                node.setAttribute('style', safeStyle);
            } else {
                node.removeAttribute('style');
            }
        }
    });
    
    const sanitized = DOMPurify.sanitize(html, {
        // Tiptap 에디터가 생성하는 태그 허용
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'span', 'div', 'mark'],
        // Tiptap 기능에 필요한 속성 (정렬, 링크, 이미지 등)
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel', 'data-type', 'data-checked'],
        // 안전한 URI 프로토콜만 허용
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
    
    // 훅 제거 (다른 sanitize 호출에 영향 방지)
    DOMPurify.removeHook('afterSanitizeAttributes');
    
    return sanitized;
};
