import type { Metadata } from 'next';
import { domains } from '@/data/domains';
import { container, sectionPad } from '@/lib/styles';

export const metadata: Metadata = {
  title: 'Design System',
  description: 'MATE 디자인 시스템 · 컬러 · 타이포그래피 · 그리드 · 컴포넌트 토큰 레퍼런스.',
  robots: { index: false, follow: false },
};

/* ── 데이터 ─────────────────────────────────────────── */

type Swatch = { name: string; hex: string; note?: string };

const PRIMARY: Swatch[] = [
  { name: 'primary 100', hex: '#7BA3F5' },
  { name: 'primary 200', hex: '#4F7FE8', note: '메인 브랜드 · 액션' },
  { name: 'primary 300', hex: '#2F5ECC' },
  { name: 'primary 400', hex: '#1E3F93', note: 'CTA 밴드' },
  { name: 'primary 500', hex: '#172A54' },
  { name: 'primary 600', hex: '#121826' },
];

const GRAY: Swatch[] = [
  { name: 'gray 50', hex: '#FFFFFF' },
  { name: 'gray 100', hex: '#F5F7FA', note: '본문 텍스트' },
  { name: 'gray 200', hex: '#DDE3ED' },
  { name: 'gray 300', hex: '#B4BECE' },
  { name: 'gray 400', hex: '#8792A6' },
  { name: 'gray 500', hex: '#5A6478' },
  { name: 'gray 600', hex: '#0E1117', note: '캔버스 · 텍스트 블랙' },
];

const POINT: Swatch[] = [
  { name: 'point 100', hex: '#FFF3DB' },
  { name: 'point 200', hex: '#FFB020', note: '메인 포인트 컬러' },
  { name: 'point 300', hex: '#D18A0A' },
];

type TypeRow = {
  token: string;
  cls: string;
  sample: string;
  use: string;
  fw: number;
  fs: string;
  lh: string;
};

const TYPE: TypeRow[] = [
  { token: 'D1', cls: 'type-d1 font-en', sample: 'Display', use: '히어로 · CTA 스테이트먼트', fw: 800, fs: '40–144', lh: '0.98' },
  { token: 'D2', cls: 'type-d2 font-en', sample: 'Section', use: '섹션 대형 타이틀', fw: 800, fs: '36–76', lh: '1.04' },
  { token: 'H1', cls: 'type-h1', sample: '타이틀 및 제목', use: '페이지 제목', fw: 700, fs: '32–56', lh: '1.3' },
  { token: 'H2', cls: 'type-h2', sample: '보조타이틀 및 강조', use: '블록 제목', fw: 700, fs: '24–32', lh: '1.2' },
  { token: 'H3', cls: 'type-h3', sample: '보조타이틀 및 강조', use: '가벼운 블록 제목', fw: 500, fs: '24–32', lh: '1.2' },
  { token: 'B1', cls: 'type-b1', sample: '서브 타이틀', use: '카드 제목', fw: 700, fs: '18', lh: '1.5' },
  { token: 'B2', cls: 'type-b2', sample: '주요 콘텐츠 및 내용', use: '강조 본문', fw: 700, fs: '16', lh: '1.5' },
  { token: 'B3', cls: 'type-b3', sample: '보조 콘텐츠 및 내용', use: '기본 본문', fw: 500, fs: '16', lh: '1.5' },
  { token: 'B4', cls: 'type-b4', sample: '안내 문구 강조', use: '라벨 · 버튼', fw: 700, fs: '14', lh: '1.5' },
  { token: 'C1', cls: 'type-c1', sample: '주요 콘텐츠를 세부적으로 설명 (Caption)', use: '캡션', fw: 400, fs: '13', lh: '1.5' },
  { token: 'C2', cls: 'type-c2', sample: '제한적으로 사용 / 밀도 높은 UI', use: '메타 정보', fw: 400, fs: '12', lh: '1.5' },
];

