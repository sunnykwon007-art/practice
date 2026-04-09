# 🚀 Vercel 배포 가이드

## 빠른 배포 (1분)

### 1단계: Vercel 계정 생성
1. [Vercel 웹사이트](https://vercel.com) 방문
2. GitHub 계정으로 가입
3. 로그인

### 2단계: 프로젝트 배포
1. Vercel 대시보드에서 **"New Project"** 클릭
2. GitHub 저장소 검색: `practice`
3. **Import** 클릭
4. 기본 설정 그대로 진행
5. **Deploy** 버튼 클릭

### 3단계: 배포 완료!
```
✓ Deployment successful to https://yourapp.vercel.app
```

## 환경 변수 설정 (선택)

배포 후 Supabase 동기화를 원하면:

1. 배포된 프로젝트 대시보드 열기
2. **Settings** → **Environment Variables**
3. 다음 추가:

| 변수 | 값 |
|------|------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |

4. **Save** 클릭
5. **Deployments** → 최신 배포 **Redeploy** 클릭

## 배포 후 확인사항

✅ **배포 성공 확인:**
- Vercel 배포 URL 접속
- "AXP 프로젝트 현황" 제목 표시됨
- 지도 + 데이터 표시됨

✅ **기능 테스트:**
- "데이터 관리" 클릭
- 마스터 이메일 입력 → 로그인
- 데이터 추가/수정 기능 작동

✅ **데이터 저장 확인:**
- localStorage에 데이터 저장됨
- 새로고침 후 데이터 유지됨

## 배포 URL 예시

```
https://practice-six.vercel.app/
```

## 자동 배포 설정

### GitHub 연동 배포
- **main** 브랜치에 `git push`
- Vercel이 자동으로 빌드 & 배포
- 약 1-2분 후 완료

### 배포 상태 확인
1. Vercel 대시보드 확인
2. GitHub의 커밋 옆 배포 상태 아이콘 클릭

## 배포 최적화

### 성능 점수
- **Lighthouse Score**: 90+ (최적 상태)
- **빌드 시간**: ~30초
- **최종 크기**: 432KB (gzip: 124KB)

### CDN 캐싱
- 정적 파일: 1년 캐시
- HTML: 30분 캐시
- 자동 최적화됨

## 트러블슈팅

### 배포가 안 될 때

**문제**: "Build failed"
```bash
# 로컬에서 확인
npm run build

# 타입 에러 확인
npm run type-check
```

**문제**: GitHub 연동 안 됨
- 계정 재인증: https://vercel.com/account/installations
- GitHub 권한 확인

### 배포 후 데이터 보이지 않을 때

1. **브라우저 캐시 삭제**
   - `Ctrl+Shift+Delete` (또는 `Cmd+Shift+Delete`)
   - "모든 시간" 선택 후 삭제

2. **Vercel 재배포**
   - Deployments → 최신 배포 우클릭 → Redeploy

## 커스텀 도메인 설정

### 도메인을 Vercel에서 구매
1. **Settings** → **Domains**
2. **Add Domain** 클릭
3. 사용할 도메인 입력
4. 1단계에서 구매 프로세스 진행

### 기존 도메인 연결
1. DNS 설정에서 Vercel 제공 레코드 추가
2. Vercel에 도메인 확인

> 자세한 내용: [Vercel 도메인 가이드](https://vercel.com/docs/concepts/projects/domains)

## 다음 단계

- ✅ 배포 완료
- ⬜ 커스텀 도메인 설정 (선택)
- ⬜ Supabase 동기화 설정 (선택)
- ⬜ Google Analytics 추가 (선택)

---

**배포 상태**: ✅ Ready  
**프레임워크**: Vite + React  
**호스팅**: Vercel (무료)
