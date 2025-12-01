# 프론트엔드 리팩토링 및 모듈화 전략: View-Logic 분리

## 1. 개요
본 문서는 프론트엔드 컴포넌트의 비대화(Bloated Component) 문제를 해결하고, 유지보수성과 가독성을 높이기 위한 모듈화 전략을 기술합니다. 백엔드의 **"Service Interface(설계) > Service Implementation(구현)"** 패턴을 리액트의 **"View(UI) > Custom Hook(Logic)"** 패턴으로 치환하여 적용합니다.

## 2. 핵심 전략: View와 Logic의 분리 (Separation of Concerns)

### 2.1 개념
컴포넌트가 커지는 주된 원인은 **UI 렌더링 코드(JSX)**와 **비즈니스 로직(State, Effect, Handler)**이 한 파일에 섞여 있기 때문입니다. 이를 물리적으로 분리하여 역할을 명확히 합니다.

| 구분 | 역할 | 백엔드 비유 | 파일 예시 |
| :--- | :--- | :--- | :--- |
| **View (UI)** | 화면을 어떻게 그릴지 결정. 데이터와 핸들러를 받아 렌더링만 수행. | Controller / Interface | `MyPage.tsx` |
| **Logic (Hook)** | 데이터를 어떻게 가져오고 처리할지 결정. 상태 관리, API 호출 수행. | Service Implementation | `useMyPage.ts` |
| **Components** | 재사용 가능한 UI 조각 또는 특정 영역의 뷰. | DTO / Sub-View | `Sidebar.tsx`, `OverviewTab.tsx` |

### 2.2 기대 효과
1.  **가독성 향상**: UI 코드와 로직 코드가 섞이지 않아 코드를 읽기 쉬워짐.
2.  **재사용성**: 로직(Hook)을 다른 컴포넌트에서도 재사용 가능.
3.  **유지보수 용이**: 디자인 변경 시 View만, 기능 변경 시 Logic만 수정하면 됨.
4.  **테스트 용이**: 로직(Hook) 단위의 테스트가 가능해짐.

## 3. 폴더 구조 표준안 (Feature-based Folder Structure)

기능(Feature) 단위로 폴더를 묶고, 그 안에서 역할별로 파일을 분리합니다.

```
src/pages/[FeatureName]/
├── [FeatureName].tsx          # [View] 메인 컨테이너 컴포넌트
├── use[FeatureName].ts        # [Logic] 메인 비즈니스 로직 (Custom Hook)
└── components/                # [Sub-Components] 해당 기능 전용 하위 컴포넌트
    ├── SubComponentA.tsx
    ├── SubComponentB.tsx
    └── ...
```

## 4. 적용 예시 (MyPage)

### Before (Monolithic)
*   `MyPage.tsx` (800 lines+): 모든 상태, API 호출, 탭별 UI, 모달이 한 파일에 존재.

### After (Modularized)
*   **Logic**: `useMyPage.ts` (상태, 쿼리, 핸들러)
*   **Main View**: `MyPage.tsx` (레이아웃, Hook 호출)
*   **Sub Views**:
    *   `components/Sidebar.tsx`
    *   `components/OverviewTab.tsx`
    *   `components/PostsTab.tsx`
    *   ...

## 5. 향후 계획
이 전략을 `MyPage`에 우선 적용(Pilot)하고, 검증 후 다른 복잡한 페이지(`SignUp`, `Login` 등)로 확대 적용합니다.
