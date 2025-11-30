/**
 * 이메일 검증 정규식
 * - 일반적인 이메일 형식 체크
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 비밀번호 검증 정규식
 * - 8~20자
 * - 영문, 숫자, 특수문자 포함
 * - 허용 특수문자: ! @ # $ % ^ & * ( ) - _ = + [ ] { } | ; : ' " , . < > / ? ~
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~])[A-Za-z\d!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~]{8,20}$/;

/**
 * 비밀번호 최소/최대 길이 상수
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

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
 * 비밀번호 강도 체크 결과 타입
 */
export interface PasswordStrengthChecks {
    length: boolean;
    letter: boolean;
    number: boolean;
    special: boolean;
}

/**
 * 비밀번호 강도 체크
 * 각 조건별로 충족 여부를 반환
 */
export const getPasswordStrengthChecks = (password: string): PasswordStrengthChecks => {
    return {
        length: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
        letter: /[A-Za-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~]/.test(password),
    };
};

/**
 * 비밀번호 유효성 검사 결과 타입
 */
export interface PasswordValidationResult {
    isValid: boolean;
    error: string | null;
}

/**
 * 비밀번호 유효성 검사 (에러 메시지 포함)
 * @param password - 검사할 비밀번호
 * @param confirmPassword - 확인용 비밀번호 (선택)
 * @returns 유효성 검사 결과와 에러 메시지
 */
export const validatePassword = (
    password: string,
    confirmPassword?: string
): PasswordValidationResult => {
    // 비밀번호 확인 체크 (confirmPassword가 제공된 경우)
    if (confirmPassword !== undefined && password !== confirmPassword) {
        return { isValid: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    // 길이 체크
    if (password.length < PASSWORD_MIN_LENGTH) {
        return { isValid: false, error: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` };
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        return { isValid: false, error: `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.` };
    }

    // 정규식 체크
    if (!PASSWORD_REGEX.test(password)) {
        return { isValid: false, error: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.' };
    }

    return { isValid: true, error: null };
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
