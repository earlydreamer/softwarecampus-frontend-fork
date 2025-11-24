/**
 * 이메일 검증 정규식
 * - 일반적인 이메일 형식 체크
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 비밀번호 검증 정규식
 * - 8~20자
 * - 영문, 숫자, 특수문자 포함
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

/**
 * 휴대폰 번호 검증 정규식
 * - 010-1234-5678 형식
 */
export const PHONE_REGEX = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;

/**
 * 이메일 유효성 검사
 */
export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

/**
 * 비밀번호 유효성 검사
 */
export const isValidPassword = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
};

/**
 * 전화번호 유효성 검사
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    return PHONE_REGEX.test(phoneNumber);
};

/**
 * 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
 */
export const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');

    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
};
