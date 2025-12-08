---
title: Design System Documentation
version: 1.0.0
last_updated: 2025-11-24 (KST)
maintainer: Frontend Team
description: SoftCampus 프론트엔드 디자인 시스템 문서
---

# 디자인 시스템

## 개요
SoftCampus 웹사이트는 현대적이고 일관된 사용자 경험을 제공하기 위해 Tailwind CSS 기반의 디자인 시스템을 사용합니다.

---

## 색상 팔레트 (Color Palette)

### Primary Colors
```css
/* tailwind.config.js에 정의 */
primary: {
  50: 'hsl(210, 100%, 98%)',
  100: 'hsl(210, 100%, 95%)',
  200: 'hsl(210, 100%, 90%)',
  300: 'hsl(210, 100%, 80%)',
  400: 'hsl(210, 100%, 70%)',
  500: 'hsl(210, 100%, 60%)',  // 주 색상
  600: 'hsl(210, 90%, 50%)',
  700: 'hsl(210, 80%, 40%)',
  800: 'hsl(210, 70%, 30%)',
  900: 'hsl(210, 60%, 20%)',
}
```

### Neutral Colors
- **Slate**: UI 요소, 텍스트, 배경
- **White/Black**: 명암 대비

### Semantic Colors
- **Green**: 성공, 승인, 활성 상태
- **Red**: 에러, 거부, 삭제
- **Yellow/Orange**: 경고, 대기 상태
- **Blue**: 정보, 링크

---

## 타이포그래피 (Typography)

### Font Family
- **Primary**: System Font Stack (최적 성능)
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Font Scales
- `text-xs`: 12px
- `text-sm`: 14px
- `text-base`: 16px (기본)
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px
- `text-4xl`: 36px

### Font Weights
- `font-normal`: 400 (본문)
- `font-medium`: 500 (강조)
- `font-semibold`: 600 (제목)
- `font-bold`: 700 (헤딩)
- `font-extrabold`: 800 (특별 강조)

---

## 간격 시스템 (Spacing)

Tailwind의 기본 간격 단위 사용:
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-12`: 3rem (48px)

**일관성 원칙**:
- 섹션 간격: `py-12`, `py-20`
- 카드 내부 패딩: `p-6`
- 버튼 패딩: `px-4 py-2`, `px-6 py-3`

---

## 컴포넌트 스타일

### Glass Panel (유리 효과)
```css
.glass-panel {
  @apply bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50;
}
```

**사용 예시**:
- 카드 컴포넌트
- 모달 배경
- 내비게이션 바

### 버튼 스타일

#### Primary Button
```css
.btn-primary {
  @apply px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold 
         hover:bg-primary-700 transition-colors shadow-lg 
         hover:shadow-primary-600/30;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply px-6 py-3 rounded-lg border border-slate-300 text-slate-700
         hover:bg-slate-50 transition-colors;
}
```

### 카드 스타일
```css
.card {
  @apply glass-panel rounded-2xl p-6 shadow-sm 
         hover:shadow-md transition-shadow;
}
```

---

## 반응형 시스템 (Responsive)

### Breakpoints
```javascript
sm: '640px',   //  Mobile landscape
md: '768px',   //  Tablet
lg: '1024px',  //  Desktop
xl: '1280px',  //  Large desktop
2xl: '1536px'  //  Extra large
```

### Container
```css
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 1280px;
}
```

---

## 애니메이션 (Animation)

### Transitions
- **기본**: `transition-colors`, `transition-all`
- **지속 시간**: `duration-300` (기본), `duration-500`
- **Easing**: `ease-in-out` (기본)

### Hover Effects
- **Scale**: `hover:scale-[1.02]`
- **Shadow**: `hover:shadow-lg`
- **Brightness**: `hover:brightness-110`

### Custom Animations
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}
```

---

## 아이콘 시스템

**라이브러리**: Lucide React (v0.554.0)

**사용 원칙**:
- 일관된 크기: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- 색상: 텍스트 색상과 동일하게 유지
- Stroke Width: 기본값 사용 (2)

**주요 아이콘**:
- `Search`: 검색
- `User`: 사용자
- `BookOpen`: 과정
- `Star`: 평가
- `MessageSquare`: 댓글

---

## Dark Mode

### 구현 방식
### 구현 방식
- 시스템 설정(OS/Browser Preference)을 따름 (`prefers-color-scheme`)
- Tailwind의 `dark:` variant 사용 (media strategy)

### 색상 매핑
```css
/* Light Mode */
bg-white text-slate-900

/* Dark Mode */
dark:bg-slate-900 dark:text-white
```

---

## 접근성 (Accessibility)

### Focus States
```css
focus:ring-2 focus:ring-primary-500 focus:outline-none
```

### ARIA Labels
- 모든 아이콘 버튼에 `aria-label` 필수
- 모달에 `aria-modal="true"`, `aria-labelledby`
- Navigation에 `aria-label`

### Contrast Ratio
- 텍스트: 최소 4.5:1
- 큰 텍스트: 최소 3:1
- 인터랙티브 요소: 최소 3:1

---

## 레이아웃 패턴

### 페이지 구조
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  <Header />
  <main className="container mx-auto px-4 py-12">
    {/* Content */}
  </main>
  <Footer />
</div>
```

### Grid System
```css
/* 카드 그리드 */
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

/* 사이드바 레이아웃 */
.grid grid-cols-1 lg:grid-cols-3 gap-8
```

---

## 스켈레톤 로딩

```tsx
<Skeleton className="h-64 w-full rounded-2xl" />
<Skeleton className="h-4 w-3/4 rounded" />
```

**사용 시기**:
- 데이터 페칭 중
- 이미지 로드 중
- 페이지 전환 시

---

## 예제: 완전한 컴포넌트

```tsx
<div className="glass-panel rounded-2xl p-6 hover:shadow-lg transition-all">
  <div className="flex items-center gap-3 mb-4">
    <BookOpen className="w-5 h-5 text-primary-600" />
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
      과정 제목
    </h3>
  </div>
  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
    과정 설명
  </p>
  <button className="btn-primary w-full">
    자세히 보기
  </button>
</div>
```

---

## 유지보수

### 변경 시 체크리스트
- [ ] 색상 변경 시 contrast ratio 확인
- [ ] 새 컴포넌트는 dark mode 지원
- [ ] 반응형 테스트 (mobile, tablet, desktop)
- [ ] 키보드 네비게이션 확인
- [ ] ARIA 속성 추가

### 참고 문서
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lucide Icons](https://lucide.dev/)

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-24 (KST)
