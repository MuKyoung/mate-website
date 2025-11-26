# Mate 웹사이트 프로젝트 개요

## 📋 프로젝트 소개

**Mate**는 유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀의 포트폴리오 웹사이트입니다. Next.js 14와 TypeScript를 기반으로 제작된 현대적인 정적 웹사이트입니다.

---

## 🎯 주요 특징

### 1. **정적 사이트 생성 (SSG)**
- Next.js의 정적 사이트 생성 기능 활용
- 빠른 로딩 속도와 SEO 최적화
- Vercel, Netlify 등 다양한 플랫폼에 배포 가능

### 2. **반응형 디자인**
- 모바일, 태블릿, 데스크톱 모든 기기에서 완벽하게 작동
- Tailwind CSS를 활용한 유연한 레이아웃

### 3. **모던 UI/UX**
- Framer Motion을 활용한 부드러운 애니메이션
- 3D 기하학적 효과가 적용된 랜딩 페이지
- 직관적인 네비게이션

### 4. **SEO 최적화**
- 메타데이터 최적화
- 구조화된 데이터 준비
- 키워드: 유니티 외주 개발, 개발 강의, Unity 외주

---

## 📁 프로젝트 구조

```
DigitalCircusWebsite/
├── public/                    # 정적 파일
│   ├── images/               # 이미지 파일
│   │   ├── team/            # 팀원 프로필 이미지
│   │   └── projects/        # 프로젝트 이미지
│   ├── robots.txt           # 검색 엔진 크롤링 규칙
│   └── sitemap.xml          # 사이트맵
│
├── src/
│   ├── app/                  # Next.js App Router 페이지
│   │   ├── page.tsx         # 홈페이지 (랜딩 페이지)
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   ├── globals.css      # 글로벌 스타일
│   │   ├── services/        # 서비스 페이지
│   │   ├── team/            # 팀 역량 페이지
│   │   │   └── [id]/       # 팀원 개별 페이지 (검색 엔진 제외)
│   │   ├── projects/        # 프로젝트 포트폴리오 페이지
│   │   │   └── [slug]/     # 프로젝트 상세 페이지
│   │   ├── contact/         # 연락처 페이지
│   │   ├── robots.ts        # 동적 robots.txt 생성
│   │   └── sitemap.ts       # 동적 sitemap.xml 생성
│   │
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── Header.tsx       # 상단 네비게이션 바
│   │   ├── Footer.tsx       # 하단 푸터
│   │   ├── Hero.tsx         # 랜딩 페이지 Hero 섹션 (3D 효과)
│   │   ├── PageHeader.tsx   # 페이지 헤더 컴포넌트
│   │   ├── ServiceCard.tsx  # 서비스 카드
│   │   ├── TeamMemberCard.tsx # 팀원 카드 (현재 미사용)
│   │   ├── TeamCapabilityCard.tsx # 팀 역량 카드
│   │   ├── ProjectCard.tsx  # 프로젝트 카드
│   │   └── SafeImage.tsx   # 이미지 예외 처리 컴포넌트
│   │
│   ├── data/                 # 데이터 파일
│   │   ├── team.ts          # 팀원 데이터
│   │   ├── teamCapabilities.ts # 팀 역량 데이터
│   │   ├── projects.ts      # 프로젝트 데이터
│   │   └── services.ts      # 서비스 데이터
│   │
│   ├── types/                # TypeScript 타입 정의
│   │   └── index.ts         # TeamMember, Project, Service 인터페이스
│   │
│   └── utils/                # 유틸리티 함수
│       └── animations.ts    # Framer Motion 애니메이션 변형
│
├── next.config.js           # Next.js 설정 (정적 사이트 생성)
├── tailwind.config.ts       # Tailwind CSS 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 프로젝트 의존성
```

---

## 🎨 주요 페이지 구성

### 1. **홈페이지 (`/`)**
- **Hero 섹션**: 3D 기하학적 효과가 적용된 랜딩 섹션
  - 부유하는 원형 도형
  - 3D 회전 삼각형, 큐브, 육각형
  - 애니메이션 라인과 파티클
- **서비스 개요**: 4가지 주요 서비스 카드
- **주요 프로젝트**: 최근 프로젝트 3개 소개
- **팀 역량 통계**: 프로젝트 수, 경력, 성공률 등
- **CTA 섹션**: 문의하기 유도

### 2. **서비스 페이지 (`/services`)**
- 유니티 외주 개발
- 개발 강의
- 게임 서버 개발
- 컨설팅

각 서비스의 상세 기능과 특징 소개

### 3. **팀 역량 페이지 (`/team`)**
- **통계 섹션**: 완료 프로젝트, 경력, 팀원 수, 성공률
- **역량 카드**: 4가지 주요 역량 소개
  - 유니티 외주 개발
  - 클라이언트 개발
  - 서버 개발
  - 외주 개발
  - 개발 강의 (새로 추가)
- **왜 Mate 팀을 선택해야 할까요?**: 4가지 강점 소개

### 4. **프로젝트 포트폴리오 (`/projects`)**
- 모든 프로젝트를 그리드 레이아웃으로 표시
- 프로젝트 카드: 썸네일, 제목, 설명, 기술 스택, 링크

### 5. **프로젝트 상세 페이지 (`/projects/[slug]`)**
- 프로젝트 상세 정보
- 기술 스택
- 참여 팀원
- 프로젝트 이미지 갤러리
- 라이브 데모 및 GitHub 링크

### 6. **연락처 페이지 (`/contact`)**
- 문의 양식 (이름, 이메일, 제목, 메시지)
- 회사 연락처 정보
- 소셜 미디어 링크

