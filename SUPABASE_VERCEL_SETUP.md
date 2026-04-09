# Supabase + Vercel 배포 가이드

## 🗄️ Supabase 설정 (데이터베이스)

### 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속
2. **New Project** 클릭
3. 프로젝트 이름: `bootcamp-dashboard`
4. 지역 선택: `Southeast Asia (Singapore)` 권장
5. **Create new project** 클릭 (약 2-3분 소요)

### 2단계: 데이터베이스 테이블 생성

#### SQL Editor에서 다음 쿼리 실행:

```sql
-- Universities 테이블 생성
CREATE TABLE public.universities (
  school_id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  partner_company TEXT,
  region TEXT NOT NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  amount_sum BIGINT DEFAULT 0,
  status TEXT CHECK (status IN ('NEW', 'EXISTING')),
  proposal_range TEXT,
  industry TEXT,
  proposal_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_universities_school_name ON public.universities(school_name);
CREATE INDEX idx_universities_industry ON public.universities(industry);
CREATE INDEX idx_universities_status ON public.universities(status);
CREATE INDEX idx_universities_region ON public.universities(region);

-- RLS (Row Level Security) 비활성화 (공개 읽기)
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.universities
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.universities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.universities
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.universities
  FOR DELETE USING (true);
```

### 3단계: 초기 데이터 입력

SQL Editor에서 다음 쿼리로 샘플 데이터 추가:

```sql
INSERT INTO public.universities VALUES
  ('N26-01', '계명대학교', '모두의연구소', '대경권', '대구 달서구', 35.8531, 128.4871, 291500000, 'NEW', 'LMS 운영 기반 부트캠프', '인공지능', ARRAY['교육LMS'], '연구책임자: 박은수', NOW(), NOW()),
  ('N26-02', '한국외국어대학교', '모두의연구소', '서울', '서울 동대문구', 37.5973, 127.0578, 98000000, 'NEW', '100% 오프라인 교육 과정', '인공지능', ARRAY['세미나'], '연구책임자: 권지선', NOW(), NOW()),
  ('N26-03', '한양대(ERICA)', '모두의연구소', '경기/인천', '경기 안산시', 37.2985, 126.8348, 356950000, 'NEW', 'LMS + 오프라인 하이브리드', '인공지능', ARRAY['교육LMS','세미나'], '연구책임자: 권지선', NOW(), NOW());
```

### 4단계: API 키 확인

1. Supabase 대시보드 → **Settings** → **API**
2. 다음 정보 복사:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** (VITE_SUPABASE_ANON_KEY)

---

## 🚀 Vercel 배포

### 1단계: Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에서 **Sign Up with GitHub** 클릭
2. GitHub 계정 연동
3. **Add GitHub Org or account** → 저장소 선택

### 2단계: Git에 푸시

```bash
cd "c:\프로젝트관리\전국-대학교-부트캠프-입찰-현황-대시보드"

# GitHub에 첫 업로드
git init
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Supabase + Vercel 연동 준비"
git remote add origin https://github.com/your-username/bootcamp-dashboard.git
git branch -M main
git push -u origin main
```

### 3단계: Vercel에서 배포 설정

1. [Vercel Dashboard](https://vercel.com/dashboard)로 이동
2. **Add New...** → **Project** 클릭
3. GitHub 저장소 선택
4. **Import** 클릭

### 4단계: 환경 변수 설정

1. Project Settings → **Environment Variables**
2. 다음 변수 추가:

| 변수명 | 값 |
|--------|-----|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

3. **Save** 클릭

### 5단계: 배포 완료

1. Vercel이 자동으로 빌드 시작
2. 배포 완료 후 URL 제공
3. 예: `https://bootcamp-dashboard.vercel.app`

---

## 🧪 로컬 테스트

### 환경 변수 설정

`.env.local` 파일 수정:

```env
VITE_SUPABASE_URL=https://[프로젝트명].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 로컬 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

---

## 📝 Supabase 테이블 스키마

### universities 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `school_id` | TEXT | 고유 ID (PK) |
| `school_name` | TEXT | 학교명 |
| `partner_company` | TEXT | 협력 기업 |
| `region` | TEXT | 권역 |
| `address` | TEXT | 주소 |
| `lat` | NUMERIC | 위도 |
| `lng` | NUMERIC | 경도 |
| `amount_sum` | BIGINT | 견적 금액 |
| `status` | TEXT | 상태 (NEW/EXISTING) |
| `proposal_range` | TEXT | 운영 기준 |
| `industry` | TEXT | 산업군 |
| `proposal_types` | TEXT[] | 제안 유형 배열 |
| `contact_info` | TEXT | 연락처 정보 |
| `created_at` | TIMESTAMP | 생성 시간 |
| `updated_at` | TIMESTAMP | 수정 시간 |

---

## 🔒 보안 주의사항

⚠️ **프로덕션 환경에서:**

1. **RLS (Row Level Security) 설정**: 필요한 역할에만 접근 권한 할당
2. **API Key 관리**: 공개 키(anon key)만 프론트엔드에 사용
3. **CORS 설정**: 신뢰할 수 있는 도메인만 허용
4. **데이터 검증**: 서버 사이드에서 모든 입력값 검증

---

## 🐛 문제 해결

### "Supabase URL을 찾을 수 없음" 오류

→ `.env.local` 파일 확인, 환경 변수 올바르게 입력

### 데이터가 저장되지 않음

→ Supabase 테이블 생성 확인, 권한(RLS) 설정 확인

### Vercel 배포 실패

→ 빌드 로그 확인: `npm run build` 로컬에서 테스트

---

## 📱 리얼타임 동기화 (선택)

만약 여러  사용자가 동시에 데이터를 수정하는 경우, Supabase의 실시간 기능을 활용할 수 있습니다.

`supabase.ts`의 `subscribeToChanges` 함수 사용:

```typescript
import { subscribeToChanges } from './supabase';

useEffect(() => {
  const subscription = subscribeToChanges((data) => {
    setData(data);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

**더 많은 도움이 필요하신가요?**
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)
