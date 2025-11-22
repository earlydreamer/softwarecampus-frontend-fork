# 보안 개선 이력

## 2025-11-23: URL Sanitization 강화

### 문제점
- 기존 `sanitizeUrl` 함수가 `javascript:` 프로토콜만 차단
- `data:`, `vbscript:`, `file:` 등 다른 위험한 프로토콜 허용
- CSS `background-image` 등에서 `data:` URI 악용 가능
- 블랙리스트 방식으로 새로운 공격 벡터에 취약

### 해결 방법
허용 목록(Whitelist) 기반 접근으로 전환:

#### 차단되는 프로토콜
- `javascript:` - XSS 공격
- `data:` - CSS/HTML 인젝션 (기본값, 옵션으로 제어 가능)
- `vbscript:` - VBScript 실행
- `file:` - 로컬 파일 접근
- `about:` - 브라우저 내부 페이지
- 기타 알 수 없는 프로토콜

#### 허용되는 URL 형식
1. **절대 URL**: `http://`, `https://`
2. **프로토콜 상대 URL**: `//example.com`
3. **절대 경로**: `/path/to/resource`
4. **상대 경로**: `./path`, `../path`, `path`
5. **이미지 Data URI** (옵션): `data:image/(png|jpg|jpeg|gif|svg+xml|webp);base64,`

### 사용 예시

```typescript
// 기본 사용 (data: URI 차단)
sanitizeUrl('https://example.com/image.png'); // ✅ 허용
sanitizeUrl('data:text/html,<script>alert(1)</script>'); // ❌ 차단

// data: URI 허용 (이미지만)
sanitizeUrl('data:image/png;base64,iVBORw0KGgo...', true); // ✅ 허용
sanitizeUrl('data:text/html,...', true); // ❌ 차단 (이미지 아님)
```

### 테스트 커버리지
- 위험한 프로토콜 차단: 5개 테스트
- 안전한 URL 허용: 5개 테스트
- data: URI 옵션 처리: 3개 테스트
- 엣지 케이스: 4개 테스트
- 실제 사용 사례: 3개 테스트

**총 20개 테스트 - 모두 통과 ✅**

### 영향 범위
- `src/utils/security.ts` - `sanitizeUrl` 함수 재작성
- 모든 이미지 URL 처리 코드에 영향
- CSS `background-image` 보안 강화
- 링크 `href` 속성 보안 강화

### 보안 등급
- **이전**: 🔴 High Risk (다수의 공격 벡터 허용)
- **이후**: 🟢 Low Risk (허용 목록 기반 검증)

### 참고 자료
- [OWASP: XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
