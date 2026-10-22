import type { Metadata } from 'next';
import { FiArrowUpRight } from 'react-icons/fi';
import { arrowTile, btnLight, btnLine, btnPoint, chip, chipLine, container, radiusCard } from '@/lib/styles';

export const metadata: Metadata = {
  title: 'Design System',
  description: 'MATE 디자인 시스템 · 컬러 · 타이포그래피 · 그리드 · 컴포넌트 토큰 레퍼런스.',
  robots: { index: false, follow: false },
};

/* ── 데이터 ─────────────────────────────────────────────
   색은 Figma 「(주)세종호이스트크레인 웹사이트 리뉴얼」 사다리에서 주요 색만 로고 파랑으로 바꿨고,
   글꼴과 모양은 그 사이트와 같아 보이지 않게 MATE 것을 쓴다.
   값은 globals.css :root 와 같아야 한다. */

type Swatch = { name: string; hex: string; note?: string };

const POINT: Swatch[] = [
  { name: 'point 100', hex: '#ECEFFE', note: '옅은 면' },
  { name: 'point 200', hex: '#2644CB', note: '로고 색 · 메인 포인트' },
  { name: 'point 300', hex: '#1E369E', note: '누름 · 호버' },
  { name: 'point on dark', hex: '#7D95FF', note: '남색 위 글자' },
];

const PRIMARY: Swatch[] = [
  { name: 'primary 100', hex: '#3D497F' },
  { name: 'primary 200', hex: '#2C386D' },
  { name: 'primary 300', hex: '#202A55' },
  { name: 'primary 400', hex: '#161D3C', note: '텍스트 블랙' },
  { name: 'primary 500', hex: '#242A42' },
  { name: 'primary 600', hex: '#22263A' },
];

const GRAY: Swatch[] = [
  { name: 'gray 100', hex: '#F6F7F9' },
  { name: 'gray 200', hex: '#D7DCE4' },
  { name: 'gray 300', hex: '#B9C0D0' },
  { name: 'gray 400', hex: '#9AA5BC' },
  { name: 'gray 500', hex: '#7B8AA7' },
  { name: 'gray 600', hex: '#333333' },
  { name: 'night', hex: '#070B1D', note: '어두운 면' },
];

const TYPE: { token: string; cls: string; sample: React.ReactNode; spec: string }[] = [
  { token: 'H1', cls: 'type-h1', sample: <>타이틀 및 <b>강조 낱말</b></>, spec: '56 · LH 1.2 · Medium, <b> 는 로고 파랑' },
  { token: 'H2', cls: 'type-h2', sample: '보조타이틀 및 강조', spec: '32 · LH 1.3 · SemiBold' },
  { token: 'H3', cls: 'type-h3', sample: '보조타이틀 및 강조', spec: '28 · LH 1.3 · Medium' },
  { token: 'B1', cls: 'type-b1', sample: '서브 타이틀', spec: '18 · LH 1.55 · SemiBold' },
  { token: 'B2', cls: 'type-b2', sample: '주요 콘텐츠 및 내용', spec: '16 · LH 1.55 · SemiBold' },
  { token: 'B3', cls: 'type-b3', sample: '보조 콘텐츠 및 내용', spec: '16 · LH 1.7 · Regular' },
  { token: 'B4', cls: 'type-b4', sample: '안내 문구 강조', spec: '14 · LH 1.5 · SemiBold' },
  { token: 'C1', cls: 'type-c1', sample: '주요 콘텐츠를 세부적으로 설명 (Caption)', spec: '13 · LH 1.5 · Regular' },
  { token: 'C2', cls: 'type-c2', sample: '제한적으로 사용 / 밀도 높은 UI', spec: '12 · LH 1.5 · Regular' },
  { token: 'Label', cls: 'eyebrow', sample: 'What we do:', spec: 'Geist Mono 12 · 대문자 · 쌍점' },
];

/** #RRGGBB → "R G B" */
function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** 스와치 위 글자가 읽히도록 밝기로 대비 색을 고른다 */
function onColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const l = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l > 150 ? '#161D3C' : '#FFFFFF';
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-20 sm:py-24">
      <div className={container}>
        <p className="eyebrow mb-10">{label}</p>
        {children}
      </div>
    </section>
  );
}