const DOMAIN_SCALE: Record<string, Swatch[]> = {
  web: [
    { name: 'domain 100', hex: '#8FB4F8' },
    { name: 'domain 200', hex: '#4F7FE8', note: 'accent' },
    { name: 'domain 300', hex: '#2F5ECC' },
  ],
  game: [
    { name: 'domain 100', hex: '#A594FF' },
    { name: 'domain 200', hex: '#7C5CFF', note: 'accent' },
    { name: 'domain 300', hex: '#5B3AE0' },
  ],
  edu: [
    { name: 'domain 100', hex: '#FFD98A' },
    { name: 'domain 200', hex: '#FFB020', note: 'accent' },
    { name: 'domain 300', hex: '#D18A0A' },
  ],
};

/* ── 유틸 ───────────────────────────────────────────── */

/** #RRGGBB → "R G B" */
function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** 스와치 위 텍스트가 읽히도록 밝기로 대비 색을 고른다 */
function onColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const l = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l > 150 ? '#0E1117' : '#FFFFFF';
}

/* ── 조각 ───────────────────────────────────────────── */

function Block({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <section className={`${sectionPad} border-t border-white/10`}>
      <div className={container}>
        <p className="index-num font-en mb-12 sm:mb-16">{label}</p>
        {children}
      </div>
    </section>
  );
}

