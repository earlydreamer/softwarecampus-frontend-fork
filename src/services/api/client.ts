import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';


/**
 * API 클라이언트 설정
 * - 기본 URL: 환경 변수 또는 로컬 개발 서버
 * - 타임아웃: 10초
 * - JSON 응답 자동 파싱
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


/**
 * 요청 인터셉터
 * - 필요 시 인증 토큰 추가
 */
apiClient.interceptors.request.use(
    (config) => {
        // TODO: 추후 JWT 토큰 추가
        // const token = localStorage.getItem('accessToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 응답 인터셉터
 * - 에러 처리
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // 에러 로깅
        if (error.response) {
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
