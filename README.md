# Mate - 외주개발팀 웹사이트

Next.js와 Cursor AI를 활용하여 개발한 유니티 게임 개발 외주개발팀 포트폴리오 웹사이트입니다.

## 🚀 주요 기능

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 완벽하게 작동
- **모던 UI/UX**: Framer Motion을 활용한 부드러운 애니메이션
- **SEO 최적화**: 메타데이터 및 sitemap.xml 포함
- **정적 사이트 생성**: 빠른 로딩 속도와 쉬운 배포
- **TypeScript**: 타입 안정성 보장
- **Tailwind CSS**: 빠르고 유연한 스타일링

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 홈페이지
│   ├── services/          # 서비스 페이지
│   ├── team/              # 팀 페이지
│   │   └── [id]/         # 개별 팀원 페이지
│   ├── projects/          # 프로젝트 페이지
│   │   └── [slug]/       # 개별 프로젝트 페이지
│   ├── contact/           # 연락처 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 글로벌 스타일
├── components/            # 재사용 가능한 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ServiceCard.tsx
│   ├── TeamMemberCard.tsx
│   └── ProjectCard.tsx
├── data/                  # 데이터 파일
│   ├── team.ts
│   ├── projects.ts
│   └── services.ts
├── types/                 # TypeScript 타입 정의
│   └── index.ts
└── utils/                 # 유틸리티 함수
    └── animations.ts
```

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: React Icons
- **Analytics**: Vercel Analytics

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 정적 파일은 `out/` 디렉토리에 생성됩니다.

### 4. 프로덕션 서버 실행 (로컬 테스트)

```bash
npx serve@latest out
```

## 🎨 커스터마이징

### 데이터 수정

- **팀원 정보**: `src/data/team.ts` 수정
- **프로젝트 정보**: `src/data/projects.ts` 수정
- **서비스 정보**: `src/data/services.ts` 수정

### 스타일 수정

- **글로벌 스타일**: `src/app/globals.css` 수정
- **컬러 팔레트**: `tailwind.config.ts`에서 커스터마이징
- **컴포넌트 스타일**: 각 컴포넌트 파일에서 Tailwind CSS 클래스 수정

### 메타데이터 수정

각 페이지의 `metadata` export를 수정하여 SEO 정보를 업데이트할 수 있습니다.

## 📝 배포

### Vercel (추천)

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택
5. 자동 배포 완료

### 다른 플랫폼

- **Netlify**: `out/` 폴더를 드래그 앤 드롭
- **GitHub Pages**: Settings > Pages에서 설정
- **AWS S3**: S3 버킷에 `out/` 폴더 업로드

## 🔧 환경 변수

현재 프로젝트는 정적 사이트로 구성되어 있어 환경 변수가 필요하지 않습니다.

폼 제출 기능을 추가하려면 다음 서비스 중 하나를 사용하세요:
- [Formspree](https://formspree.io/)
- [EmailJS](https://www.emailjs.com/)
- [Netlify Forms](https://docs.netlify.com/forms/setup/)

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

---

**Mate** - 유니티 게임 개발 외주개발팀
