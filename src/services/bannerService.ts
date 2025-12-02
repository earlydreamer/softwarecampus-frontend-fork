import apiClient from './api/client';
import type { Banner } from '../types';
import { AxiosError } from 'axios';

/**
 * 백엔드 배너 응답 타입
 */
interface ApiBannerResponse {
    id: number;
    title: string;
    description?: string; // 배너 부제목/설명
    imageUrl: string;
    linkUrl: string;
    sequence: number;
    isActivated: boolean;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

/**
 * 배너 조회 결과 타입 (Result 패턴)
 */
export type BannerResult = 
    | { ok: true; value: Banner[] }
    | { ok: false; error: BannerError };

/**
 * 배너 조회 에러 타입
 */
export interface BannerError {
    type: 'AUTH' | 'NETWORK' | 'SERVER' | 'UNKNOWN';
    message: string;
    status?: number;
}

/**
 * 배너 객체 유효성 검사
 * 필수 필드가 존재하고 올바른 타입인지 확인
 */
const isValidBanner = (banner: unknown): banner is ApiBannerResponse => {
    if (typeof banner !== 'object' || banner === null) {
        return false;
    }
    
    const b = banner as Record<string, unknown>;
    
    return (
        typeof b.id === 'number' &&
        typeof b.title === 'string' &&
        typeof b.imageUrl === 'string' &&
        typeof b.linkUrl === 'string' &&
        typeof b.sequence === 'number'
    );
};

/**
 * 네트워크 오류인지 확인 (타임아웃, 연결 실패 등)
 */
const isNetworkError = (error: AxiosError): boolean => {
    // 응답이 없으면 네트워크 오류
    if (!error.response) {
        return true;
    }
    
    // 특정 에러 코드 확인
    const networkErrorCodes = ['ECONNABORTED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ERR_NETWORK'];
    if (error.code && networkErrorCodes.includes(error.code)) {
        return true;
    }
    
    return false;
};

/**
 * 인증/권한 오류인지 확인
 */
const isAuthError = (error: AxiosError): boolean => {
    const status = error.response?.status;
    return status === 401 || status === 403;
};

/**
 * 활성화된 배너 목록 조회 (Result 패턴)
 * - 인증 오류: ok: false, error.type: 'AUTH' 반환 (호출자가 로그인 처리)
 * - 네트워크 오류: ok: false, error.type: 'NETWORK' 반환 (일시적, 재시도 가능)
 * - 서버/알 수 없는 오류: 로깅 후 ok: false 반환
 */
export const fetchActiveBanners = async (): Promise<BannerResult> => {
    try {
        const response = await apiClient.get<ApiBannerResponse[]>('/banners');
        
        // 응답이 배열인지 확인 (API 오류 시 HTML 등이 반환될 수 있음)
        if (!Array.isArray(response.data)) {
            console.warn('배너 API 응답이 배열이 아닙니다:', typeof response.data);
            return { ok: true, value: [] };
        }
        
        // 유효한 배너만 필터링
        const validBanners = response.data.filter((banner): banner is ApiBannerResponse => {
            const isValid = isValidBanner(banner);
            if (!isValid) {
                console.warn('유효하지 않은 배너 데이터 건너뜀:', banner);
            }
            return isValid;
        });
        
        // 시퀀스 순으로 정렬
        const sortedBanners = validBanners.sort((a, b) => a.sequence - b.sequence);
        
        // 프론트엔드 Banner 타입으로 변환
        const banners = sortedBanners.map(apiBanner => ({
            id: apiBanner.id,
            title: apiBanner.title,
            subtitle: apiBanner.description ?? '', // nullish coalescing: 빈 문자열 유지
            imageUrl: apiBanner.imageUrl,
            link: apiBanner.linkUrl,
        }));
        
        return { ok: true, value: banners };
    } catch (error) {
        // Axios 에러인지 확인
        if (error instanceof AxiosError) {
            // 인증/권한 오류 (401, 403) - 호출자가 로그인 흐름 처리
            if (isAuthError(error)) {
                return {
                    ok: false,
                    error: {
                        type: 'AUTH',
                        message: error.response?.status === 401 
                            ? '로그인이 필요합니다.' 
                            : '접근 권한이 없습니다.',
                        status: error.response?.status,
                    },
                };
            }
            
            // 네트워크 오류 (타임아웃, 연결 실패 등) - 일시적, 재시도 가능
            if (isNetworkError(error)) {
                console.warn('배너 조회 네트워크 오류 (재시도 가능):', error.code || error.message);
                return {
                    ok: false,
                    error: {
                        type: 'NETWORK',
                        message: '네트워크 연결을 확인해 주세요.',
                    },
                };
            }
            
            // 서버 오류 (5xx)
            const status = error.response?.status;
            if (status && status >= 500) {
                console.error('배너 조회 서버 오류:', {
                    status,
                    message: error.message,
                    url: error.config?.url,
                });
                return {
                    ok: false,
                    error: {
                        type: 'SERVER',
                        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                        status,
                    },
                };
            }
        }
        
        // 알 수 없는 오류
        console.error('배너 조회 알 수 없는 오류:', error);
        return {
            ok: false,
            error: {
                type: 'UNKNOWN',
                message: '알 수 없는 오류가 발생했습니다.',
            },
        };
    }
};

/**
 * 활성화된 배너 목록 조회 (레거시 호환용)
 * 실패 시 빈 배열 반환하여 HeroBanner의 기본 배너 표시
 * @deprecated fetchActiveBanners를 사용하고 Result 패턴으로 에러 처리 권장
 */
export const fetchActiveBannersLegacy = async (): Promise<Banner[]> => {
    const result = await fetchActiveBanners();
    return result.ok ? result.value : [];
};
