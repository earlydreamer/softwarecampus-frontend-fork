import apiClient from './api/client';

export interface FavoriteCheckResult {
    favorited: boolean;
    error?: string;
}

/**
 * 강의 찜하기 추가
 * 인증 토큰을 통해 사용자 식별
 */
export const addCourseFavorite = async (
    courseId: number
): Promise<void> => {
    try {
        await apiClient.post(
            `/api/courses/${courseId}/favorites`
        );
    } catch (error) {
        console.error(`Failed to add favorite for course ${courseId}:`, error);
        throw error;
    }
};

/**
 * 강의 찜하기 삭제
 * 인증 토큰을 통해 사용자 식별
 */
export const removeCourseFavorite = async (
    courseId: number
): Promise<void> => {
    try {
        await apiClient.delete(
            `/api/courses/${courseId}/favorites`
        );
    } catch (error) {
        console.error(`Failed to remove favorite for course ${courseId}:`, error);
        throw error;
    }
};

/**
 * 강의 찜 여부 확인
 * 인증 토큰을 통해 사용자 식별
 * 
 * @returns favorited: true - 찜한 상태
 *          favorited: false - 찜하지 않음
 *          favorited: false + error - 서버/네트워크 오류
 */
export const checkCourseFavorite = async (
    courseId: number
): Promise<FavoriteCheckResult> => {
    try {
        const response = await apiClient.get<any>(
            `/api/courses/${courseId}/favorites`
        );
        // 백엔드 DTO 필드명은 isFavorite (또는 favorite)일 수 있음
        const isFav = response.data.isFavorite ?? response.data.favorite ?? response.data.favorited ?? false;
        return { favorited: isFav };
    } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // 인증 오류 - 로그인 필요
            return { favorited: false, error: '로그인이 필요합니다.' };
        }

        // 서버/네트워크 오류는 로그 후 에러 정보 반환
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Unknown error occurred';
        console.error(`Failed to check favorite status for course ${courseId}:`, {
            status: error.response?.status,
            message: errorMessage,
            error
        });

        return {
            favorited: false,
            error: errorMessage
        };
    }
};
