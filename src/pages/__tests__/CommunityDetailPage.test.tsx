import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { shouldRetryBoardDetailQuery } from '../CommunityDetailPage';

const createAxiosError = (status?: number) =>
    new AxiosError(
        'request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        status
            ? {
                status,
                statusText: 'error',
                headers: {},
                config: {} as any,
                data: {},
            }
            : undefined
    );

describe('shouldRetryBoardDetailQuery', () => {
    it('비밀글이나 인증 오류는 재시도하지 않아야 함', () => {
        expect(shouldRetryBoardDetailQuery(0, createAxiosError(403))).toBe(false);
        expect(shouldRetryBoardDetailQuery(0, createAxiosError(401))).toBe(false);
    });

    it('존재하지 않는 게시글은 재시도하지 않아야 함', () => {
        expect(shouldRetryBoardDetailQuery(0, createAxiosError(404))).toBe(false);
    });

    it('네트워크성 오류는 한 번까지만 재시도해야 함', () => {
        expect(shouldRetryBoardDetailQuery(0, createAxiosError(500))).toBe(true);
        expect(shouldRetryBoardDetailQuery(1, createAxiosError(500))).toBe(false);
        expect(shouldRetryBoardDetailQuery(1, new Error('network error'))).toBe(false);
    });
});
