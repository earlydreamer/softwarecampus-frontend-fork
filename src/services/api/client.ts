import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API 클라이언트 설정
 * - 기본 URL: 환경 변수 또는 로컬 개발 서버
 * - 타임아웃: 10초
 * - JSON 응답 자동 파싱
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '', // Proxy 사용 시 빈 문자열 또는 상대 경로
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * 요청 인터셉터
 * - 인증 토큰 추가
 */
apiClient.interceptors.request.use(
    (config) => {
        // auth-storage에서 토큰 가져오기
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const token = parsed?.state?.accessToken;
                if (token && token !== 'admin-test-token') {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('토큰 파싱 오류:', e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 응답 인터셉터
 * - 에러 처리
 * - 401/403 에러 시 자동 토큰 갱신
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 에러 로깅
        if (error.response) {
            // 401/403 에러 && 재시도하지 않은 요청 && /auth/refresh 요청이 아닌 경우
            if (
                (error.response.status === 401 || error.response.status === 403) &&
                !originalRequest._retry &&
                !originalRequest.url?.includes('/auth/refresh') &&
                !originalRequest.url?.includes('/auth/login')
            ) {
                if (isRefreshing) {
                    // 토큰 갱신 중이면 대기
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                // auth-storage에서 리프레시 토큰 가져오기
                const authStorage = localStorage.getItem('auth-storage');
                if (!authStorage) {
                    processQueue(new Error('No auth storage'), null);
                    isRefreshing = false;
                    return Promise.reject(error);
                }

                try {
                    const parsed = JSON.parse(authStorage);
                    const refreshToken = parsed?.state?.refreshToken;
                    const email = parsed?.state?.user?.email;

                    if (!refreshToken || !email) {
                        throw new Error('No refresh token or email');
                    }

                    // 리프레시 토큰으로 새 액세스 토큰 요청
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh`,
                        { refreshToken, email }
                    );

                    const { accessToken: newAccessToken } = response.data;

                    // localStorage 업데이트
                    parsed.state.accessToken = newAccessToken;
                    localStorage.setItem('auth-storage', JSON.stringify(parsed));

                    // 대기 중인 요청들 처리
                    processQueue(null, newAccessToken);
                    isRefreshing = false;

                    // 원래 요청 재시도
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as Error, null);
                    isRefreshing = false;

                    // 토큰 갱신 실패 시 로그아웃 처리
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';

                    return Promise.reject(refreshError);
                }
            }

            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.message);
        } else {
            console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
