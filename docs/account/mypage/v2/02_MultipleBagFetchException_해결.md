# MultipleBagFetchException 해결 보고서

## 📅 작업 정보
- **발생일**: 2025년 12월 2일
- **해결일**: 2025년 12월 2일
- **브랜치**: `mypage-community-update`

---

## 🚨 에러 내용

### 에러 로그
```
2025-12-02T23:04:17.969+09:00 WARN 9708 --- [nio-8082-exec-9] .m.m.a.ExceptionHandlerExceptionResolver : 
Resolved [org.springframework.dao.InvalidDataAccessApiUsageException: 
org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: 
[com.softwarecampus.backend.domain.board.Board.boardAttaches, 
 com.softwarecampus.backend.domain.board.Board.boardRecommends]]
```

### 증상
- 게시글 상세 조회 시 에러 발생
- 글쓰기/수정 후 상세 페이지 이동 시 에러

---

## 🔍 원인 분석

### 문제가 된 코드
**파일**: `BoardRepository.java`

```java
// 게시글 상세 조회용: Account + Recommends + Attaches + Comments 한번에 조회
@Query("SELECT DISTINCT b FROM Board b " +
        "LEFT JOIN FETCH b.account " +
        "LEFT JOIN FETCH b.boardAttaches " +       // ❌ List 타입 #1
        "LEFT JOIN FETCH b.boardRecommends br " +  // ❌ List 타입 #2
        "LEFT JOIN FETCH br.account " +
        "WHERE b.id = :id")
Optional<Board> findByIdWithDetails(@Param("id") Long id);
```

### Board 엔티티 구조
```java
@Entity
public class Board extends BaseSoftDeleteSupportEntity {
    // ...
    
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    @Builder.Default
    @BatchSize(size = 100)
    private List<BoardAttach> boardAttaches = new ArrayList<>();  // List 타입

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    @BatchSize(size = 100)
    private List<BoardRecommend> boardRecommends = new ArrayList<>();  // List 타입
}
```

### 왜 에러가 발생하는가?

JPA/Hibernate에서 **두 개 이상의 `List` 타입 `@OneToMany` 컬렉션을 동시에 `JOIN FETCH`하면** `MultipleBagFetchException`이 발생합니다.

**Bag이란?**
- Hibernate에서 `List`는 "Bag"으로 취급됩니다
- Bag은 중복을 허용하고 순서가 없는 컬렉션입니다
- 두 개의 Bag을 동시에 Fetch하면 **카테시안 곱(Cartesian Product)** 문제가 발생할 수 있어 Hibernate가 이를 막습니다

---

## ✅ 해결 방법

### 적용한 해결책: JOIN FETCH 분리

```java
// 게시글 상세 조회용: Account + Attaches 조회 (Recommends는 BatchSize로 처리)
@Query("SELECT DISTINCT b FROM Board b " +
        "LEFT JOIN FETCH b.account " +
        "LEFT JOIN FETCH b.boardAttaches " +
        "WHERE b.id = :id")
Optional<Board> findByIdWithDetails(@Param("id") Long id);
```

**변경 사항:**
- `boardRecommends`의 `JOIN FETCH` 제거
- `boardRecommends`는 이미 `@BatchSize(size = 100)` 설정이 있어서 필요할 때 효율적으로 로딩됨

### 왜 이 방법이 좋은가?

1. **기존 코드 변경 최소화**: 엔티티 타입(`List` → `Set`) 변경 불필요
2. **성능 유지**: `@BatchSize`로 N+1 문제 방지
3. **안정성**: 카테시안 곱 문제 완전 회피

---

## 📚 대안적 해결 방법들

### 방법 1: List → Set 변경
```java
// Board.java
@OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
private Set<BoardAttach> boardAttaches = new HashSet<>();

@OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
private Set<BoardRecommend> boardRecommends = new HashSet<>();
```
- **장점**: 동시 JOIN FETCH 가능
- **단점**: 순서 보장 안 됨, 기존 코드 수정 필요

### 방법 2: 두 번의 쿼리로 분리
```java
// 첫 번째 쿼리: Attaches 조회
@Query("SELECT b FROM Board b LEFT JOIN FETCH b.boardAttaches WHERE b.id = :id")
Optional<Board> findByIdWithAttaches(@Param("id") Long id);

// 두 번째 쿼리: Recommends 조회
@Query("SELECT b FROM Board b LEFT JOIN FETCH b.boardRecommends WHERE b.id = :id")
Optional<Board> findByIdWithRecommends(@Param("id") Long id);
```
- **장점**: 명시적이고 유연함
- **단점**: 쿼리 2번 실행

### 방법 3: @EntityGraph 사용
```java
@EntityGraph(attributePaths = {"account", "boardAttaches"})
Optional<Board> findById(Long id);
```
- **장점**: 선언적이고 깔끔함
- **단점**: 동적 쿼리에 제한적

---

## 🔗 관련 파일

| 파일 | 변경 내용 |
|------|-----------|
| `BoardRepository.java` | `findByIdWithDetails` 쿼리 수정 |

---

## 📝 참고 자료

- [Hibernate MultipleBagFetchException](https://vladmihalcea.com/hibernate-multiplebagfetchexception/)
- [JPA N+1 문제 해결](https://jojoldu.tistory.com/165)
- [@BatchSize 사용법](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#fetching-batch)
