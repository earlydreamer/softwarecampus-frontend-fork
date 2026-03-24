import { describe, expect, it } from 'vitest';

import { normalizeApiBaseUrl } from './client';

describe('normalizeApiBaseUrl', () => {
    it('localhost 주소에 http 프로토콜을 보정한다', () => {
        expect(normalizeApiBaseUrl('localhost:8081')).toBe('http://localhost:8081');
    });

    it('상대 경로는 그대로 유지한다', () => {
        expect(normalizeApiBaseUrl('/api')).toBe('/api');
    });

    it('프로토콜이 이미 있으면 그대로 사용한다', () => {
        expect(normalizeApiBaseUrl('https://softwarecampus.example.test/')).toBe(
            'https://softwarecampus.example.test'
        );
    });

    it('일반 도메인에는 https 프로토콜을 보정한다', () => {
        expect(normalizeApiBaseUrl('api.example.test')).toBe('https://api.example.test');
    });
});
