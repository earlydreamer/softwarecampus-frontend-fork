/**
 * 토큰 관리 유틸리티
 * 
 * 보안 고려사항:
 * - localStorage는 XSS 공격에 취약하므로 추후 httpOnly 쿠키 방식으로 마이그레이션 권장
 * - 현재는 CSP(Content Security Policy) 설정과 함께 사용해야 함
 * - SSR 환경 대비 런타임 가드 포함
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 브라우저 환경인지 확인 (SSR 대응)
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

/**
 * 안전하게 localStorage에서 값 읽기
 */
const safeGetItem = (key: string): string | null => {
  if (!isBrowser()) {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read from localStorage (key: ${key}):`, error);
    return null;
  }
};

/**
 * 안전하게 localStorage에 값 쓰기
 */
const safeSetItem = (key: string, value: string): void => {
  if (!isBrowser()) {
    return;
  }
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to write to localStorage (key: ${key}):`, error);
  }
};

/**
 * 안전하게 localStorage에서 값 삭제
 */
const safeRemoveItem = (key: string): void => {
  if (!isBrowser()) {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error);
  }
};

/**
 * Access Token 조회
 */
export const getAccessToken = (): string | null => {
  return safeGetItem(TOKEN_KEY);
};

/**
 * Access Token 저장
 */
export const setAccessToken = (token: string): void => {
  safeSetItem(TOKEN_KEY, token);
};

/**
 * Refresh Token 조회
 */
export const getRefreshToken = (): string | null => {
  return safeGetItem(REFRESH_TOKEN_KEY);
};

/**
 * Refresh Token 저장
 */
export const setRefreshToken = (token: string): void => {
  safeSetItem(REFRESH_TOKEN_KEY, token);
};

/**
 * 모든 토큰 삭제 (로그아웃)
 */
export const clearTokens = (): void => {
  safeRemoveItem(TOKEN_KEY);
  safeRemoveItem(REFRESH_TOKEN_KEY);
};

/**
 * 토큰 존재 여부 확인
 */
export const hasAccessToken = (): boolean => {
  const token = getAccessToken();
  return token !== null && token.trim() !== '';
};
