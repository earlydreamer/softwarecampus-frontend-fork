---
title: Frontend Skill & Tool Usage Guide
version: 1.0.0
last_updated: 2026-03-20 (KST)
applies_to: Claude / Codex / Gemini
---

# 프론트엔드 스킬 및 도구 활용 가이드

> 에이전트별 공통 스킬(Claude 스킬 호출, Codex/Gemini 가이드)은 `../SKILL.md`를 참조합니다 (경로가 존재할 경우).

---

## 빌드·테스트·실행

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 테스트 실행
npm run test

# 테스트 (감시 모드)
npm run test -- --watch

# 테스트 UI
npm run test:ui

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint -- --fix
```

---

## 코드 품질

- TypeScript 컴파일 오류 없음 확인 (`npm run build`)
- ESLint 경고 없음 확인 (`npm run lint`)
- `any` 타입 사용 금지

---

## 보안 체크리스트

작업 완료 전 반드시 확인:

- [ ] `dangerouslySetInnerHTML`에 `DOMPurify.sanitize()` 적용되었는가?
- [ ] 동적 URL에 `sanitizeUrl()` 적용되었는가? (`src/utils/security.ts`)
- [ ] `alert()`, `confirm()`, `prompt()` 대신 커스텀 모달을 사용했는가?
- [ ] TypeScript `any` 타입이 사용되지 않았는가?
- [ ] API 응답 타입이 백엔드 DTO와 일치하는가? (`.md/BACKEND_FRONTEND_MAPPING.md`)

---

## 테스트 가이드

| 상황 | 권장 테스트 |
|------|------------|
| 중요 React 컴포넌트 | `@testing-library/react` 컴포넌트 테스트 |
| 커스텀 훅 추가 | `renderHook` 단위 테스트 |
| 유틸 함수 추가 | 순수 함수 단위 테스트 |
| 폼 인터랙션 | `@testing-library/user-event` 이벤트 테스트 |

**테스트 우선순위**: 보안·인증 로직 → 핵심 비즈니스 컴포넌트 → 커스텀 훅

---

## 작업 흐름 패턴

### 새 기능 추가 시
1. `.md/plan.md`에 계획 기록
2. 새 브랜치 생성 (`feat/feature-name`)
3. 구현 → `npm run lint` → `npm run test` → `npm run build` 통과 확인
4. 커밋 (Conventional Commits)
5. fetch → main merge → push

### 버그 수정 시
1. 재현 조건 파악 후 원인 분석
2. 새 브랜치 생성 (`fix/bug-description`)
3. 최소 변경으로 수정 → 회귀 테스트 확인

**문서 끝**
