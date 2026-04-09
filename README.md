# 전국 대학교 부트캠프 입찰 현황 대시보드 2026

> **2026년 부트캠프 입찰 현황을 한눈에 파악하는 대시보드**
> 
> 전국 대학교의 부트캠프 참여 현황, 예정된 입찰 정보, 지역별 분포를 시각화하여 관리합니다.

## 🎯 주요 기능

### 📍 지도 뷰
- **전국 지도 기반 시각화**: Leaflet을 활용한 인터랙티브 지도
- **지역별 색상 구분**: 권역별로 다른 색상으로 마커 표시
- **프로젝트 상태 표시**: 신규(NEW) vs 기존(EXISTING) 프로젝트 시각화
- **금액 기반 마커 크기**: 견적 규모에 따른 동적 마커 크기 조정
- **팝업 정보**: 클릭 시 상세 정보 확인 가능

### 📊 리스트 뷰
- **테이블 형식의 데이터**: 모든 대학 정보를 한눈에 표시
- **정렬 및 검색**: 권역, 산업, 상태별 필터링
- **금액 합계**: 선택된 필터에 따른 자동 계산

### 🔐 이메일 기반 관리자 승인
- **간편한 로그인**: 이메일만 입력하면 됨
- **마스터 승인 시스템**: `sunny.kwon@modulabs.co.kr`이 새로운 관리자 승인
- **3단계 권한 관리**:
  - 마스터 관리자 (자동 승인)
  - 승인된 관리자 (편집 권한)
  - 승인 대기 중 (조회 전용)

### ⚙️ 데이터 관리 기능
- **데이터 추가**: 새로운 대학/프로젝트 정보 등록
- **데이터 수정**: 기존 정보 편집
- **다양한 필드 관리**:
  - 학교명, 협력 기업
  - 지역(권역), 주소, 좌표
  - 산업군 분류
  - 견적 금액
  - 제안 유형 (교육LMS, 세미나)
  - 연구책임자 정보
  - 프로젝트 마일스톤
- **자동 저장**: localStorage 기반 로컬 저장 + 선택적 Supabase 동기화

## 🛠️ 기술 스택

| 항목 | 버전 | 용도 |
|------|------|------|
| React | 19.2.3 | UI 프레임워크 |
| TypeScript | 5.8.2 | 타입 안전성 |
| Vite | 6.4.2 | 고속 빌드 도구 |
| Tailwind CSS | 3.4.19 | 유틸리티 CSS |
| Leaflet | Latest | 지도 렌더링 |
| Supabase | 2.102.1 | 선택적 백엔드 |

**배포:** Vercel (정적 호스팅)

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

브라우저에서 \`http://localhost:3006\` (또는 표시된 포트)을 열어 앱을 확인하세요.

> **첫 접속 시**: "데이터 관리" 버튼 → 마스터 이메일(`sunny.kwon@modulabs.co.kr`) 입력 → 로그인

### 4. 환경 변수 설정 (선택)

\`\`\`.env.local\`파일 생성 (필수는 아님):

\`\`\`env
VITE_MASTER_ADMIN_EMAIL=sunny.kwon@modulabs.co.kr
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
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

### 저장 구조
- **기본 저장소**: 브라우저 localStorage (설정 불필요, 즉시 사용 가능)
- **선택 저장소**: Supabase 데이터베이스 (클라우드 동기화)

### localStorage 저장되는 항목
- `univ_dashboard_data` - 대학 프로젝트 데이터
- `approved_admin_emails` - 승인된 관리자 이메일 목록
- `pending_approval_emails` - 승인 대기 중 이메일 목록
- `admin_email` - 현재 로그인한 이메일

### 데이터 내보내기/초기화
\`\`\`javascript
// 브라우저 콘솔에서 실행

// 모든 데이터 확인
console.log(localStorage.getItem('univ_dashboard_data'));

// 특정 데이터만 초기화 (주의!)
localStorage.removeItem('univ_dashboard_data');

// 모든 대시보드 데이터 초기화 (주의!)
Object.keys(localStorage)
  .filter(key => key.includes('dashboard'))
  .forEach(key => localStorage.removeItem(key));
\`\`\`

## 🔐 승인 시스템 상세

### 사용 흐름

1. **마스터 관리자 로그인**
   - 이메일: `sunny.kwon@modulabs.co.kr`
   - 결과: 즉시 승인 (자동 로그인)

2. **새 관리자 요청**
   - 이메일 입력 → 승인 대기 상태
   - 로그인 시도 실패 + "승인 대기 중" 메시지

3. **마스터 승인**
   - "승인관리" 버튼 클릭
   - 대기 중인 이메일 목록 확인
   - 승인/거절 선택

4. **승인 완료**
   - 새 관리자가 동일 이메일로 로그인 시 성공
   - 모든 데이터 편집 기능 활성화

자세한 내용: [EMAIL_APPROVAL_GUIDE.md](./EMAIL_APPROVAL_GUIDE.md)

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

**마지막 업데이트**: 2026년 4월 9일  
**현재 버전**: 1.0.0