function SwatchGrid({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <div className="mb-12 last:mb-0">
      <p className="type-b2 mb-4 text-ink">{title}</p>
      <div className="grid grid-cols-2 gap-gutter sm:grid-cols-4 xl:grid-cols-7">
        {items.map((s) => (
          <div key={s.name} className={`overflow-hidden border border-line ${radiusCard}`}>
            <div className="flex h-[96px] items-end p-3" style={{ background: s.hex, color: onColor(s.hex) }}>
              {s.note && <span className="type-c2 font-bold">{s.note}</span>}
            </div>
            <div className="bg-white px-3 py-3">
              <p className="type-b4 text-ink">{s.name}</p>
              <p className="type-c2 mt-1 text-gray-500">{s.hex.toUpperCase()} · RGB {rgb(s.hex)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="pt-36 sm:pt-44">
      <div className={`${container} pb-16`}>
        <p className="eyebrow mb-5">Design system:</p>
        <h1 className="type-h1 text-ink"><b>MATE DS</b></h1>
        <p className="type-b3 mt-5 max-w-2xl text-ink-2">
          색은 고객사 사이트 리뉴얼 Figma 의 사다리에서 주요 색(포인트 · 남색)만 MATE 로고 파랑 #2644CB 기준으로 바꿨고,
          글꼴 · 칸 이름 · 모양은 MATE 것을 씁니다. 모든 값의 단일 원천은 globals.css :root 입니다.
        </p>
      </div>

      <Block label="Grid System">
        <dl className="grid max-w-xl border-t-2 border-ink">
          {[
            ['기준 해상도', 'PC 1920px'],
            ['Inner', '1500px'],
            ['Gutter', '16px'],
            ['Columns', '12'],
            ['모서리', '카드 · 이미지 10px (태블릿 · 모바일 8px), 버튼 · 칩 · 칸 6px'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="type-b4 text-gray-500">{k}</dt>
              <dd className="type-b3 text-right text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block label="Color System">
        <SwatchGrid title="Point · 로고 파랑" items={POINT} />
        <SwatchGrid title="Primary · 남색" items={PRIMARY} />
        <SwatchGrid title="Gray" items={GRAY} />
      </Block>

      <Block label="Typography · Pretendard · 라벨 Geist Mono">
        <div className="border-t-2 border-ink">
          {TYPE.map((t) => (
            <div key={t.token} className="grid items-baseline gap-3 border-b border-line py-6 lg:grid-cols-12">
              <p className="type-b4 text-point-200 lg:col-span-1">{t.token}</p>
              <p className={`text-ink lg:col-span-7 ${t.cls}`}>{t.sample}</p>
              <p className="type-c1 text-gray-500 lg:col-span-4 lg:text-right">{t.spec}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block label="Components">
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          <div className={`border border-line p-8 ${radiusCard}`}>
            <p className="type-b4 mb-6 text-gray-500">Buttons</p>
            <div className="flex flex-col items-start gap-3">
              <span className={btnPoint}>Button</span>
              <span className={`${btnLight} border border-line`}>Button</span>
              <span className={btnLine}>더보기 <span className="text-point-200">+00</span></span>
            </div>
          </div>
          <div className={`border border-line p-8 ${radiusCard}`}>
            <p className="type-b4 mb-6 text-gray-500">Chips · Arrow</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={chip}>웹 · 앱</span>
              <span className={chipLine}>게임 · XR</span>
              <span className={arrowTile}><FiArrowUpRight size={18} /></span>
            </div>
          </div>
          <div className={`border border-line p-8 ${radiusCard}`}>
            <p className="type-b4 mb-6 text-gray-500">Tabs</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex h-10 items-center rounded-[6px] border border-point-200 bg-point-200 px-4 text-[14px] font-semibold text-white">전체</span>
              <span className="inline-flex h-10 items-center rounded-[6px] border border-line px-4 text-[14px] text-ink-2">웹 · 앱</span>
              <span className="inline-flex h-10 items-center rounded-[6px] border border-line px-4 text-[14px] text-ink-2">교육</span>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}
