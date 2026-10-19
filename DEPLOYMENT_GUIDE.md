# Git 배포 가이드

이 가이드는 Mate 웹사이트를 Git을 통해 배포하는 방법을 설명합니다.

## 📋 배포 옵션

### 1. Vercel (추천) ⭐
- Next.js 개발사에서 제공하는 플랫폼
- 자동 배포, 무료 SSL, CDN
- GitHub 연동 시 자동 배포

### 2. Netlify
- 정적 사이트 배포에 최적화
- 무료 플랜 제공
- 드래그 앤 드롭 배포 가능

### 3. GitHub Pages
- 완전 무료
- GitHub 저장소와 통합
- 커스텀 도메인 지원

---

## 🚀 방법 1: Vercel 배포 (가장 쉬움)

### 1단계: Git 저장소 초기화

```bash
# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Mate 외주개발팀 웹사이트"
```

### 2단계: GitHub 저장소 생성 및 푸시

1. GitHub에서 새 저장소 생성 (예: `mate-website`)
2. 저장소 URL 복사

```bash
# 원격 저장소 추가 (YOUR_USERNAME과 REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/mate-website.git

# 브랜치 이름을 main으로 변경
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 3단계: Vercel 배포

1. [Vercel](https://vercel.com)에 가입/로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: 비워 둠 (기본값). 견적 문의 메일이 서버 함수(`/api/contact`)로 돌아 정적 내보내기(`out`)를 쓰지 않습니다.
5. "Deploy" 클릭

### 4단계: 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables 에 견적 문의 메일(Resend) 값을 넣습니다.
`RESEND_API_KEY`(필수), `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`. 자세한 내용은 README의 "견적 문의 폼 - Resend 메일 전송".

### 5단계: 자동 배포 확인

- `main` 브랜치에 푸시할 때마다 자동 배포
- Pull Request 생성 시 미리보기 배포

---

## 🌐 방법 2: Netlify 배포

### 1단계: Git 저장소 준비 (위와 동일)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/mate-website.git
git branch -M main
git push -u origin main
```

### 2단계: Netlify 배포

#### 옵션 A: GitHub 연동 (권장)

1. [Netlify](https://netlify.com)에 가입/로그인
2. "Add new site" → "Import an existing project"
3. GitHub 선택 및 저장소 연결
4. 빌드 설정:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
5. "Deploy site" 클릭

#### 옵션 B: 드래그 앤 드롭

1. 로컬에서 빌드: `npm run build`
2. Netlify 대시보드에서 `out` 폴더를 드래그 앤 드롭

---

## 📄 방법 3: GitHub Pages 배포

### 1단계: GitHub Actions 설정

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### 2단계: GitHub 저장소 설정

1. 저장소 Settings → Pages
2. Source: "GitHub Actions" 선택
3. 저장소에 푸시하면 자동 배포

---

## 🔧 공통 설정

### .gitignore 확인

다음 파일들이 제외되어 있는지 확인:
- `node_modules/`
- `.next/`
- `out/`
- `.env*.local`

### package.json 스크립트 확인

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🌍 커스텀 도메인 설정

### Vercel
1. 프로젝트 Settings → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 설정

### Netlify
1. Site settings → Domain management
2. "Add custom domain"
3. DNS 설정 안내에 따라 설정

### GitHub Pages
1. 저장소 Settings → Pages
2. Custom domain 입력
3. DNS 설정 (CNAME 레코드)

---

## 📝 배포 체크리스트

- [ ] Git 저장소 초기화 및 첫 커밋
- [ ] GitHub 저장소 생성 및 푸시
- [ ] 배포 플랫폼 선택 (Vercel/Netlify/GitHub Pages)
- [ ] 빌드 설정 확인 (`out` 디렉토리)
- [ ] 환경 변수 설정 (필요시)
- [ ] 커스텀 도메인 설정 (선택)
- [ ] 배포 후 사이트 테스트
- [ ] 모든 페이지 동작 확인
- [ ] 모바일 반응형 확인

---

## 🔄 업데이트 배포

코드를 수정한 후:

```bash
# 변경사항 추가
git add .

# 커밋
git commit -m "업데이트 내용 설명"

# GitHub에 푸시 (자동 배포)
git push origin main
```

---

## 🐛 문제 해결

### 빌드 실패
- 로컬에서 `npm run build` 실행하여 오류 확인
- `package.json`의 의존성 확인
- 빌드 로그 확인

### 이미지가 표시되지 않음
- `public/images/` 폴더의 이미지 파일 확인
- 이미지 경로가 올바른지 확인

### 404 오류
- `next.config.js`의 `trailingSlash: true` 설정 확인
- 라우트 경로 확인

---

## 📞 추가 도움말

- [Vercel 문서](https://vercel.com/docs)
- [Netlify 문서](https://docs.netlify.com)
- [GitHub Pages 문서](https://docs.github.com/pages)

