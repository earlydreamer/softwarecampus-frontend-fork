import type { CategoryType, CourseCategoryType } from '../types';

/**
 * 프론트엔드 대상 표시값 → 백엔드 CategoryType 매핑
 * 허용된 입력값만 처리, 그 외는 기본값 반환
 */
const TARGET_TO_CATEGORY_TYPE: Record<string, CategoryType> = {
    '재직자': 'EMPLOYEE',
    '구직자': 'JOB_SEEKER',
    '취업예정자': 'JOB_SEEKER',
};

/**
 * 백엔드 CategoryType → 프론트엔드 대상 표시값 매핑
 */
const CATEGORY_TYPE_TO_TARGET: Record<CategoryType, CourseCategoryType> = {
    'EMPLOYEE': '재직자',
    'JOB_SEEKER': '취업예정자',
};

/**
 * 유효한 CategoryType 값 목록
 */
const VALID_CATEGORY_TYPES: readonly CategoryType[] = ['EMPLOYEE', 'JOB_SEEKER'] as const;

/**
 * 프론트엔드 대상 표시값을 백엔드 CategoryType으로 변환
 * 
 * @param target 프론트엔드 대상 표시값 ('재직자', '취업예정자', '구직자')
 * @param defaultValue 유효하지 않은 입력 시 반환할 기본값 (기본: 'JOB_SEEKER')
 * @returns 백엔드 CategoryType ('EMPLOYEE' | 'JOB_SEEKER')
 * 
 * @example
 * targetToCategoryType('재직자') // 'EMPLOYEE'
 * targetToCategoryType('취업예정자') // 'JOB_SEEKER'
 * targetToCategoryType('구직자') // 'JOB_SEEKER'
 * targetToCategoryType(undefined) // 'JOB_SEEKER' (기본값)
 * targetToCategoryType('잘못된값') // 'JOB_SEEKER' (기본값)
 */
export const targetToCategoryType = (
    target: string | undefined | null,
    defaultValue: CategoryType = 'JOB_SEEKER'
): CategoryType => {
    if (!target) {
        if (import.meta.env.DEV) {
            console.warn('[targetToCategoryType] target이 비어있음, 기본값 사용:', defaultValue);
        }
        return defaultValue;
    }
    
    const categoryType = TARGET_TO_CATEGORY_TYPE[target];
    
    if (!categoryType) {
        if (import.meta.env.DEV) {
            console.warn('[targetToCategoryType] 알 수 없는 target 값:', target, ', 기본값 사용:', defaultValue);
        }
        return defaultValue;
    }
    
    return categoryType;
};

/**
 * 프론트엔드 대상 표시값을 백엔드 CategoryType으로 변환 (엄격 모드)
 * 유효하지 않은 입력 시 에러 발생
 * 
 * @param target 프론트엔드 대상 표시값
 * @throws 유효하지 않은 target 값인 경우
 * @returns 백엔드 CategoryType
 */
export const targetToCategoryTypeStrict = (target: string | undefined | null): CategoryType => {
    if (!target) {
        throw new Error('[targetToCategoryType] target 값이 필요합니다.');
    }
    
    const categoryType = TARGET_TO_CATEGORY_TYPE[target];
    
    if (!categoryType) {
        throw new Error(`[targetToCategoryType] 유효하지 않은 target 값: "${target}". 허용 값: ${Object.keys(TARGET_TO_CATEGORY_TYPE).join(', ')}`);
    }
    
    return categoryType;
};

/**
 * 백엔드 CategoryType을 프론트엔드 대상 표시값으로 변환
 * 
 * @param categoryType 백엔드 CategoryType ('EMPLOYEE' | 'JOB_SEEKER')
 * @returns 프론트엔드 대상 표시값 ('재직자' | '취업예정자')
 * 
 * @example
 * categoryTypeToTarget('EMPLOYEE') // '재직자'
 * categoryTypeToTarget('JOB_SEEKER') // '취업예정자'
 */
export const categoryTypeToTarget = (
    categoryType: CategoryType | string | undefined | null
): CourseCategoryType => {
    if (!categoryType) {
        return '취업예정자';
    }
    
    // 유효한 CategoryType인지 확인
    if (isValidCategoryType(categoryType)) {
        return CATEGORY_TYPE_TO_TARGET[categoryType];
    }
    
    if (import.meta.env.DEV) {
        console.warn('[categoryTypeToTarget] 알 수 없는 categoryType 값:', categoryType);
    }
    return '취업예정자';
};

/**
 * 값이 유효한 CategoryType인지 확인
 */
export const isValidCategoryType = (value: unknown): value is CategoryType => {
    return typeof value === 'string' && VALID_CATEGORY_TYPES.includes(value as CategoryType);
};
