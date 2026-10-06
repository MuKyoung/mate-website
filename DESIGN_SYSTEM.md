# MATE Design System

라이브 레퍼런스: **`/design-system`** (noindex · 네비게이션 미노출)

단일 원천은 **`src/app/globals.css` 의 `:root`** 입니다.
여기 값만 바꾸면 Tailwind 클래스(`tailwind.config.ts`)와 소재 클래스(`src/lib/styles.ts`)가 함께 따라옵니다.

---

## 1. Color System

숫자가 커질수록 어두워지는 사다리 구조입니다.

### primary — 딥 인디고 · 액션

| 토큰 | HEX | 용도 |
| --- | --- | --- |
| `--primary-100` | `#7BA3F5` | 다크 위 호버 |
| `--primary-200` | `#4F7FE8` | **메인 브랜드 · 액션** |
| `--primary-300` | `#2F5ECC` | 프레스 |
| `--primary-400` | `#1E3F93` | CTA 밴드 |
| `--primary-500` | `#172A54` | 딥 배경 |
| `--primary-600` | `#121826` | 최심부 |

### gray — 쿨 뉴트럴 · 표면/텍스트

| 토큰 | HEX | 용도 |
| --- | --- | --- |
| `--gray-50` | `#FFFFFF` | 버튼 면 |
| `--gray-100` | `#F5F7FA` | **본문 텍스트 (`--text-1`)** |
| `--gray-200` | `#DDE3ED` | |
| `--gray-300` | `#B4BECE` | |
| `--gray-400` | `#8792A6` | |
| `--gray-500` | `#5A6478` | |
| `--gray-600` | `#0E1117` | **캔버스 · 텍스트 블랙** |

### point — 앰버 · 강조/활성

| 토큰 | HEX | 용도 |
| --- | --- | --- |
| `--point-100` | `#FFF3DB` | 틴트 |
| `--point-200` | `#FFB020` | **메인 포인트 컬러** |
| `--point-300` | `#D18A0A` | 프레스 |

### 역할 분담 (이 규칙을 깨지 않습니다)

- **indigo = 액션** — 버튼 호버, 링크, 포커스 링, 인터랙티브 상태. 누를 수 있는 것에만.
- **amber = 강조** — 섹션 인덱스 라벨(`(01) Services`), 강조 단어, 활성 표시. 한 화면에 한 번만.

### 도메인 액센트 (사업 영역별)

페이지 루트에 `data-domain` 을 걸면 그 안의 토큰 소비자가 모두 따라옵니다.
구조·간격·타입은 그대로 두고 색만 바뀌므로 세 도메인이 서로 달라 보이면서도 같은 시스템 안에 머뭅니다.

| 스코프 | 라우트 | domain 100 / 200 / 300 | 성격 |
| --- | --- | --- | --- |
| `[data-domain="web"]` | `/web` | `#8FB4F8` · `#4F7FE8` · `#2F5ECC` | 인디고 — 정밀 · 구조 |
| `[data-domain="game"]` | `/game` | `#A594FF` · `#7C5CFF` · `#5B3AE0` | 바이올렛 — 몰입 · 시네마틱 |
| `[data-domain="edu"]` | `/education` | `#FFD98A` · `#FFB020` · `#D18A0A` | 앰버 — 온기 · 가독 |

각 스코프는 `--accent` / `--accent-strong` / `--accent-tint` 를 domain 사다리로 덮어씁니다.
게임 도메인은 `--point` 까지 바이올렛으로 몰아 단색으로 가고, 교육 도메인은 문서형 레이아웃이라
`--point` 를 중립(`gray 400`)으로 물립니다.

### 라이트 서피스

`[data-surface="light"]` 는 표면·텍스트 토큰만 반전합니다. 액센트 사다리는 건드리지 않으므로
컴포넌트를 고칠 필요가 없습니다. 교육 도메인 본문이 이 스코프를 씁니다.

`--canvas`→gray 50 · `--surface`→gray 100 · `--text-1`→gray 600 ·
`--border`→`rgba(14,17,23,.10)` · `--accent-strong`→domain 300 (밝은 배경에서는 호버가 어두운 쪽으로)