function SwatchGrid({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <div className="mb-14 last:mb-0">
      <p className="type-b4 text-white/55 mb-5 font-en uppercase tracking-[0.14em]">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-gutter">
        {items.map((s) => (
          <div key={s.name} className="rounded-card overflow-hidden border border-white/10">
            <div
              className="h-[120px] flex items-end p-4"
              style={{ background: s.hex, color: onColor(s.hex) }}>
              {s.note && <span className="type-c2 font-bold opacity-80">{s.note}</span>}
            </div>
            <div className="bg-[var(--surface)] px-4 py-3.5">
              <p className="type-b4 text-[var(--text-1)]">{s.name}</p>
              <p className="type-c2 text-white/55 font-en mt-1">{s.hex.toUpperCase()}</p>
              <p className="type-c2 text-white/50 font-en">RGB {rgb(s.hex)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 페이지 ─────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="pt-40 sm:pt-52">
      <div className={container}>
        <p className="index-num font-en mb-10">Design System</p>
        <h1
          className="type-d1 font-en text-[var(--text-1)] mb-8"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}>
          MATE DS
        </h1>
        <p className="caption-kr max-w-2xl">
          컬러 · 타이포그래피 · 그리드 · 컴포넌트를 하나의 토큰 체계로 관리합니다.
          모든 값의 단일 원천은 <span className="font-en text-[var(--point)]">globals.css :root</span> 입니다.
        </p>
      </div>

      {/* ── Grid System ── */}
      <Block num="01" label="Grid System">
        <div className="grid lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-5">
            <p className="type-h2 text-[var(--text-1)] mb-8">12 Columns</p>
            <dl className="divide-y divide-white/10 border-y border-white/10">
              {[
                ['기준 해상도', 'PC 1920px'],
                ['Inner', '1500px'],
                ['Gutter', '16px'],
                ['Columns', '12'],
                ['Breakpoint', 'sm 640 · md 768 · lg 1024 · xl 1280'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="type-b4 text-white/55">{k}</dt>
                  <dd className="type-b3 text-[var(--text-1)] font-en text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-7">
            <div className="grid-12 h-[240px] rounded-card border border-white/10 p-2">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-[var(--accent-tint)] rounded-sm" />
              ))}
            </div>
            <p className="type-c1 text-white/50 mt-4 font-en">
              grid-12 · gap var(--grid-gutter) · max-w-inner
            </p>
          </div>
        </div>
      </Block>

      {/* ── Color System ── */}
      <Block num="02" label="Color System">
        <SwatchGrid title="Primary · 딥 인디고 / 액션" items={PRIMARY} />
        <SwatchGrid title="Gray · 쿨 뉴트럴 / 표면·텍스트" items={GRAY} />
        <SwatchGrid title="Point · 클레이 / 강조·활성" items={POINT} />

        <div className="mt-16 grid sm:grid-cols-2 gap-gutter">
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b1 text-[var(--accent)] mb-3">Indigo = 액션</p>
            <p className="type-b3 text-white/55">
              버튼 호버 · 링크 · 포커스 링 · 인터랙티브 상태. 누를 수 있는 것에만 씁니다.
            </p>
          </div>
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b1 text-[var(--point)] mb-3">Amber = 강조</p>
            <p className="type-b3 text-white/55">
              섹션 인덱스 라벨 · 강조 단어 · 활성 표시. 한 화면에 한 번만 등장시킵니다.
            </p>
          </div>
        </div>
      </Block>

      {/* ── Typography ── */}
      <Block num="03" label="Typography">
        <p className="type-d2 font-en text-[var(--text-1)] mb-4">Pretendard</p>
        <p className="type-c1 text-white/55 mb-14 font-en">
          Letter spacing -0.3% · 국문 · 영문 모두 Pretendard
        </p>

        <div className="border-t border-white/10">
          {TYPE.map((t) => (
            <div
              key={t.token}
              className="grid grid-cols-1 lg:grid-cols-12 gap-x-gutter gap-y-3 items-baseline
                         py-8 border-b border-white/10">
              <p className="lg:col-span-1 type-c1 text-[var(--point)] font-en">{t.token}</p>
              <p className={`lg:col-span-6 text-[var(--text-1)] ${t.cls}`}>{t.sample}</p>
              <p className="lg:col-span-3 type-c1 text-white/55">{t.use}</p>
              <p className="lg:col-span-2 type-c2 text-white/50 font-en lg:text-right">
                FW {t.fw} · FS {t.fs} · LH {t.lh}
              </p>
            </div>
          ))}
        </div>
      </Block>

      {/* ── Domain Accents ── */}
      <Block num="04" label="Domain Accents">
        <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 mb-14">
          <p className="lg:col-span-7 type-h2 text-[var(--text-1)]">
            사업 도메인마다 액센트만 바뀝니다
          </p>
          <p className="lg:col-span-5 lg:self-end type-b3 text-white/50 leading-[1.85]">
            페이지 루트에 <span className="font-en text-[var(--text-1)]">data-domain</span> 을 걸면
            그 안의 토큰 소비자가 모두 따라옵니다. 구조·간격·타입은 그대로 두고 색만 바뀌므로
            세 도메인이 서로 달라 보이면서도 같은 시스템 안에 머뭅니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-gutter">
          {domains.map((d) => (
            <div key={d.key} data-domain={d.key}
              className="rounded-card border border-white/10 p-8">
              <p className="index-num font-en mb-6">{d.en}</p>
              <p className="type-c2 font-en text-white/50 mb-7">
                &lt;div data-domain=&quot;{d.key}&quot;&gt;
              </p>
              <div className="flex gap-2 mb-7">
                {DOMAIN_SCALE[d.key].map((sw) => (
                  <div key={sw.name} className="flex-1">
                    <div className="h-16 rounded-[6px] mb-2" style={{ background: sw.hex }} />
                    <p className="type-c2 text-white/55 font-en">{sw.hex.toUpperCase()}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center h-11 px-6 rounded-pill type-b4
                                 text-gray-50 bg-[var(--accent)]">
                  Action
                </span>
                <span className="type-b4 text-[var(--accent-strong)]">Link</span>
              </div>
            </div>
          ))}
        </div>

        {/* 라이트 서피스 */}
        <div className="mt-14 grid lg:grid-cols-12 gap-x-gutter gap-y-8 items-stretch">
          <div className="lg:col-span-5">
            <p className="type-h3 text-[var(--text-1)] mb-4">Light Surface</p>
            <p className="type-b3 text-white/50 leading-[1.85]">
              교육 도메인은 <span className="font-en text-[var(--text-1)]">data-surface=&quot;light&quot;</span> 로
              표면과 텍스트 토큰만 반전합니다. 액센트 사다리는 그대로여서 같은 시스템 안에 있고,
              헤더도 라이트 변형으로 함께 뒤집힙니다.
            </p>
          </div>
          <div data-domain="edu" data-surface="light"
            className="lg:col-span-7 rounded-card border border-[var(--border)] bg-[var(--canvas)] p-8">
            <p className="type-c1 font-en font-bold text-[var(--text-3)] uppercase tracking-[0.14em] mb-5">
              Preview
            </p>
            <p className="type-h3 text-[var(--text-1)] mb-3">현업에서 쓰는 것만 가르칩니다</p>
            <p className="type-b3 text-[var(--text-2)] leading-[1.8] mb-6">
              같은 토큰 이름, 반전된 값. 컴포넌트는 고칠 필요가 없습니다.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center h-11 px-6 rounded-pill type-b4
                               text-[var(--gray-600)] bg-[var(--accent)]">
                Action
              </span>
              <span className="type-b4 text-[var(--accent-strong)]">Link</span>
            </div>
          </div>
        </div>
      </Block>

      {/* ── Components ── */}
      <Block num="05" label="Components">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {/* Buttons */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">Buttons</p>
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center h-14 px-9 rounded-pill type-b3 font-bold text-canvas bg-gray-50">
                Primary
              </span>
              <span className="inline-flex items-center h-14 px-9 rounded-pill type-b3 font-bold text-gray-50 border border-white/20">
                Outline
              </span>
              <span className="inline-flex items-center h-14 px-9 rounded-pill type-b3 font-bold text-primary-600 bg-point-200">
                Point
              </span>
            </div>
          </div>

          {/* Surfaces */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">Surfaces</p>
            <div className="flex flex-col gap-3">
              {[
                ['canvas', 'var(--canvas)'],
                ['surface', 'var(--surface)'],
                ['surface-2', 'var(--surface-2)'],
              ].map(([n, v]) => (
                <div key={n} className="rounded-card border border-white/10 px-5 py-4" style={{ background: v }}>
                  <span className="type-b4 text-[var(--text-1)] font-en">{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text hierarchy */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">Text</p>
            <div className="flex flex-col gap-3">
              <p className="type-b3 text-[var(--text-1)]">text-1: 제목 · 본문</p>
              <p className="type-b3 text-[var(--text-2)]">text-2: 보조 설명</p>
              <p className="type-b3 text-[var(--text-3)]">text-3: 메타 정보</p>
              <p className="type-b3 text-[var(--text-faint)]">faint: 비활성</p>
            </div>
          </div>

          {/* Radius */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">Radius</p>
            <div className="flex items-end gap-4">
              {[['sm', 'rounded-[6px]', '6'], ['base', 'rounded-card', '10'], ['lg', 'rounded-[16px]', '16'], ['pill', 'rounded-pill', '∞']].map(
                ([n, cls, v]) => (
                  <div key={n} className="text-center">
                    <div className={`w-14 h-14 bg-[var(--surface-2)] border border-white/15 ${cls}`} />
                    <p className="type-c2 text-white/55 mt-2.5 font-en">{n} {v}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* States */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">States</p>
            <div className="flex flex-col gap-3">
              <p className="type-b3 border-l-2 border-[var(--success)] pl-4 text-[var(--success-on-dark)]">
                success: 전송 완료
              </p>
              <p className="type-b3 border-l-2 border-[var(--danger)] pl-4 text-[var(--danger-on-dark)]">
                danger: 오류 발생
              </p>
              <p className="type-b3 border-l-2 border-[var(--point)] pl-4 text-[var(--point)]">
                active: 현재 위치
              </p>
            </div>
          </div>

          {/* Hairline */}
          <div className="rounded-card border border-white/10 p-8">
            <p className="type-b4 text-white/55 mb-7 font-en uppercase tracking-[0.14em]">Hairline</p>
            <div className="flex flex-col gap-5">
              <div>
                <div className="h-px bg-white/10 mb-2" />
                <span className="type-c2 text-white/55 font-en">border · white 10%</span>
              </div>
              <div>
                <div className="h-px bg-white/[0.22] mb-2" />
                <span className="type-c2 text-white/55 font-en">border-2 · white 22%</span>
              </div>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}
