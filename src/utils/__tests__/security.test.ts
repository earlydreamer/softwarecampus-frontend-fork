import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../security';

describe('sanitizeUrl - 보안 검증', () => {
    describe('위험한 프로토콜 차단', () => {
        it('javascript: 프로토콜을 차단해야 함', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBe('');
            expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
            expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
        });

        it('data: URI를 기본적으로 차단해야 함', () => {
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
            expect(sanitizeUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBe('');
        });

        it('vbscript: 프로토콜을 차단해야 함', () => {
            expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
            expect(sanitizeUrl('VBScript:msgbox(1)')).toBe('');
        });

        it('file: 프로토콜을 차단해야 함', () => {
            expect(sanitizeUrl('file:///etc/passwd')).toBe('');
            expect(sanitizeUrl('FILE:///C:/Windows/System32')).toBe('');
        });

        it('about: 프로토콜을 차단해야 함', () => {
            expect(sanitizeUrl('about:blank')).toBe('');
        });
    });

    describe('안전한 URL 허용', () => {
        it('http:// URL을 허용해야 함', () => {
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
            expect(sanitizeUrl('http://example.com/path?query=1')).toBe('http://example.com/path?query=1');
        });

        it('https:// URL을 허용해야 함', () => {
            expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
            expect(sanitizeUrl('https://example.com/path#hash')).toBe('https://example.com/path#hash');
        });

        it('프로토콜 상대 URL을 허용해야 함', () => {
            expect(sanitizeUrl('//example.com/image.png')).toBe('//example.com/image.png');
        });

        it('절대 경로를 허용해야 함', () => {
            expect(sanitizeUrl('/images/logo.png')).toBe('/images/logo.png');
            expect(sanitizeUrl('/api/users')).toBe('/api/users');
        });

        it('상대 경로를 허용해야 함', () => {
            expect(sanitizeUrl('./images/logo.png')).toBe('./images/logo.png');
            expect(sanitizeUrl('../assets/icon.svg')).toBe('../assets/icon.svg');
            expect(sanitizeUrl('images/photo.jpg')).toBe('images/photo.jpg');
        });
    });

    describe('data: URI 옵션 처리', () => {
        it('allowDataUri=true일 때 안전한 이미지 data URI를 허용해야 함', () => {
            const validDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            expect(sanitizeUrl(validDataUri, true)).toBe(validDataUri);
        });

        it('allowDataUri=true여도 이미지가 아닌 data URI는 차단해야 함', () => {
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>', true)).toBe('');
        });

        it('allowDataUri=false일 때 모든 data URI를 차단해야 함', () => {
            const imageDataUri = 'data:image/png;base64,iVBORw0KGgo=';
            expect(sanitizeUrl(imageDataUri, false)).toBe('');
            expect(sanitizeUrl(imageDataUri)).toBe(''); // 기본값 false
        });
    });

    describe('엣지 케이스', () => {
        it('빈 문자열을 처리해야 함', () => {
            expect(sanitizeUrl('')).toBe('');
            expect(sanitizeUrl('   ')).toBe('');
        });

        it('공백이 포함된 URL을 trim해야 함', () => {
            expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
        });

        it('대소문자를 구분하지 않고 프로토콜을 체크해야 함', () => {
            expect(sanitizeUrl('HtTpS://example.com')).toBe('HtTpS://example.com');
            expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
        });

        it('알 수 없는 프로토콜을 차단해야 함', () => {
            expect(sanitizeUrl('custom://something')).toBe('');
            expect(sanitizeUrl('ftp://example.com')).toBe('');
        });
    });

    describe('실제 사용 사례', () => {
        it('이미지 URL을 안전하게 처리해야 함', () => {
            expect(sanitizeUrl('https://cdn.example.com/images/photo.jpg')).toBe('https://cdn.example.com/images/photo.jpg');
            expect(sanitizeUrl('/uploads/avatar.png')).toBe('/uploads/avatar.png');
        });

        it('CSS background-image에서 위험한 URL을 차단해야 함', () => {
            expect(sanitizeUrl('javascript:void(document.body.style.background="red")')).toBe('');
            expect(sanitizeUrl('data:text/css,body{background:red}')).toBe('');
        });

        it('링크 href에서 위험한 URL을 차단해야 함', () => {
            expect(sanitizeUrl('javascript:void(0)')).toBe('');
            expect(sanitizeUrl('vbscript:void(0)')).toBe('');
        });
    });
});