헤더도 짝을 이룹니다 — `Header.tsx` 의 `LIGHT_ROUTES` 에 든 라우트에서는 로고·네비·CTA가
라이트 변형으로 뒤집힙니다 (Figma DS의 `header` dark/light 컴포넌트 세트와 대응).

### 시맨틱 별칭

`--canvas` `--surface` `--surface-2` · `--text-1~3` `--text-faint` ·
`--border`(white 10%) `--border-2`(white 22%) ·
`--accent`(=primary 200) `--accent-strong`(=primary 100) `--accent-tint` ·
`--point`(=point 200) `--point-tint` ·
`--success` `--danger` (+ 다크 배경용 `--success-on-dark` `--danger-on-dark`)

---

## 2. Typography

Pretendard · letter-spacing **-0.3%** 고정. D1·D2는 MATE 전용 에디토리얼 디스플레이 티어입니다.

| 토큰 | 클래스 | FW | FS | LH | 용도 |
| --- | --- | --- | --- | --- | --- |
| D1 | `.type-d1` | 800 | clamp 40–144 | 0.98 | 히어로 · CTA 스테이트먼트 |
| D2 | `.type-d2` | 800 | clamp 36–76 | 1.04 | 섹션 대형 타이틀 |
| H1 | `.type-h1` | 700 | clamp 32–56 | 1.3 | 페이지 제목 |
| H2 | `.type-h2` | 700 | clamp 24–32 | 1.2 | 블록 제목 |
| H3 | `.type-h3` | 500 | clamp 24–32 | 1.2 | 가벼운 블록 제목 |
| B1 | `.type-b1` | 700 | 18 | 1.5 | 카드 제목 |
| B2 | `.type-b2` | 700 | 16 | 1.5 | 강조 본문 |
| B3 | `.type-b3` | 500 | 16 | 1.5 | 기본 본문 |
| B4 | `.type-b4` | 700 | 14 | 1.5 | 라벨 · 버튼 |
| C1 | `.type-c1` | 400 | 13 | 1.5 | 캡션 |
| C2 | `.type-c2` | 400 | 12 | 1.5 | 메타 정보 |

Tailwind 쪽에도 같은 스케일이 `text-d1` … `text-c2` 로 열려 있습니다.

---

## 3. Grid System

PC **1920px** 기준 · Inner **1500px** · **12 columns** · Gutter **16px**

- `.grid-12` — 12칼럼 그리드 (gap = `--grid-gutter`)
- `.inner` / `max-w-inner` — 1500px 중앙 정렬
- `container` (Tailwind) — center · padding 16/24/40 · 2xl 1500px
- `gap-gutter` — 16px

---

## 4. Shape

`--radius-sm` 6px · `--radius` 10px (`rounded` / `rounded-card`) · `--radius-lg` 16px · `rounded-pill`

---

## 5. 소재 클래스 (`src/lib/styles.ts`)

`btnPrimary`(화이트 필 → 호버 인디고) · `btnOutline` · `btnPoint`(앰버) ·
`linkUnderline` · `linkMore` · `arrowHover` ·
`sectionPad` / `sectionPadLg` / `container` / `clipWrap` / `hairlineCell()`

---

## 스크롤 리빌 주의

닫힌 클립(`clip-path: inset(100% 0 0 0)`)은 면적이 0이라 IntersectionObserver가 교차를 보고하지
않습니다. 그래서 **클립된 요소에 `whileInView`를 직접 걸면 리빌이 영영 발화하지 않습니다.**
반드시 클립되지 않은 바깥 요소를 관측하고, 클립은 `variants` 상속으로 자식에게 내려보내세요.
(`ProjectCard.tsx`, `ParallaxImage.tsx` 가 이 패턴입니다.)

## 바꾸는 법

색을 바꾸려면 `globals.css` 의 `--primary-*` / `--gray-*` / `--point-*` 만 수정하면 됩니다.
컴포넌트에는 리터럴 헥스를 새로 넣지 마세요 — 외부 브랜드 컬러(카카오 `#FEE500`, 유튜브 `#FF0000`)만 예외입니다.