---

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: React Icons

### 빌드 및 배포
- **정적 사이트 생성**: Next.js `output: 'export'`
- **배포 플랫폼**: Vercel (권장), Netlify, GitHub Pages
- **이미지 최적화**: Next.js Image 컴포넌트 (unoptimized 모드)

### 개발 도구
- **패키지 관리**: npm
- **타입 체크**: TypeScript
- **린팅**: ESLint
- **코드 포맷팅**: Prettier (선택)

---

## 🎯 핵심 기능

### 1. **3D 기하학적 효과 (Hero 섹션)**
- CSS 3D Transform 활용
- Framer Motion 애니메이션
- 부유하는 도형들
- 회전하는 3D 큐브, 삼각형, 육각형

### 2. **이미지 예외 처리**
- `SafeImage` 컴포넌트로 이미지 로딩 실패 시 플레이스홀더 표시
- 모든 이미지에 적용

### 3. **반응형 네비게이션**
- 데스크톱: 가로 메뉴
- 모바일: 햄버거 메뉴
- 스크롤 시 헤더 스타일 변경

### 4. **SEO 최적화**
- 각 페이지별 메타데이터
- 동적 sitemap.xml 생성
- robots.txt 설정
- 키워드 최적화

### 5. **타입 안정성**
- TypeScript로 모든 컴포넌트와 데이터 타입 정의
- 인터페이스 기반 데이터 구조

---

## 📊 데이터 구조

### 팀원 데이터 (`team.ts`)
```typescript
{
  id: string;
  name: string;
  role: string;
  bio: string;
  profileImage: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  email: string;
  projects: string[]; // 프로젝트 ID 배열
}
```

### 프로젝트 데이터 (`projects.ts`)
```typescript
{
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  images: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  teamMembers: string[]; // 팀원 ID 배열
  startDate: string;
  endDate?: string;
  category: string;
}
```

### 서비스 데이터 (`services.ts`)
```typescript
{
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}
```

### 팀 역량 데이터 (`teamCapabilities.ts`)
```typescript
{
  title: string;
  description: string;
  capabilities: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    skills: string[];
    experience: string;
    projects: number;
  }>;
  stats: {
    totalProjects: number;
    yearsExperience: number;
    teamMembers: number;
    successRate: number;
  };
}
```

---

## 🚀 배포 및 운영

### 빌드 명령어
```bash
npm run build    # 프로덕션 빌드
npm run dev      # 개발 서버 실행
```

### 배포 플랫폼
1. **Vercel** (권장)
   - GitHub 연동 시 자동 배포
   - 무료 SSL 인증서
   - 글로벌 CDN

2. **Netlify**
   - 드래그 앤 드롭 배포 가능
   - GitHub 연동 지원

3. **GitHub Pages**
   - GitHub Actions로 자동 배포
   - 완전 무료

### 커스텀 도메인
- Vercel/Netlify에서 도메인 연결 가능
- 자동 SSL 인증서 발급

---

## 📝 콘텐츠 관리

### 데이터 수정 방법
1. **팀원 정보**: `src/data/team.ts` 수정
2. **프로젝트 정보**: `src/data/projects.ts` 수정
3. **서비스 정보**: `src/data/services.ts` 수정
4. **팀 역량**: `src/data/teamCapabilities.ts` 수정

### 이미지 추가
- 팀원 프로필: `public/images/team/` 폴더
- 프로젝트 이미지: `public/images/projects/` 폴더
- 권장 해상도는 `IMAGE_GUIDE.md` 참고

---

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Purple (#667eea, #764ba2)
- **Background**: White / Gray-50
- **Text**: Gray-800, Gray-600

### 타이포그래피
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, Large
- **Body**: Regular, Medium

### 애니메이션
- Framer Motion 기반
- 부드러운 전환 효과
- 스크롤 기반 애니메이션

---

## 🔧 주요 설정 파일

### `next.config.js`
```javascript
{
  output: 'export',        // 정적 사이트 생성
  images: {
    unoptimized: true,     // 정적 사이트용
  },
  trailingSlash: true,     // URL 끝에 슬래시
}
```

### `tailwind.config.ts`
- 커스텀 컬러 변수
- 반응형 브레이크포인트
- 유틸리티 클래스 확장

---

## 📈 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용
- 적절한 해상도 사용
- 플레이스홀더 제공

### 코드 분할
- Next.js 자동 코드 분할
- 동적 임포트 활용

### 정적 생성
- 빌드 시 모든 페이지 생성
- 빠른 로딩 속도

---

## 🔍 SEO 전략

### 주요 키워드
- 유니티 외주 개발
- 개발 강의
- Unity 외주
- 유니티 강의
- 게임 개발 교육

### 메타데이터
- 각 페이지별 고유 title, description
- Open Graph 태그
- 키워드 최적화

### 구조화된 데이터
- 준비됨 (추가 구현 가능)
- Schema.org 마크업

---

## 📱 반응형 브레이크포인트

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🎯 향후 개선 가능 사항

1. **구조화된 데이터 추가** (Schema.org)
2. **블로그 섹션 추가**
3. **다국어 지원** (i18n)
4. **다크 모드** (next-themes 활용)
5. **폼 제출 기능** (Formspree, EmailJS 연동)
6. **Google Analytics 연동**
7. **댓글 시스템** (선택)

---

## 📞 문의 및 지원

- **이메일**: contact@mate.dev
- **GitHub**: [저장소 URL]
- **문서**: 프로젝트 내 `README.md`, `DEPLOYMENT_GUIDE.md` 참고

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

**Mate 팀** - 유니티 외주 개발과 개발 강의에 특화된 전문 팀

