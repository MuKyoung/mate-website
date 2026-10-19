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

### 견적 문의 폼 - Resend 메일 전송

`/contact` 양식은 `src/app/api/contact/route.ts` 가 [Resend](https://resend.com)로 메일을 보냅니다.
문의한 사람의 주소가 reply-to 로 들어가 받은 메일에서 바로 답장할 수 있습니다.

1. Resend에서 API 키를 만들고, 보내는 주소로 쓸 도메인(예: `devteammate.co.kr`)을 인증합니다.
2. Vercel 프로젝트 설정 > Environment Variables 에 아래 값을 넣고 다시 배포합니다.

```
RESEND_API_KEY=re_...                                   # 필수
RESEND_FROM_EMAIL=MATE 문의 <inquiry@devteammate.co.kr>  # 인증한 도메인의 주소
CONTACT_TO_EMAIL=받을주소@example.com                    # 비우면 src/lib/styles.ts 의 CONTACT_EMAIL
```

- `RESEND_API_KEY` 가 없으면 양식은 내용이 채워진 메일 초안을 여는 방식으로 동작합니다.
- `RESEND_FROM_EMAIL` 을 비우면 Resend 시험 주소(`onboarding@resend.dev`)로 보내며, 이때는 Resend 계정 주인의 메일로만 도착합니다.
- 로컬에서 시험할 때는 같은 값을 `.env.local` 에 넣습니다.

## 📝 배포

### Vercel (추천)

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택
5. 자동 배포 완료

### 다른 플랫폼

견적 문의 메일이 서버 함수(`/api/contact`)로 돌기 때문에 정적 파일만 올리는 곳(GitHub Pages, S3 등)에서는 동작하지 않습니다. Next.js 서버를 돌릴 수 있는 곳(Vercel, Netlify 등)에 배포합니다.

## 🔧 환경 변수

견적 문의 메일 전송에만 씁니다. 위 [견적 문의 폼 - Resend 메일 전송](#견적-문의-폼---resend-메일-전송) 을 보세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

---

**Mate** - 유니티 게임 개발 외주개발팀
