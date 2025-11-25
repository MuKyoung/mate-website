# SEO 최적화 가이드

## 현재 적용된 SEO 최적화

### 1. 메타데이터 최적화
- 모든 페이지에 `title`, `description`, `keywords` 추가
- Open Graph 태그 설정
- 주요 키워드: **외주개발**, **유니티**, **Unity**, **게임 개발**, **AR/VR**

### 2. 구조화된 데이터 (Schema.org)
현재는 적용되지 않았지만, 추가하면 검색 엔진 최적화에 도움이 됩니다.

### 3. robots.txt 및 sitemap.xml
- `src/app/robots.ts` - 검색 엔진 크롤링 규칙
- `src/app/sitemap.ts` - 사이트맵 자동 생성

## 추가 SEO 최적화 방법

### 1. 구조화된 데이터 추가 (권장)

`src/app/layout.tsx`에 JSON-LD 스키마를 추가하세요:

```tsx
// layout.tsx에 추가
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mate",
  "description": "유니티 게임 개발 외주개발팀",
  "url": "https://mate.dev",
  "logo": "https://mate.dev/logo.png",
  "sameAs": [
    "https://github.com/mate",
    "https://linkedin.com/company/mate"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+82-2-1234-5678",
    "contactType": "customer service",
    "email": "contact@mate.dev"
  }
};

// body 태그 안에 추가
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

### 2. 페이지별 구조화된 데이터

각 페이지에 적절한 스키마를 추가하세요:

**서비스 페이지** - Service 스키마
**프로젝트 페이지** - CreativeWork 스키마
**연락처 페이지** - ContactPage 스키마

### 3. 이미지 최적화

- 모든 이미지에 `alt` 텍스트 추가 (이미 적용됨)
- 이미지 파일명을 키워드 포함하도록 변경:
  - `unity-game-development.jpg`
  - `outsourcing-team.jpg`
  - `ar-vr-development.jpg`

### 4. 내부 링크 최적화

- 관련 페이지 간 내부 링크 추가
- 링크 텍스트에 키워드 포함 (예: "유니티 게임 개발 서비스")

### 5. 콘텐츠 최적화

- 각 페이지에 300-500자 이상의 고품질 콘텐츠 추가
- 키워드를 자연스럽게 포함
- H1, H2 태그에 키워드 포함

### 6. 외부 링크 구축

- 관련 게임 개발 커뮤니티에 프로필 등록
- 게임 개발 블로그에 게스트 포스팅
- 소셜 미디어 프로필 최적화

### 7. 로컬 SEO (한국 시장)

- Google My Business 등록
- 네이버 비즈니스 등록
- 한국어 키워드 최적화

### 8. 성능 최적화

- 이미지 최적화 (WebP 포맷 사용)
- 코드 분할
- 캐싱 전략

### 9. 모바일 최적화

- 반응형 디자인 (이미 적용됨)
- 모바일 페이지 속도 최적화

### 10. 분석 도구 설정

- Google Search Console 등록
- Google Analytics 설정
- 네이버 서치어드바이저 등록

## 키워드 전략

### 주요 키워드
- **외주개발** (높은 검색량)
- **유니티 개발** (중간 검색량)
- **Unity 외주** (낮은 검색량, 높은 의도)
- **게임 개발 외주** (중간 검색량)
- **AR/VR 개발** (중간 검색량)

### 롱테일 키워드
- "유니티 게임 개발 외주"
- "Unity 2D 게임 개발"
- "게임 서버 개발 외주"
- "AR/VR 콘텐츠 개발"

## 모니터링

1. **Google Search Console**
   - 검색 성과 모니터링
   - 키워드 순위 추적
   - 클릭률(CTR) 개선

2. **Google Analytics**
   - 트래픽 분석
   - 사용자 행동 분석
   - 전환 추적

3. **키워드 순위 도구**
   - SEMrush
   - Ahrefs
   - 네이버 키워드 도구

## 주기적 업데이트

- 월 1회 콘텐츠 업데이트
- 분기별 SEO 성과 검토
- 연 1회 전체 SEO 감사

