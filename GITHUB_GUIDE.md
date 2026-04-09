# GitHub 업로드 가이드

## 📝 사전 준비

GitHub 계정이 없다면 [github.com](https://github.com)에서 가입하세요.

## 🚀 GitHub에 업로드하는 방법

### 1단계: GitHub에서 저장소 생성

1. GitHub 로그인 후 [새 저장소 생성](https://github.com/new)
2. 저장소명: `bootcamp-bidding-dashboard` (또는 원하는 이름)
3. 설명: `전국 대학교 부트캠프 입찰 현황 대시보드`
4. Public 선택 (공개 저장소) 또는 Private (비공개)
5. README, .gitignore는 **체크 해제** (이미 있음)
6. **Create repository** 클릭

### 2단계: 로컬 Git 설정

터미널을 열고 프로젝트 디렉토리에서 다음 명령 실행:

\`\`\`bash
# 터미널 열기
cd "c:\프로젝트관리\전국-대학교-부트캠프-입찰-현황-대시보드"
\`\`\`

#### 2-1) Git 초기화
\`\`\`bash
git init
\`\`\`

#### 2-2) 사용자 설정 (처음인 경우)
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

#### 2-3) 원본 파일 추가
\`\`\`bash
git add .
\`\`\`

#### 2-4) 커밋
\`\`\`bash
git commit -m "Initial commit: 부트캠프 입찰 현황 대시보드"
\`\`\`

### 3단계: GitHub 저장소에 푸시

GitHub에서 생성한 저장소 페이지에서 코드 복사 (HTTPS 또는 SSH)

#### HTTPS 방식 (권장)
\`\`\`bash
git remote add origin https://github.com/your-username/bootcamp-bidding-dashboard.git
git branch -M main
git push -u origin main
\`\`\`

#### SSH 방식 (SSH 키 설정해야 함)
\`\`\`bash
git remote add origin git@github.com:your-username/bootcamp-bidding-dashboard.git
git branch -M main
git push -u origin main
\`\`\`

### 4단계: 확인

GitHub 저장소 페이지에서 파일들이 정상 업로드되었는지 확인하세요.

## 🔧 package.json 업데이트 (필수)

현재 \`package.json\`의 repository 정보를 GitHub 저장소에 맞게 수정하세요:

\`\`\`json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/bootcamp-bidding-dashboard.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/bootcamp-bidding-dashboard/issues"
  },
  "homepage": "https://github.com/your-username/bootcamp-bidding-dashboard#readme"
}
\`\`\`

**your-username**을 실제 GitHub 사용자명으로 변경하세요.

## 📦 배포하기

### Vercel에 배포 (가장 쉬움)

1. [Vercel](https://vercel.com)에 접속
2. **Sign Up with GitHub** 클릭
3. GitHub 계정으로 연동
4. 저장소 import
5. **Deploy** 클릭

### Netlify에 배포

1. [Netlify](https://netlify.com)에 접속
2. **Sign up with GitHub** 클릭
3. 저장소 연결
4. Build command: \`npm run build\`
5. Publish directory: \`dist\`
6. Deploy 완료!

### 자신의 웹 호스팅에 배포

1. \`npm run build\` 실행
2. \`dist\` 폴더의 모든 파일을 웹 서버에 업로드

## 📚 유용한 Git 명령어

변경사항 커밋하기:
\`\`\`bash
git add .
git commit -m "설명: 변경 사항"
git push
\`\`\`

상태 확인:
\`\`\`bash
git status
git log
\`\`\`

## ❓ 문제 해결

### "fatal: not a git repository" 오류
\`\`\`bash
git init
\`\`\`

### HTTPS 비밀번호 대신 Token 사용
GitHub → Settings → Developer settings → Personal access tokens
생성된 token으로 로그인

### SSH 설정
\`\`\`bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
\`\`\`
생성된 공개키를 GitHub에 등록

## 🎉 완료!

프로젝트가 GitHub에 성공적으로 업로드되었습니다!

이제:
- ⭐ 프로젝트에 Star 받기
- 🤝 다른 사람들과 협업
- 📈 지속적으로 개선하기

---

## 관리자 기능 사용 가이드

### 데이터 입력
1. **데이터 관리** 버튼 클릭
2. 신규 입찰 또는 기존 참여 선택
3. 필드 입력:
   - 학교명
   - 협력 기업
   - 지역/산업
   - 견적 금액
   - 제안 유형 (교육LMS, 세미나)
   - 기타 정보

### 데이터 수정
1. **List** 뷰에서 대학 행의 수정 버튼 클릭
2. 필드 수정
3. **데이터베이스 업데이트** 클릭

### 필터링
- **Status**: 기존 참여 / 입찰 대상 / 전체
- **Industry**: 산업별 필터
- **View Mode**: 지도 / 리스트

모든 데이터는 자동으로 로컬 스토리지에 저장됩니다!
