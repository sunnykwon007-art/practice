# 전국 대학교 부트캠프 입찰 현황 대시보드 2026

> **2026년 부트캠프 입찰 현황을 한눈에 파악하는 대시보드**
> 
> 전국 대학교의 부트캠프 참여 현황, 예정된 입찰 정보, 지역별 분포를 시각화하여 관리합니다.

## 🎯 주요 기능

### 📍 지도 뷰
- **전국 지도 기반 시각화**: Leaflet을 활용한 인터랙티브 지도
- **지역별 색상 구분**: 권역별로 다른 색상으로 마커 표시
- **입찰 상태 표시**: 기존 참여 vs 2026 입찰 예정 대학 시각화
- **금액 기반 마커 크기**: 견적 규모에 따른 동적 마커 크기 조정
- **팝업 정보**: 클릭 시 상세 정보 확인 가능

### 📊 리스트 뷰
- **테이블 형식의 데이터**: 모든 대학 정보를 한눈에 표시
- **정렬 및 검색**: 권역, 산업, 상태별 필터링
- **금액 합계**: 선택된 필터에 따른 자동 계산

### ⚙️ 관리자 기능
- **데이터 추가**: 새로운 대학 정보 등록
- **데이터 수정**: 기존 정보 편집
- **다양한 필드 관리**:
  - 학교명, 협력 기업
  - 지역(권역), 주소, 좌표
  - 산업군 분류
  - 견적 금액
  - 제안 유형 (교육LMS, 세미나)
  - 연구책임자 정보
- **로컬 스토리지 자동 저장**: 새로고침 후에도 데이터 유지

## 🛠️ 기술 스택

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Map Library**: Leaflet
- **Maps**: Google Maps Tile Layer
- **Data Storage**: LocalStorage

## 📋 사전 요구사항

- Node.js 16.0 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1. 저장소 클론

\`\`\`bash
git clone https://github.com/your-username/전국-대학교-부트캠프-입찰-현황-대시보드.git
cd 전국-대학교-부트캠프-입찰-현황-대시보드
\`\`\`

### 2. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 \`http://localhost:5173\`을 열어 앱을 확인하세요.

### 4. 프로덕션 빌드

\`\`\`bash
npm run build
\`\`\`

빌드된 파일은 \`dist/\` 디렉토리에 생성됩니다.

### 5. 미리보기

\`\`\`bash
npm run preview
\`\`\`

## 📁 프로젝트 구조

\`\`\`
├── App.tsx                 # 메인 애플리케이션 컴포넌트
├── index.tsx              # React 진입점
├── types.ts               # TypeScript 타입 정의
├── constants.ts           # 상수 (색상, 대학 데이터 등)
├── index.css              # 글로벌 스타일
├── index.html             # HTML 템플릿
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
├── package.json           # 의존성 관리
└── README.md              # 이 파일
\`\`\`

## 📊 데이터 구조

각 대학 정보는 다음의 필드를 포함합니다:

\`\`\`typescript
interface UniversityData {
  school_id: string;              // 고유 ID
  school_name: string;            // 학교명
  partner_company: string;        // 협력 기업
  region: string;                 // 권역
  address: string;                // 주소
  lat: number;                    // 위도
  lng: number;                    // 경도
  amount_sum: number;             // 견적 금액
  status: 'NEW' | 'EXISTING';     // 상태
  proposal_range: string;         // 운영 기준
  industry: string;               // 산업군
  proposal_types: Array<string>;  // 제안 유형
  contact_info?: string;          // 연구책임자 정보
}
\`\`\`

## 🎨 지역별 색상 코드

- 🔵 **서울**: 서울 지역
- 🟢 **경기/인천**: 수도권
- 🟠 **대경권**: 대구, 경북, 경남
- 🔴 **동남권**: 부산, 울산
- 🟣 **충청권**: 충남, 충북
- 🟡 **호남권**: 전남, 전북
- 🟤 **강원/전북/제주**: 기타 지역

## 💾 데이터 관리

### 데이터 저장
- 모든 데이터는 브라우저의 LocalStorage에 저장됩니다
- 새로고침 후에도 데이터가 유지됩니다
- 동일한 환경에서만 접근 가능합니다

### 데이터 내보내기/가져오기
\`\`\`javascript
// 데이터 내보내기
const data = localStorage.getItem('univ_dashboard_data');
console.log(JSON.parse(data));

// 데이터 초기화 (주의!)
localStorage.removeItem('univ_dashboard_data');
\`\`\`

## 🔧 커스터마이징

### 새로운 산업군 추가

\`constants.ts\`의 \`industries\` 배열을 수정하세요:

\`\`\`typescript
const industries = ['반도체', '이차전지', '바이오', '디스플레이', '항공우주', '미래차', '인공지능', '새로운산업'];
\`\`\`

### 기본 대학 데이터 추가

\`constants.ts\`의 \`MOCK_DATA\`를 수정하여 초기 데이터를 설정할 수 있습니다.

## 🤝 기여하기

이 프로젝트에 기여하려면:

1. Fork this repository
2. Create a new branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 💬 지원

문제가 발생하면 [Issues](https://github.com/your-username/전국-대학교-부트캠프-입찰-현황-대시보드/issues) 탭에서 이슈를 등록해주세요.

## 🙏 감사의 말

- Leaflet 라이브러리
- Google Maps
- Tailwind CSS
- React 커뮤니티

---

**마지막 업데이트**: 2026년 4월
