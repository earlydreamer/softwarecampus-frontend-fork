# 과정 이미지 표시 문제 해결

**작성일**: 2025-12-02  
**작성자**: AI Assistant (GitHub Copilot)

---

## 목차
1. [문제 상황](#문제-상황)
2. [원인 분석](#원인-분석)
3. [Hibernate MultipleBagFetchException 상세](#hibernate-multiplebagfetchexception-상세)
4. [S3 퍼블릭 액세스 문제 상세](#s3-퍼블릭-액세스-문제-상세)
5. [해결 방법](#해결-방법)
6. [검증 결과](#검증-결과)
7. [관련 파일](#관련-파일)
8. [주의사항](#주의사항)

---

## 문제 상황

과정 등록 시 업로드한 썸네일 이미지와 헤더 이미지가 과정 상세 페이지 및 목록에서 표시되지 않는 문제 발생.

### 증상
1. 과정 상세 페이지 (`/lectures/25`)에서 헤더 배경 이미지가 표시되지 않음
2. 과정 목록 카드에서 썸네일 이미지가 깨진 아이콘으로 표시됨
3. 브라우저 Network 탭에서 S3 이미지 URL 요청 시 **403 Forbidden** 에러 발생

### DB 데이터 확인
이미지 데이터는 DB에 정상적으로 저장되어 있음:
```sql
SELECT id, course_id, image_url, is_thumbnail, image_type, is_deleted 
FROM course_image WHERE course_id = 25;

+----+-----------+------------------------------------------------------------------+--------------+------------+------------+
| id | course_id | image_url                                                        | is_thumbnail | image_type | is_deleted |
+----+-----------+------------------------------------------------------------------+--------------+------------+------------+
|  5 |        25 | https://swcampus-s3.s3.../.../7d1d86b8-53ac-444c-80be-...png    | 0x01 (true)  | THUMBNAIL  | 0x00       |
|  6 |        25 | https://swcampus-s3.s3.../.../4f8c2f70-461c-4e2d-b367-...png    | 0x00 (false) | HEADER     | 0x00       |
+----+-----------+------------------------------------------------------------------+--------------+------------+------------+
```

### API 응답 (수정 전)
```json
{
  "id": 25,
  "name": "과정테스트과정테스트123",
  "imageUrl": "",           // ← 빈 값!
  "headerImageUrl": "",     // ← 빈 값!
  "requirement": "<p>과정설명...</p><img ...>"
}
```

---

## 원인 분석

### 1. 백엔드 - `CourseDetailResponseDTO`에 이미지 필드 누락
- `CourseResponseDTO` (목록용)에는 `imageUrl`, `headerImageUrl` 필드가 존재
- `CourseDetailResponseDTO` (상세 조회용)에는 해당 필드가 **없었음**
- 과정 상세 API `/api/courses/{id}` 응답에 이미지 URL이 포함되지 않음

### 2. 백엔드 - Repository 쿼리에서 images 미로딩
- `findWithDetailsByIdAndDeletedAtIsNull` 쿼리에서 `images` 컬렉션을 Fetch하지 않음
- Course 엔티티의 images 관계가 `@OneToMany(fetch = FetchType.LAZY)`로 설정
- 트랜잭션 외부에서 `course.getImages()` 접근 시 빈 컬렉션 또는 LazyInitializationException 발생

### 3. 백엔드 - MultipleBagFetchException 발생 (아래 상세 섹션 참조)

### 4. S3 버킷 - 퍼블릭 액세스 차단 (아래 상세 섹션 참조)

---

## Hibernate MultipleBagFetchException 상세

### 문제 발생 경위

#### 시도 1: @EntityGraph로 images, curriculums 동시 로딩
```java
@Query("SELECT c FROM Course c JOIN c.academy a JOIN c.category cat WHERE c.id = :id ...")
@EntityGraph(attributePaths = { "images", "curriculums", "academy", "category" })
Optional<Course> findWithDetailsByIdAndDeletedAtIsNull(@Param("id") Long id);
```

#### 에러 메시지
```
org.springframework.dao.InvalidDataAccessApiUsageException: 
org.hibernate.loader.MultipleBagFetchException: 
cannot simultaneously fetch multiple bags: 
[com.softwarecampus.backend.domain.course.Course.curriculums, 
 com.softwarecampus.backend.domain.course.Course.images]
```

### 원인 분석

#### Bag이란?
- Hibernate에서 **Bag**은 중복을 허용하고 순서가 없는 컬렉션
- Java의 `List`가 `@OrderColumn` 없이 사용되면 Bag으로 취급됨

#### 왜 Multiple Bag Fetch가 불가능한가?
1. **카테시안 곱 문제**: 두 개의 OneToMany 컬렉션을 동시에 FETCH JOIN하면 카테시안 곱이 발생
2. **중복 데이터**: 결과 집합에서 어떤 행이 어떤 컬렉션에 속하는지 구분 불가
3. **메모리 폭발**: N * M 개의 행이 생성되어 성능 및 메모리 문제 발생

#### Course 엔티티 구조
```java
@Entity
public class Course extends BaseSoftDeleteSupportEntity {
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CourseCurriculum> curriculums = new ArrayList<>();  // Bag #1

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CourseImage> images = new ArrayList<>();  // Bag #2
}
```

### 해결 방법들

#### 방법 1: List를 Set으로 변경 (권장하지 않음 - 기존 코드 영향)
```java
private Set<CourseCurriculum> curriculums = new HashSet<>();
private Set<CourseImage> images = new HashSet<>();
```
- 장점: 가장 간단
- 단점: 순서 보장 불가, 기존 코드 모두 수정 필요

#### 방법 2: @OrderColumn 사용 (권장하지 않음 - 스키마 변경)
```java
@OneToMany(mappedBy = "course")
@OrderColumn(name = "display_order")
private List<CourseImage> images;
```
- 장점: List 유지 가능
- 단점: DB 스키마 변경 필요

#### 방법 3: 분리 로딩 (채택)
```java
// Repository: 하나의 컬렉션만 @EntityGraph로 로딩
@EntityGraph(attributePaths = { "images", "academy", "category" })
Optional<Course> findWithDetailsByIdAndDeletedAtIsNull(@Param("id") Long id);

// Service: 다른 컬렉션은 Hibernate.initialize()로 별도 초기화
@Transactional
public CourseDetailResponseDTO getCourseDetail(Long courseId) {
    Course course = courseRepository.findWithDetailsByIdAndDeletedAtIsNull(courseId)
            .orElseThrow(() -> new EntityNotFoundException("..."));
    
    // curriculums는 트랜잭션 내에서 별도 초기화
    org.hibernate.Hibernate.initialize(course.getCurriculums());
    
    return CourseDetailResponseDTO.fromEntity(course);
}
```

#### 방법 4: 두 번의 쿼리로 분리 (대안)
```java
// 첫 번째 쿼리: Course + images
Course course = courseRepository.findWithImages(courseId);

// 두 번째 쿼리: curriculums
List<CourseCurriculum> curriculums = curriculumRepository.findByCourseId(courseId);
course.setCurriculums(curriculums);
```

### 채택한 해결책

**방법 3: 분리 로딩** 채택
- `@EntityGraph`로 `images`, `academy`, `category` 로딩
- `Hibernate.initialize()`로 `curriculums` 별도 초기화
- 기존 코드 변경 최소화, 스키마 변경 없음

---

## S3 퍼블릭 액세스 문제 상세

### 문제 발생 경위

1. 백엔드 API 응답에 S3 URL이 정상 반환됨:
   ```
   imageUrl: https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/7d1d86b8-...png
   ```

2. 프론트엔드 콘솔에서 URL 확인 가능:
   ```
   [CourseDetailPage] course.imageUrl: https://swcampus-s3.s3...
   [CourseDetailPage] course.headerImageUrl: https://swcampus-s3.s3...
   ```

3. 브라우저 Network 탭에서 **403 Forbidden** 확인:
   ```
   Request URL: https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/7d1d86b8-...png
   Status Code: 403 Forbidden
   ```

### 원인 분석

#### S3 버킷 기본 설정
AWS S3는 기본적으로 **모든 퍼블릭 액세스를 차단**함:
- Block public access (bucket settings): **ON** (기본값)
- 버킷 정책: 없음 (기본값)
- CORS: 설정 없음 (기본값)

#### 403 Forbidden 발생 원인
1. **버킷 레벨 퍼블릭 액세스 차단**: 버킷 설정에서 퍼블릭 액세스가 차단됨
2. **객체 레벨 ACL 없음**: 개별 객체에 퍼블릭 읽기 권한이 없음
3. **버킷 정책 없음**: `s3:GetObject` 액션을 허용하는 정책이 없음

#### CORS 문제 (추가 고려사항)
브라우저에서 다른 도메인의 리소스 요청 시 CORS 정책 적용:
- Origin: `http://localhost:5173` (프론트엔드)
- Target: `https://swcampus-s3.s3.ap-northeast-2.amazonaws.com` (S3)
- CORS 설정이 없으면 브라우저에서 요청 차단 가능

### 해결 과정

#### Step 1: 퍼블릭 액세스 차단 해제

**AWS Console > S3 > swcampus-s3 > Permissions > Block public access**

기존 설정 (모두 ON):
- [x] Block all public access
- [x] Block public access to buckets and objects granted through new ACLs
- [x] Block public access to buckets and objects granted through any ACLs
- [x] Block public and cross-account access to buckets granted through new public bucket policies
- [x] Block public and cross-account access to buckets granted through any public bucket policies

변경 설정 (모두 OFF):
- [ ] Block all public access
- [ ] Block public access to buckets and objects granted through new ACLs
- [ ] Block public access to buckets and objects granted through any ACLs
- [ ] Block public and cross-account access to buckets granted through new public bucket policies
- [ ] Block public and cross-account access to buckets granted through any public bucket policies

#### Step 2: 버킷 정책 추가

**AWS Console > S3 > swcampus-s3 > Permissions > Bucket policy**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::swcampus-s3/*"
        }
    ]
}
```

**정책 설명:**
- `Version`: IAM 정책 언어 버전
- `Sid`: 정책 식별자 (선택사항)
- `Effect`: Allow - 허용
- `Principal`: * - 모든 사용자 (익명 포함)
- `Action`: s3:GetObject - 객체 읽기만 허용 (쓰기, 삭제 불가)
- `Resource`: 버킷 내 모든 객체 (`/*`)

#### Step 3: CORS 설정

**AWS Console > S3 > swcampus-s3 > Permissions > CORS**

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

**설정 설명:**
- `AllowedHeaders`: 모든 헤더 허용
- `AllowedMethods`: GET, HEAD만 허용 (읽기 전용)
- `AllowedOrigins`: 모든 도메인 허용 (운영 환경에서는 특정 도메인만 허용 권장)
- `ExposeHeaders`: 브라우저에 노출할 추가 헤더 (없음)

### 보안 고려사항

#### 현재 설정의 위험
- 모든 사람이 버킷 내 모든 파일에 접근 가능
- URL을 알면 누구나 파일 다운로드 가능

#### 운영 환경 권장 설정

**Option 1: 특정 Origin만 허용**
```json
{
    "AllowedOrigins": [
        "https://softwarecampus.earlydreamer.dev",
        "http://localhost:5173"
    ]
}
```

**Option 2: CloudFront + Signed URL 사용**
- S3 버킷은 비공개로 유지
- CloudFront를 통해서만 접근 허용
- Signed URL로 시간 제한 접근 토큰 발급

**Option 3: 폴더별 정책 적용**
```json
{
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::swcampus-s3/course/*"  // course 폴더만 공개
        }
    ]
}
```

---

## 해결 방법

### 1. `CourseDetailResponseDTO` 수정

**파일**: `backend/src/main/java/.../dto/course/CourseDetailResponseDTO.java`

```java
// import 추가
import com.softwarecampus.backend.domain.course.CourseImageType;

// 필드 추가 (approvalStatus, approvedAt 아래)
private String imageUrl;        // 과정 이미지 (썸네일 - 목록 표시용)
private String headerImageUrl;  // 과정 헤더 이미지 (상세 페이지 배경)

// fromEntity() 메서드 수정 - 이미지 추출 로직 추가
public static CourseDetailResponseDTO fromEntity(Course course) {
    var academy = course.getAcademy();
    var category = course.getCategory();

    // 썸네일 이미지 추출 (THUMBNAIL 타입 또는 기존 isThumbnail=true)
    String imageUrl = course.getImages() != null ? course.getImages().stream()
            .filter(img -> img.isActive() && img.isThumbnail())
            .findFirst()
            .map(com.softwarecampus.backend.domain.course.CourseImage::getImageUrl)
            .orElse(null) : null;

    // 헤더 이미지 추출 (HEADER 타입)
    String headerImageUrl = course.getImages() != null ? course.getImages().stream()
            .filter(img -> img.isActive() && img.getImageType() == CourseImageType.HEADER)
            .findFirst()
            .map(com.softwarecampus.backend.domain.course.CourseImage::getImageUrl)
            .orElse(null) : null;

    // 평점 계산 로직 ...

    return CourseDetailResponseDTO.builder()
            // ... 기존 필드들 ...
            .imageUrl(imageUrl)
            .headerImageUrl(headerImageUrl)
            .rating(rating)
            .reviewCount(reviewCount)
            .curriculums(...)
            .build();
}
```

### 2. `CourseRepository` 쿼리 수정

**파일**: `backend/src/main/java/.../repository/course/CourseRepository.java`

```java
/**
 * ID로 과정 상세 조회 (삭제된 과정 제외, 연관엔티티 함께 로딩)
 * APPROVED 상태이고, Academy와 Category가 삭제되지 않은 경우만 조회
 * 
 * Note: MultipleBagFetchException 방지를 위해 images만 @EntityGraph로 로딩
 * curriculums는 Service에서 Hibernate.initialize()로 초기화
 */
@Query("SELECT c FROM Course c " +
        "JOIN c.academy a " +
        "JOIN c.category cat " +
        "WHERE c.id = :id " +
        "AND c.deletedAt IS NULL " +
        "AND c.isApproved = 'APPROVED' " +
        "AND a.deletedAt IS NULL " +
        "AND cat.deletedAt IS NULL")
@org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "images", "academy", "category" })
Optional<Course> findWithDetailsByIdAndDeletedAtIsNull(@Param("id") Long id);
```

### 3. `CourseServiceImpl`에서 curriculums 초기화

**파일**: `backend/src/main/java/.../service/course/CourseServiceImpl.java`

```java
/**
 * 과정 상세 조회 (조회수 증가 포함)
 * 수정일: 2025-12-02 - @Transactional 추가 (viewCount 증가 반영을 위해)
 * 수정일: 2025-12-02 - curriculums 초기화 추가 (MultipleBagFetchException 방지)
 */
@Override
@Transactional
public CourseDetailResponseDTO getCourseDetail(@NonNull Long courseId) {
    Course course = courseRepository.findWithDetailsByIdAndDeletedAtIsNull(courseId)
            .orElseThrow(() -> new EntityNotFoundException("해당 과정이 존재하지 않습니다. ID=" + courseId));

    // 조회수 증가
    course.incrementViewCount();

    // curriculums 초기화 (Lazy Loading - MultipleBagFetchException 방지)
    org.hibernate.Hibernate.initialize(course.getCurriculums());

    return CourseDetailResponseDTO.fromEntity(course);
}
```

### 4. 프론트엔드 - 이미지 로딩 실패 처리

**파일**: `frontend/src/components/common/CourseCard.tsx`

```tsx
const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    // 이미지 로딩 에러 핸들러
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = DEFAULT_COURSE_IMAGE;
    };

    // ... 기존 코드 ...

    return (
        <div className="...">
            <Link to={`/lectures/${course.id}`}>
                <div className="relative h-48 overflow-hidden">
                    <img
                        className="w-full h-full object-cover ..."
                        src={sanitizeUrl(course.imageUrl || '') || DEFAULT_COURSE_IMAGE}
                        alt={course.name || '과정 이미지'}
                        onError={handleImageError}  // 추가
                    />
                    {/* ... */}
                </div>
                {/* ... */}
            </Link>
        </div>
    );
};
```

### 5. 프론트엔드 - 헤더 배경 투명도 조정

**파일**: `frontend/src/pages/CourseDetailPage.tsx`

```tsx
{/* Header Section */}
<div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
    <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"  {/* opacity-20 → opacity-40 */}
        style={{ backgroundImage: `url('${sanitizeUrl(course.headerImageUrl || '')}')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
    {/* ... */}
</div>
```

---

## 검증 결과

### API 응답 확인 (수정 후)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8081/api/courses/25" -UseBasicParsing
$response.Content | ConvertFrom-Json | Select-Object id, name, imageUrl, headerImageUrl | Format-List

id             : 25
name           : 과정테스트과정테스트123
imageUrl       : https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/7d1d86b8-53ac-444c-80be-d699e4920fbc.png
headerImageUrl : https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/4f8c2f70-461c-4e2d-b367-978a3db52ae1.png
```

### 프론트엔드 콘솔 로그
```
[CourseDetailPage] course.imageUrl: https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/7d1d86b8-...png
[CourseDetailPage] course.headerImageUrl: https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/4f8c2f70-...png
```

### S3 이미지 접근 확인
```powershell
$response = Invoke-WebRequest -Uri "https://swcampus-s3.s3.ap-northeast-2.amazonaws.com/course/7d1d86b8-...png" -Method Head
Status: 200  # 정상 접근 가능
```

---

## 관련 파일

### 백엔드
| 파일 | 변경 내용 |
|------|-----------|
| `CourseDetailResponseDTO.java` | imageUrl, headerImageUrl 필드 및 추출 로직 추가 |
| `CourseRepository.java` | @EntityGraph로 images, academy, category 로딩 |
| `CourseServiceImpl.java` | Hibernate.initialize()로 curriculums 초기화 |

### 프론트엔드
| 파일 | 변경 내용 |
|------|-----------|
| `CourseCard.tsx` | onError 핸들러 추가, 기본 이미지 폴백 |
| `CourseDetailPage.tsx` | 헤더 배경 투명도 조정 (opacity-20 → opacity-40) |

### AWS
| 설정 | 변경 내용 |
|------|-----------|
| S3 Block public access | 모든 차단 옵션 OFF |
| S3 Bucket policy | PublicReadGetObject 정책 추가 |
| S3 CORS | GET, HEAD 메서드 허용 설정 |

---

## 주의사항

### 1. MultipleBagFetchException 관련
- 두 개 이상의 `List` 컬렉션을 동시에 FETCH JOIN 불가
- 해결책:
  - 하나는 @EntityGraph, 다른 하나는 `Hibernate.initialize()` 사용
  - 또는 `List`를 `Set`으로 변경 (순서 보장 불필요한 경우)
  - 또는 `@OrderColumn` 추가 (DB 스키마 변경 필요)

### 2. S3 퍼블릭 액세스 관련
- 현재 설정은 **모든 파일에 대한 퍼블릭 읽기 허용**
- 민감한 파일이 있는 경우 위험
- 운영 환경 권장:
  - CloudFront + Signed URL 사용
  - 또는 폴더별 정책 적용
  - 또는 특정 Origin만 CORS 허용

### 3. 이미지 폴백 처리
- S3 접근 실패 시에도 UI가 깨지지 않도록 기본 이미지 표시
- `onError` 핸들러로 이미지 로딩 실패 대응

### 4. 트랜잭션 범위
- `Hibernate.initialize()`는 **반드시 트랜잭션 내에서** 호출해야 함
- `@Transactional` 어노테이션 확인 필수
