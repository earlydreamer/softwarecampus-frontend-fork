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

export type CourseStatus = 'RECRUITING' | 'IN_PROGRESS' | 'ENDED' | 'UPCOMING';

/**
 * 현재 날짜 기준으로 과정 상태 반환
 */
export const getCourseStatus = (
    recruitStart: string,
    recruitEnd: string,
    courseStart: string,
    courseEnd: string
): CourseStatus => {
    // Appending 'T00:00:00' ensures dates are parsed in the local timezone,
    // preventing bugs related to UTC conversion of 'YYYY-MM-DD' strings.
    const parseDate = (dateStr: string) => (dateStr ? new Date(`${dateStr}T00:00:00`) : null);

    const rStart = parseDate(recruitStart);
    const rEnd = parseDate(recruitEnd);
    const cStart = parseDate(courseStart);
    const cEnd = parseDate(courseEnd);

    // 날짜 정보가 부족하거나 유효하지 않은 경우 기본값 'UPCOMING' 반환
    if (!rStart || !rEnd || !cStart || !cEnd || [rStart, rEnd, cStart, cEnd].some(d => isNaN(d.getTime()))) {
        return 'UPCOMING';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 시간 제거

    if (today >= rStart && today <= rEnd) {
        return 'RECRUITING';
    } else if (today >= cStart && (!cEnd || today <= cEnd)) {
        // A course is in progress if it has started and has not ended (or has no end date).
        return 'IN_PROGRESS';
    } else if (today > cEnd) {
        return 'ENDED';
    } else {
        return 'UPCOMING'; // 모집 전이거나 모집 종료 후 교육 시작 전
    }
};
