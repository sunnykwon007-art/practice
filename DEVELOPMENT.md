# 부트캠프 입찰 현황 대시보드 - 개발 가이드

## 프로젝트 구조

### 핵심 파일

- **App.tsx**: 메인 React 컴포넌트
  - 지도와 리스트 뷰 구현
  - 관리자 UI 및 데이터 관리
  - 필터링 및 검색 기능

- **types.ts**: TypeScript 타입 정의
  - `UniversityData` 인터페이스
  - `Region` 열거형

- **constants.ts**: 상수 정의
  - `MOCK_DATA`: 초기 더미 데이터
  - `REGION_COLORS`: 지역별 색상
  - `UNIVERSITY_PRESETS`: 대학 좌표 및 기본 정보

- **vite.config.ts**: Vite 빌드 설정
- **tsconfig.json**: TypeScript 컴파일러 설정

## 개발 워크플로우

### 1. 로컬 개발
```bash
npm install
npm run dev
```

### 2. TypeScript 타입 검사
```bash
npm run type-check
```

### 3. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 주요 기능 구현

### 관리자 기능 추가 시 주의사항

1. **Form 상태 관리**
   - `formData` 상태를 업데이트분야 정확히 추적
   - 입력 검증 필수

2. **LocalStorage 저장**
   - `handleAddOrUpdateData` 함수에서 자동 저장
   - 데이터 구조와 `UniversityData` 타입 일치 필수

3. **지도 마커 업데이트**
   - 데이터 변경 시 자동으로 `renderMarkers()` 호출
   - 필터링 적용 후 마커 상태 동기화

### 새로운 필드 추가 방법

1. **types.ts**에서 `UniversityData` 인터페이스에 필드 추가
2. **App.tsx**의 `formData` 상태에 필드 추가
3. **App.tsx**의 form JSX에 입력 필드 추가
4. 필요시 상수 파일에서 색상/옵션 추가

## 배포

### Vercel에 배포 (권장)

1. GitHub에 코드 push
2. [Vercel](https://vercel.com)에서 프로젝트 생성
3. GitHub 저장소 연결
4. 자동 배포 설정 완료

### 기타 호스팅

- **Netlify**: GitHub 연동 후 자동 배포
- **GitHub Pages**: `vite.config.ts`에서 base 경로 설정
- **Docker**: 컨테이너화 배포

## 문제 해결

### 지도가 표시되지 않음
- Leaflet CSS 임포트 확인
- Google Maps API 주소 유효성 확인
- CORS 이슈 확인

### 데이터가 저장되지 않음
- LocalStorage 지원 여부 확인
- 브라우저 프라이빗 모드 확인
- LocalStorage 용량 확인

### 성능 최적화
- 마커 개수 증가 시 클러스터링 고려
- 큰 데이터셋의 경우 가상 스크롤 검토

## 향후 개선 사항

- [ ] 백엔드 API 연동
- [ ] 사용자 인증
- [ ] 데이터 내보내기/가져오기 (CSV, Excel)
- [ ] 실시간 협업 기능
- [ ] 알림 및 타임라인 기능
- [ ] 모바일 앱 버전
- [ ] PWA 지원
- [ ] 있어까

## 기여 가이드

PR을 보내기 전에:
1. 로컬에서 충분히 테스트
2. TypeScript 타입 검사 통과 (`npm run type-check`)
3. 의미 있는 commit 메시지 작성
4. README 또는 코드 주석 업데이트
