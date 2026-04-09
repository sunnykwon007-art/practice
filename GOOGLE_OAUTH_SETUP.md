# Google OAuth 2.0 설정 가이드

## 1. Google Cloud Console에서 OAuth 2.0 Client ID 생성

### 1.1 프로젝트 생성 및 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 (프로젝트명: "AX_PJT Dashboard" 등)
3. **APIs & Services** > **OAuth consent screen** 이동
4. **Create** 클릭
5. User type: **External** 선택 > **Create**

### 1.2 OAuth Consent Screen 구성
1. **App information** 섹션:
   - App name: "2026 대학부트캠프 AX_PJT"
   - User support email: sunny.kwon@modulabs.co.kr
   - Developer contact: sunny.kwon@modulabs.co.kr

2. **Scopes** 섹션:
   - email, profile scopes 자동 선택됨 (변경 불필요)

3. **Test users** 섹션:
   - **Add users** 클릭
   - sunny.kwon@modulabs.co.kr 추가 (마스터 계정)

### 1.3 Credentials (OAuth 2.0 Client ID) 생성
1. **Credentials** 탭으로 이동
2. **Create Credentials** > **OAuth client ID** 클릭
3. Application type: **Web application** 선택
4. **Authorized redirect URIs** 추가:
   ```
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   http://localhost:3003
   http://localhost:5173
   https://your-vercel-domain.vercel.app
   https://your-vercel-domain.vercel.app/
   ```
5. **Create** 클릭하여 Client ID 획득

## 2. 로컬 환경 설정

### 2.1 .env.local 생성
```bash
# .env.local 파일 생성 (프로젝트 루트)
cp .env.example .env.local
```

### 2.2 .env.local 편집
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth Client ID (위에서 복사한 ID)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# 마스터 관리자 이메일 (데이터 관리 권한이 필요한 계정)
VITE_MASTER_ADMIN_EMAIL=sunny.kwon@modulabs.co.kr
```

### 2.3 테스트
```bash
npm run dev
# 브라우저에서 localhost:3003 또는 표시된 포트 접속
# "데이터 관리" 클릭 > Google 로그인 진행
```

## 3. Vercel 배포 시 환경변수 설정

### 3.1 Vercel 대시보드에서 설정
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables**
4. 3개 환경변수 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_MASTER_ADMIN_EMAIL`

### 3.2 Google Cloud Console에서 Redirect URI 추가
1. Google Cloud Console > **Credentials**
2. OAuth 2.0 Client ID 편집
3. **Authorized redirect URIs**에 Vercel URL 추가:
   ```
   https://your-vercel-domain.vercel.app
   https://your-vercel-domain.vercel.app/
   ```

## 4. 문제 해결

### "액세스 차단됨: 승인 오류" 에러
- **원인**: OAuth 앱이 아직 검증되지 않았거나 마스터 계정이 Test users에 등록되지 않음
- **해결**:
  1. Google Cloud Console > OAuth consent screen > Test users에서 sunny.kwon@modulabs.co.kr 확인
  2. 브라우저 시크릿 모드에서 재시도
  3. 캐시 삭제 후 재시도

### "VITE_GOOGLE_CLIENT_ID 환경변수 없음" 에러
- .env.local 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작 필요: `npm run dev`

### 로그인 후에도 데이터 관리 버튼 비활성화
- 로그인한 이메일이 VITE_MASTER_ADMIN_EMAIL과 일치하는지 확인
- 현재 로그인한 계정 확인: 브라우저 오른쪽 상단 로그인 상태 표시 확인

---

## 참고사항
- Test users는 개발/테스트 단계에서만 로그인 가능
- 프로덕션 배포 시 앱 검증 필수 (Google에 제출)
- OAuth consent screen의 Test users에서 추가 유저 가능 (협력 관리자 등)
