import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl?: string): string => {
    const trimmedBaseUrl = rawBaseUrl?.trim();

    if (!trimmedBaseUrl) {
        return '';
    }

    if (trimmedBaseUrl.startsWith('/')) {
        return trimmedBaseUrl.replace(/\/+$/, '');
    }

    if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedBaseUrl)) {
        return trimmedBaseUrl.replace(/\/+$/, '');
    }

    const isLocalAddress =
        /^localhost(?::\d+)?(?:\/.*)?$/i.test(trimmedBaseUrl) ||
        /^127(?:\.\d{1,3}){3}(?::\d+)?(?:\/.*)?$/.test(trimmedBaseUrl) ||
        /^0\.0\.0\.0(?::\d+)?(?:\/.*)?$/.test(trimmedBaseUrl) ||
        /^192\.168(?:\.\d{1,3}){2}(?::\d+)?(?:\/.*)?$/.test(trimmedBaseUrl) ||
        /^10(?:\.\d{1,3}){3}(?::\d+)?(?:\/.*)?$/.test(trimmedBaseUrl) ||
        /^172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}(?::\d+)?(?:\/.*)?$/.test(trimmedBaseUrl);

    const inferredProtocol = isLocalAddress ? 'http://' : 'https://';
    return `${inferredProtocol}${trimmedBaseUrl}`.replace(/\/+$/, '');
};

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * API 클라이언트 설정
 * - 기본 URL: 환경 변수 또는 로컬 개발 서버
 * - 타임아웃: 10초
 * - JSON 응답 자동 파싱
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl, // Proxy 사용 시 빈 문자열 또는 상대 경로
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

// 토큰 갱신 함수
const refreshAccessToken = async (refreshToken: string, email: string): Promise<string> => {
    try {
        const response = await axios.post(
            `${apiBaseUrl}/api/auth/refresh`,
            { refreshToken, email }
        );
        return response.data.accessToken;
    } catch (error) {
        throw error;
    }
};

/**
 * 요청 인터셉터
 * - 인증 토큰 추가
 * - 토큰 만료 임박 시 선제적 갱신 (Proactive Refresh)
 */
apiClient.interceptors.request.use(
    async (config) => {
        // auth-storage에서 토큰 정보 가져오기
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const state = parsed?.state;
                let token = state?.accessToken;
                const refreshToken = state?.refreshToken;
                const email = state?.user?.email;
                const expiresAt = state?.expiresAt;

                // 관리자 테스트 토큰은 패스
                if (token === 'admin-test-token') {
                    config.headers.Authorization = `Bearer ${token}`;
                    return config;
                }

                // 토큰 갱신이 필요한지 확인 (만료 2분 전)
                const now = Date.now();
                const isExpiringSoon = expiresAt && (expiresAt - now < 120 * 1000);

                // 갱신 요청이 아니고, 리프레시 토큰이 있고, 만료가 임박했으면 갱신 시도
                if (
                    isExpiringSoon &&
                    refreshToken &&
                    email &&
                    !config.url?.includes('/auth/refresh') &&
                    !config.url?.includes('/auth/login') &&
                    !isRefreshing
                ) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            const newAccessToken = await refreshAccessToken(refreshToken, email);

                            // localStorage 업데이트 (expiresAt은 백엔드 응답에 따라 업데이트 필요하지만, 여기서는 임시로 갱신)
                            // 실제로는 refreshAccessToken 응답에서 expiresIn을 받아와야 함
                            // 하지만 여기서는 간단히 토큰만 교체하고, 다음 로그인/갱신 때 정확한 시간을 받도록 함
                            parsed.state.accessToken = newAccessToken;
                            // 임시로 3분 연장 (백엔드 기본값) - 정확한 값은 응답 인터셉터나 별도 로직에서 처리 권장
                            parsed.state.expiresAt = Date.now() + (180 * 1000);
                            localStorage.setItem('auth-storage', JSON.stringify(parsed));

                            token = newAccessToken;
                            isRefreshing = false;
                            processQueue(null, newAccessToken);
                        } catch (error) {
                            isRefreshing = false;
                            processQueue(error as Error, null);
                            // 갱신 실패 시 로그아웃 처리 등은 응답 인터셉터에서 처리하도록 둠
                        }
                    } else {
                        // 이미 갱신 중이면 대기
                        await new Promise((resolve) => {
                            failedQueue.push({ resolve, reject: () => { } });
                        });
                        // 갱신된 토큰 다시 읽기
                        const updatedStorage = localStorage.getItem('auth-storage');
                        if (updatedStorage) {
                            const updatedParsed = JSON.parse(updatedStorage);
                            token = updatedParsed?.state?.accessToken;
                        }
                    }
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('토큰 처리 오류:', e);
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
                        `${apiBaseUrl}/api/auth/refresh`,
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
export { normalizeApiBaseUrl };
