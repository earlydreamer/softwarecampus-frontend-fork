/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param dateString - ISO 날짜 문자열 또는 YYYY-MM-DD 형식
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    // 이미 YYYY-MM-DD 형식인 경우 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * 두 날짜 사이의 개월 수 계산
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 */
export const calculateMonths = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return 0;
    }

    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();

    let months = yearDiff * 12 + monthDiff;

    // 종료일의 일(day)이 시작일의 일보다 작으면, 마지막 달을 완전히 채우지 못한 것으로 간주합니다.
    if (end.getDate() < start.getDate()) {
        months--;
    }

    return Math.max(1, months); // 최소 1개월
};

/**
 * 강의 기간을 "YYYY-MM-DD ~ YYYY-MM-DD" 형식으로 포맷
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 */
export const formatCourseDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '기간 미정';

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    return `${formattedStart} ~ ${formattedEnd}`;
};

/**
 * 강의 기간과 개월 수를 함께 반환
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 */
export const getCourseDurationInfo = (startDate: string, endDate: string): { duration: string; months: number } => {
    if (!startDate || !endDate) {
        return {
            duration: '기간 미정',
            months: 0,
        };
    }

    return {
        duration: formatCourseDuration(startDate, endDate),
        months: calculateMonths(startDate, endDate),
    };
};
