# EC2 컨테이너 관리 가이드

## 배포 디렉토리
```
/home/<username>/deploy/frontend/
├── app.tar.gz          # Docker 이미지 (배포 후 자동 삭제)
└── docker-compose.yml  # 컨테이너 설정
```

## 컨테이너 관리 명령어

### 1. 서비스 상태 확인
```bash
cd /home/<username>/deploy/frontend
docker-compose ps
```

### 2. 서비스 재시작
```bash
docker-compose restart
```

### 3. 서비스 중지
```bash
docker-compose stop
```

### 4. 서비스 시작
```bash
docker-compose start
```

### 5. 로그 확인
```bash
docker-compose logs -f
```

### 6. 컨테이너 재생성 (이미지 업데이트 후)
```bash
docker-compose up -d --force-recreate
```

### 7. 서비스 완전 제거
```bash
docker-compose down
```

## 네트워크 확인
```bash
docker network inspect softcampus-network
```

## 주의사항
- GitHub Actions를 통한 자동 배포가 권장됩니다.
- 수동으로 컨테이너를 조작할 경우 백업을 먼저 생성하세요.
- `docker-compose.yml` 파일을 수정한 경우 `docker-compose up -d`로 재시작하세요.
