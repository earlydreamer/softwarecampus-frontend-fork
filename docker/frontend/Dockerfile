# ------------------------------------------------------------------------------
# [Frontend Dockerfile]
#
# 목적: React 애플리케이션의 빌드 및 배포를 위한 컨테이너 이미지 생성
# 작성 의도:
#   1. Multi-stage 빌드 전략 사용:
#      - Builder Stage: Node.js 환경에서 의존성 설치 및 빌드 수행 (소스코드 보안, 이미지 경량화)
#      - Serve Stage: Nginx Alpine 기반의 경량화된 이미지로 정적 파일 서빙
#   2. 환경변수 처리: CI/CD 파이프라인에서 주입된 .env 파일을 빌드 시점에 포함
#   3. SPA 라우팅 지원: 커스텀 nginx.conf를 사용하여 모든 요청을 index.html로 리다이렉트
# ------------------------------------------------------------------------------

# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
# npm ci: lock 파일 기준 정확한 설치 (프로덕션 권장)
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
# 이 단계에서 .env 파일이 존재해야 합니다 (CI에서 주입됨)
RUN npm run build

# 서빙 스테이지
FROM nginx:alpine

# 빌드 스테이지에서 생성된 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 복사
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 노출
EXPOSE 80

# Health Check 설정
# 컨테이너가 정상적으로 동작하는지 주기적으로 확인합니다.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
