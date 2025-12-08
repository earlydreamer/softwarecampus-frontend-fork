# 과정 카테고리 상세 분류

## 백엔드 스키마
```sql
CourseCategory (course_category)
- id: BIGINT (PK)
- category_name: VARCHAR(50) -- 상세 카테고리명
- category_type: VARCHAR(20) -- EMPLOYEE or JOB_SEEKER
```

## 카테고리 목록 (제공받은 분류 기준)

### 취업예정자 (JOB_SEEKER) - 온라인
| ID | categoryName | categoryType | isOffline |
|----|--------------|--------------|-----------|
| 1  | 웹개발       | JOB_SEEKER   | false     |
| 2  | 모바일       | JOB_SEEKER   | false     |
| 3  | 데이터/AI    | JOB_SEEKER   | false     |
| 4  | 클라우드운영 | JOB_SEEKER   | false     |
| 5  | 보안         | JOB_SEEKER   | false     |
| 6  | IoT/임베디드 | JOB_SEEKER   | false     |
| 7  | 게임/블록체인| JOB_SEEKER   | false     |

### 취업예정자 (JOB_SEEKER) - 오프라인
| ID | categoryName | categoryType | isOffline |
|----|--------------|--------------|-----------|
| 8  | 웹개발       | JOB_SEEKER   | true      |
| 9  | 모바일       | JOB_SEEKER   | true      |
| 10 | 데이터/AI    | JOB_SEEKER   | true      |
| 11 | 클라우드운영 | JOB_SEEKER   | true      |
| 12 | 보안         | JOB_SEEKER   | true      |
| 13 | IoT/임베디드 | JOB_SEEKER   | true      |
| 14 | 게임/블록체인| JOB_SEEKER   | true      |

### 재직자 (EMPLOYEE) - 온라인
| ID | categoryName      | categoryType | isOffline |
|----|-------------------|--------------|-----------|
| 15 | 웹개발            | EMPLOYEE     | false     |
| 16 | 백엔드 개발       | EMPLOYEE     | false     |
| 17 | 프론트엔드        | EMPLOYEE     | false     |
| 18 | DB                | EMPLOYEE     | false     |
| 19 | AI                | EMPLOYEE     | false     |
| 20 | SW구조            | EMPLOYEE     | false     |
| 21 | 백엔드개발        | EMPLOYEE     | false     |
| 22 | 프론트엔드        | EMPLOYEE     | false     |
| 23 | 프론트엔드        | EMPLOYEE     | false     |
| 24 | 데이터엔지니어링  | EMPLOYEE     | false     |
| 25 | AI/머신러닝       | EMPLOYEE     | false     |
| 26 | SW아키텍처        | EMPLOYEE     | false     |
| 27 | 정보보안전문가    | EMPLOYEE     | false     |
| 28 | IT기획/컨설팅     | EMPLOYEE     | false     |
| 29 | 데이터분석        | EMPLOYEE     | false     |
| 30 | 빅데이터          | EMPLOYEE     | false     |
| 31 | 데이터사이언스    | EMPLOYEE     | false     |

### 재직자 (EMPLOYEE) - 오프라인
| ID | categoryName      | categoryType | isOffline |
|----|-------------------|--------------|-----------|
| 32 | Infra운영         | EMPLOYEE     | true      |
| 33 | 백엔드 개발       | EMPLOYEE     | true      |
| 34 | 프론트엔드        | EMPLOYEE     | true      |
| 35 | DB                | EMPLOYEE     | true      |
| 36 | AI                | EMPLOYEE     | true      |
| 37 | SW구조            | EMPLOYEE     | true      |
| 38 | 백엔드개발        | EMPLOYEE     | true      |
| 39 | 클라우드운영      | EMPLOYEE     | true      |
| 40 | 프론트엔드        | EMPLOYEE     | true      |
| 41 | 데이터엔지니어링  | EMPLOYEE     | true      |
| 42 | AI/머신러닝       | EMPLOYEE     | true      |
| 43 | SW아키텍처        | EMPLOYEE     | true      |
| 44 | 정보보안전문가    | EMPLOYEE     | true      |
| 45 | IT기획/컨설팅     | EMPLOYEE     | true      |
| 46 | 데이터분석        | EMPLOYEE     | true      |
| 47 | 빅데이터          | EMPLOYEE     | true      |
| 48 | 데이터사이언스    | EMPLOYEE     | true      |

## 현재 Mock 데이터 적용 상황

### 재직자 과정 (EMPLOYEE)
- ID 1: 백엔드 개발 (오프라인)
- ID 2: 프론트엔드 (오프라인)
- ID 3: 데이터엔지니어링 (오프라인)
- ID 4: 클라우드운영 (온라인)
- ID 5: Infra운영 (온라인)
- ID 6: AI/머신러닝 (온라인)

### 취업예정자 과정 (JOB_SEEKER)
- ID 7: 웹개발 (오프라인)
- ID 8: 웹개발 (오프라인)
- ID 9: 웹개발 (오프라인)
- ID 10: 웹개발 (온라인)
- ID 11: 웹개발 (온라인)
- ID 12: 데이터/AI (온라인)

## TypeScript 타입 정의

```typescript
// 백엔드 CategoryType enum
export type CategoryType = 'EMPLOYEE' | 'JOB_SEEKER';

// 취업예정자 상세 카테고리
export type JobSeekerCategoryName = 
    | '웹개발' 
    | '모바일' 
    | '데이터/AI' 
    | '클라우드운영' 
    | '보안' 
    | 'IoT/임베디드' 
    | '게임/블록체인';

// 재직자 상세 카테고리
export type EmployeeCategoryName = 
    | '웹개발'
    | '백엔드 개발'
    | '프론트엔드'
    | 'DB'
    | 'AI'
    | 'SW구조'
    | '백엔드개발'
    | '데이터엔지니어링'
    | 'AI/머신러닝'
    | 'SW아키텍처'
    | '정보보안전문가'
    | 'IT기획/컨설팅'
    | '데이터분석'
    | '빅데이터'
    | '데이터사이언스'
    | 'Infra운영'
    | '클라우드운영';

export interface CourseCategory {
    id: number;
    categoryName: string; // 상세 카테고리명
    categoryType: CategoryType; // EMPLOYEE or JOB_SEEKER
    name?: string; // UI 표시용 한글명 (재직자/취업예정자)
}
```

## 참고사항

1. **카테고리명 중복**: 일부 카테고리명이 중복되는 것은 레거시 데이터로, 의도된 설계입니다.
   - 예: "프론트엔드", "백엔드 개발/백엔드개발" 등
   - ID가 다르므로 구분됨 (백엔드에서는 ID로 관리)

2. **온/오프라인 구분**: `isOffline` boolean 필드로 관리
   - 각 카테고리는 온라인/오프라인 버전이 별도 ID로 존재

3. **필터링 방식**:
   - 1차 필터: `categoryType` (EMPLOYEE/JOB_SEEKER)
   - 2차 필터: `isOffline` (true/false)
   - 3차 필터: `categoryName` (상세 카테고리, 선택적)

