# 이메일 승인 기반 데이터 관리 가이드

## 📋 시스템 개요

간단한 이메일 기반 승인 시스템으로 Google OAuth 없이 데이터 관리가 가능합니다.

## 👥 사용자 역할

### 마스터 관리자
- 이메일: `sunny.kwon@modulabs.co.kr`
- 모든 관리자 이메일 승인/거부
- 데이터 편집 권한

### 승인된 관리자
- 마스터 관리자로부터 승인받은 이메일
- 데이터 편집 권한

### 미승인 사용자
- 로그인은 가능하지만 데이터 편집 불가
- 승인 신청 가능

## 🔐 사용 방법

### 1단계: 마스터 계정으로 로그인
- "데이터 관리" 버튼 클릭
- `sunny.kwon@modulabs.co.kr` 입력
- "로그인 / 승인 신청" 클릭
- ✅ 자동으로 마스터 계정으로 로그인됨

### 2단계: 다른 계정 승인 (마스터 계정에서)
1. 헤더의 "승인관리" 버튼 클릭
2. 승인 대기 중인 이메일 목록 확인
3. "승인" 또는 "거부" 버튼 클릭
4. 상태 업데이트

### 3단계: 승인된 계정으로 로그인
1. "데이터 관리" 버튼 클릭
2. 승인받은 이메일 입력
3. "로그인 / 승인 신청" 클릭
4. ✅ 데이터 편집 권한 확보

## 💾 데이터 저장

모든 승인 정보는 **브라우저 localStorage**에 저장됩니다:
- `approved_admin_emails`: 승인된 관리자 목록
- `pending_approval_emails`: 승인 대기 중인 목록
- `admin_email`: 현재 로그인한 계정

## ⚙️ 환경 설정

`.env.local` 파일 생성 (옵션):
```env
# 마스터 관리자 이메일 (기본값: sunny.kwon@modulabs.co.kr)
VITE_MASTER_ADMIN_EMAIL=sunny.kwon@modulabs.co.kr

# Supabase 설정 (프로덕션용)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🚀 로컬 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 localhost:3005 (또는 표시된 포트) 접속
```

## 🔄 계정 상태 표시

- **마스터 관리자**: "마스터 관리자" 표시
- **승인된 계정**: "승인됨" 표시
- **미승인 계정**: "승인 대기중" 표시

## ⚠️ 주의사항

1. **localStorage 초기화 시 모든 승인 정보 삭제됨**
   - 중요한 데이터이므로 브라우저 캐시 삭제 시 주의

2. **다른 브라우저/기기에서는 별도로 로그인 필요**
   - 각 브라우저마다 독립적인 localStorage 사용

3. **배포 시 Supabase 연동 권장**
   - 프로덕션 환경에서는 승인 정보를 Supabase에 저장하는 것이 좋습니다

## 📱 Vercel 배포

```bash
# Vercel 대시보드에서 환경변수 설정 (선택사항)
VITE_MASTER_ADMIN_EMAIL=sunny.kwon@modulabs.co.kr
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

**무료 설정, 복잡한 OAuth 없음, 간단한 이메일 기반 승인! ✨**
