import type { Metadata } from 'next';
import Image from 'next/image';
import { domains } from '@/data/domains';
import { Badge, Card, GroupLabel, Row, Section } from '@/components/home/kit';
import { btnOnBrand, btnOnBrandQuiet, btnOutline, btnPrimary, container } from '@/lib/styles';
import { Swatch, TypeRow } from './Live';

export const metadata: Metadata = {
  title: 'Brand Guide',
  description: 'MATE 브랜드 가이드 · 로고, 대표 색상, 말투, 글자, 모양, 움직임, 부품, 공유 이미지.',
  robots: { index: false, follow: false },
};

/**
 * MATE 브랜드 가이드.
 *
 * 색과 글자 크기의 숫자는 여기에 적지 않고 화면에서 읽어 보여 준다 (./Live).
 * 이 파일에 적는 것은 숫자가 아니라 규칙이다. 이 페이지 자체도 홈과 같은 조각으로 짓는다.
 */

/* ── 데이터 ─────────────────────────────────────────── */

/** 말투 - 사이트 문구를 쓸 때 지키는 것 */
const VOICE = [
  ['쓸모 없는 글은 싣지 않습니다', '읽는 사람이 고르거나, 움직이거나, 상황을 이해하는 데 도움이 되지 않는 문장은 뺍니다.'],
  ['한 일과 하는 일을 사실로 말합니다', '회사가 정하지 않은 약속이나 내력을 듣기 좋게 지어 넣지 않습니다.'],
  ['숫자는 데이터에서 가져옵니다', '납품 건수와 기간은 포트폴리오와 역량 데이터에서 계산합니다. 강의는 납품으로 세지 않습니다.'],
  ['두 사업을 나란히 씁니다', '자체 게임은 외주에서 나온 부산물이 아닙니다. SI와 퍼블리싱을 같은 무게로 적습니다.'],
  ['안 되는 것보다 되는 방법을 말합니다', '막다른 안내로 끝내지 않습니다. 다음에 할 수 있는 일을 함께 적습니다.'],
  ['국문 문장으로 말합니다', '영문 두 단어 슬로건을 붙이지 않습니다. 줄표를 쓰지 않고, 범위는 물결표(1~3개월)로 적습니다.'],
] as const;

const LOGO_RULES = [
  ['바탕에 따라 색을 고릅니다', '밝은 바탕에서는 원색(파랑) 그대로, 어두운 바탕과 파란 면에서는 흰색으로 씁니다.'],
  ['둘레를 비웁니다', '로고 둘레는 심볼의 원 지름만큼 비웁니다.'],
  ['너무 작게 쓰지 않습니다', '화면에서는 높이 20px 아래로 줄이지 않습니다.'],
  ['색을 바꾸지 않습니다', '파랑과 흰색 말고 다른 색으로 쓰지 않습니다.'],
  ['모양을 바꾸지 않습니다', '비율을 늘이거나 기울이지 않고, 그림자나 윤곽선을 입히지 않습니다.'],
  ['사진 위에 바로 올리지 않습니다', '복잡한 사진 위에서는 면을 깔고 올립니다.'],
] as const;

/** 색의 역할 - 값은 테마마다 다르고 역할은 같다 */
const ROLES = [
  { token: '--accent', name: '글자로 쓰는 파랑', note: '고른 탭 · 묶음 표시 · 링크' },
  { token: '--brand-fill', name: '면으로 쓰는 파랑', note: '강조 버튼 · 떠 있는 버튼' },
  { token: '--focus', name: '초점', note: '키보드 초점 · 입력창' },
];

const SURFACES = [
  { token: '--canvas', name: '바탕' },
  { token: '--surface', name: '카드' },
  { token: '--surface-2', name: '카드 안의 면' },
];

const BLUE = [
  { token: '--primary-100', name: 'blue 100' },
  { token: '--primary-200', name: 'blue 200' },
  { token: '--primary-300', name: 'blue 300' },
  { token: '--primary-400', name: 'MATE Blue', note: '로고 원색' },
  { token: '--primary-500', name: 'blue 500' },
  { token: '--primary-600', name: 'blue 600' },
];

/** 글자 크기 아홉 단계 + 첫 화면 문장 */
const TYPE = [
  { name: '첫 화면', cls: 'type-hero', sample: '멈추지 않게', use: '홈의 문장 하나' },
  { name: '40', cls: 'text-ext font-bold', sample: '일하는 방식', use: '큰 제목' },
  { name: '20', cls: 'text-dlg font-medium', sample: '카드의 제목', use: '카드 제목' },
  { name: '19', cls: 'text-ttl', sample: '상단 바의 제목', use: '상단 바' },
  { name: '18', cls: 'text-lst font-medium', sample: '목록의 주 문장', use: '목록' },
  { name: '17', cls: 'text-tbtn', sample: '글자 버튼', use: '글자 버튼' },
  { name: '16', cls: 'text-body', sample: '본문과 설명', use: '본문' },
  { name: '15', cls: 'text-btn font-medium', sample: '면이 있는 버튼', use: '버튼 · 메뉴' },
  { name: '14', cls: 'text-sub font-medium', sample: '묶음 이름', use: '묶음 이름 · 보조 값' },
  { name: '13', cls: 'text-min', sample: '가장 작은 글자', use: '이보다 작게 쓰지 않습니다' },
];

const RADII = [
  { px: '26', cls: 'rounded-block', use: '큰 면' },
  { px: '20', cls: 'rounded-thumb', use: '카드 · 중간 그림' },
  { px: '12', cls: 'rounded-chip', use: '작은 그림 · 꼬리표' },
  { px: '18', cls: 'rounded-btn', use: '버튼' },
];

/** 링크를 공유할 때 미리보기로 뜨는 이미지 (public/images/og). 1200×630 JPG. */
const SHARE = [
  { file: 'og-default.jpg', name: '기본', note: '홈과 공통 페이지' },
  { file: 'og-web.jpg', name: '웹 · 앱', note: '/web과 웹 · 앱 프로젝트' },
  { file: 'og-game.jpg', name: '게임 · XR', note: '/game과 게임 프로젝트' },
  { file: 'og-education.jpg', name: '교육', note: '/education과 강의' },
];

const pad = 'px-6 py-7 medium:px-7 medium:py-8';
const note = 'text-sub text-[var(--text-3)]';

/* ── 조각 ───────────────────────────────────────────── */

/** 한 테마의 면과 글자를 그 테마로 고정해 보여 준다 */
function ThemeSample({ scope, name }: { scope: 'theme-light' | 'theme-dark'; name: string }) {
  return (
    <div className={`${scope} rounded-thumb border border-[var(--border)] bg-[var(--canvas)] p-4 text-[var(--text-1)]`}>
      <p className="mb-3 text-sub font-medium">{name}</p>
      <div className="grid grid-cols-3 gap-2">
        {SURFACES.map((s) => <Swatch key={s.token} {...s} />)}
      </div>
      <div className="mt-3 rounded-chip bg-surface p-4">
        <p className="text-lst font-medium text-[var(--text-1)]">주 문장</p>
        <p className="mt-1 text-body text-[var(--text-2)]">보조 설명은 한 단 옅습니다.</p>
        <p className="mt-1 text-sub text-[var(--text-3)]">가장 옅은 글자도 4.5:1 을 넘깁니다.</p>
        <p className="mt-2 text-sub font-medium text-[var(--accent)]">글자로 쓰는 파랑</p>
      </div>
    </div>
  );
}

/* ── 페이지 ─────────────────────────────────────────── */

export default function BrandGuidePage() {
  return (
    <div>
      {/* 표지 - 가이드의 표지도 가이드를 따른다 */}
      <section className="pt-16">
        <div className={`${container} pt-3 medium:pt-4`}>
          <div className="on-brand -mx-3 rounded-block px-6 py-14 medium:mx-0 medium:px-11 medium:py-20">
            <p className="text-sub font-medium text-[var(--text-3)]">Brand Guide</p>
            <h1 className="type-hero mt-5">멈추지 않게 만듭니다</h1>
            <p className="mt-6 max-w-xl text-body text-[var(--text-2)]">
              MATE의 로고와 색, 말투, 화면을 짓는 규칙을 정해 둔 문서입니다.
              사이트와 소개서, 공유 이미지가 같은 얼굴을 하도록 이 기준을 따릅니다.
            </p>
          </div>
        </div>
      </section>

      <Section id="brand" title="브랜드" summary="SI 개발과 자체 퍼블리싱을 함께 하는 팀입니다. 맡은 것을 만들고, 저희 이름으로도 냅니다.">
        <Card>
          <ul>
            <Row main="멈추지 않게 만듭니다" sub="캐치프레이즈. 만드는 것과 돌아가게 하는 것은 다릅니다. 그래서 배포한 뒤까지 봅니다." />
            <Row main="개발 전문성" sub="웹 · 앱, 게임 · XR, 교육. 기획부터 배포까지 한 팀이 합니다." />
            <Row main="배포 안정성" sub="배포한 뒤에도 모니터링으로 안정성을 확인하고, 끝난 뒤의 유지보수를 맡습니다." />
          </ul>
        </Card>
        <GroupLabel>말투</GroupLabel>
        <Card>
          <ul>
            {VOICE.map(([rule, why]) => <Row key={rule} main={rule} sub={why} />)}
          </ul>
        </Card>
      </Section>

      <Section id="logo" title="로고" summary="심볼은 M 위에 원 두 개가 놓인 모양입니다. 심볼과 워드마크를 함께 쓰는 것이 기본이고, 자리가 좁으면 심볼만 씁니다.">
        <div className="-mx-3 grid gap-3 medium:mx-0 wide:grid-cols-3">
          {[
            { scope: 'theme-light', bg: 'bg-surface', name: '밝은 바탕', hint: '원색 그대로' },
            { scope: 'on-brand', bg: '', name: '파란 면', hint: '흰색' },
            { scope: 'theme-dark', bg: 'bg-[var(--canvas)]', name: '어두운 바탕', hint: '흰색' },
          ].map((p) => (
            <div key={p.name} className="overflow-hidden rounded-block bg-surface">
              <div className={`${p.scope} ${p.bg} flex h-[156px] items-center justify-center px-8`}>
                <Image src="/images/logo.png" alt="MATE" width={1991} height={493} className="logo-auto h-9 w-auto" />
              </div>
              <div className="px-6 py-4">
                <p className="text-sub font-medium text-[var(--text-1)]">{p.name}</p>
                <p className="text-min text-[var(--text-3)]">{p.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <Card>
          <ul>
            {LOGO_RULES.map(([rule, detail]) => <Row key={rule} main={rule} sub={detail} />)}
          </ul>
        </Card>
        <Card className={pad}>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-thumb bg-[var(--primary-400)]">
              <Image src="/images/logo-mark.png" alt="MATE 심볼" width={380} height={369} className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className={note}>
              앱 아이콘과 파비콘은 모서리가 둥근 파란 단색 면에 흰 심볼입니다. 심볼 폭이 전체의 3분의 2가 되게 둡니다.
            </p>
          </div>
        </Card>
      </Section>

      <Section id="color" title="색" summary="대표 색상은 하나, 로고의 파랑입니다. 색은 아껴 씁니다. 면은 단색으로 두고 번지는 빛이나 그라디언트를 깔지 않습니다.">
        <div className="-mx-3 grid grid-cols-2 gap-3 medium:mx-0 xl:grid-cols-4">
          <Swatch token="--primary-400" name="MATE Blue" note="대표 색상 · 로고에서 잰 값" />
          {ROLES.map((r) => <Swatch key={r.token} {...r} />)}
        </div>
        <Card className={pad}>
          <p className={note}>
            색은 쓰임으로 정합니다. 글자로 쓰는 파랑, 면으로 쓰는 파랑, 초점. 값은 테마에 따라 달라지고 쓰임은 그대로입니다.
            큰 파란 면은 테마와 상관없이 로고 원색이고 그 위 글자는 흰색입니다.
            색만으로 뜻을 전하지 않습니다. 고른 탭은 굵기와 밑줄로도, 상태는 글자로도 알립니다.
          </p>
        </Card>

        <GroupLabel>테마</GroupLabel>
        <div className="-mx-3 grid gap-3 medium:mx-0 wide:grid-cols-2">
          <ThemeSample scope="theme-light" name="밝은 화면" />
          <ThemeSample scope="theme-dark" name="어두운 화면" />
        </div>
        <Card className={pad}>
          <p className={note}>
            테마는 기기 설정을 따르고, 상단 바의 버튼으로 바꿀 수 있습니다. 화면은 두 테마 모두에서 확인한 뒤 내보냅니다.
            회색 단계는 참고한 가이드라인에 없어 저희가 정한 값입니다.
          </p>
        </Card>

        <GroupLabel>파랑의 단계</GroupLabel>
        <div className="-mx-3 grid grid-cols-3 gap-3 medium:mx-0 xl:grid-cols-6">
          {BLUE.map((s) => <Swatch key={s.token} {...s} />)}
        </div>

        <GroupLabel>영역 색</GroupLabel>
        <div className="-mx-3 grid gap-3 medium:mx-0">
          {domains.map((d) => (
            <div key={d.key} data-domain={d.key} className="rounded-block bg-surface p-4">
              <p className="mb-3 px-2 text-sub font-medium text-[var(--text-1)]">{d.kr}</p>
              <div className="grid grid-cols-3 gap-2">
                <Swatch token="--domain-100" name="100" />
                <Swatch token="--domain-200" name="200" />
                <Swatch token="--domain-300" name="300" />
              </div>
            </div>
          ))}
        </div>
        <Card className={pad}>
          <p className={note}>
            게임과 교육은 그 영역 페이지 안에서만 자기 색을 씁니다. 웹 · 앱은 대표 색상을 그대로 씁니다.
            홈과 공통 영역(상단 바, 문의)에는 영역 색이 나오지 않습니다.
          </p>
        </Card>
      </Section>

      <Section id="type" title="글자" summary="라틴과 숫자는 Roboto, 한글은 Pretendard입니다. 크기는 아홉 단계만 쓰고, 13px보다 작게 쓰지 않습니다.">
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {TYPE.map((t) => <TypeRow key={t.name} {...t} />)}
          </ul>
        </Card>
        <Card className={pad}>
          <p className={note}>
            40과 20 사이에는 단계가 없습니다. 참고한 가이드라인에도 비어 있어 중간 크기를 만들지 않았습니다.
            40보다 큰 글자는 홈 첫 화면의 문장 하나뿐이고, 이 크기와 행간, 굵기(700 · 500 · 400)는 저희가 정한 값입니다.
            글자는 200%까지 키워도 내용이 잘리지 않아야 합니다.
          </p>
        </Card>
      </Section>

      <Section id="shape" title="모양과 간격" summary="모서리는 네 가지만 씁니다. 면은 그림자가 아니라 밝기로 가릅니다.">
        <Card className={pad}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 wide:grid-cols-4">
            {RADII.map((r) => (
              <div key={r.px}>
                <div className={`h-20 bg-surface-2 ${r.cls}`} />
                <p className="mt-3 text-sub font-medium text-[var(--text-1)]">{r.px}px</p>
                <p className="text-min text-[var(--text-3)]">{r.use}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <ul>
            <Row main="좌우 여백 24px" sub="글과 누르는 것은 화면 가장자리에서 24px 이상 떨어집니다." />
            <Row main="누르는 것 사이 8px" sub="나란히 놓인 버튼과 탭은 8px 이상 띄웁니다." />
            <Row main="보는 곳과 다루는 곳" sub="제목과 요약은 위(넓은 화면에서는 왼쪽), 카드와 버튼은 아래(오른쪽)에 둡니다. 가장 중요한 동작은 맨 아래에 둡니다." />
            <Row main="두 단의 비율" sub="화면 폭 600px부터 두 단으로 놓습니다. 600~960px은 42:58, 그보다 넓으면 38:62입니다." />
            <Row main="메뉴의 자리" sub="좁은 화면에서는 엄지가 닿는 아래 탭, 840px부터는 상단 바입니다. 탭은 글자만 쓰고 다섯 개를 넘기지 않습니다." />
          </ul>
        </Card>
      </Section>

      <Section id="motion" title="움직임" summary="짧고 조용하게 움직입니다. 움직임은 꾸밈이 아니라 무슨 일이 일어났는지 알리는 데 씁니다.">
        <Card>
          <ul>
            <Row main="100~500ms" sub="알아챌 수 있을 만큼은 길게, 다음 동작을 가로막지 않을 만큼은 짧게." />
            <Row main="곡선 하나" sub="빠르게 붙고 천천히 멎습니다. cubic-bezier(0.22, 0.25, 0, 1)" />
            <Row main="멀리서 날아오지 않습니다" sub="요소는 제자리 가까이에서 나타납니다. 기울이거나 튕기지 않습니다." />
            <Row main="저절로 움직이면 멈출 수 있게" sub="5초 넘게 움직이는 것(첫 화면의 작업 벽)에는 멈춤 버튼을 둡니다. 움직임을 줄여 달라고 한 기기에서는 처음부터 서 있습니다." />
          </ul>
        </Card>
      </Section>

      <Section id="parts" title="부품" summary="버튼은 면이 있는 한 가지 모양만 씁니다. 강조는 면의 색으로 가릅니다.">
        <Card className={pad}>
          <div className="flex flex-wrap gap-2">
            <span tabIndex={0} className={`${btnPrimary} cursor-pointer`}>프로젝트 문의</span>
            <span tabIndex={0} className={`${btnOutline} cursor-pointer`}>포트폴리오</span>
          </div>
          <p className={`${note} mt-4`}>파란 면은 가장 중요한 동작, 회색 면은 그다음입니다. 모서리 18px, 글자 15px.</p>
        </Card>
        <div className="on-brand -mx-3 rounded-block px-6 py-7 medium:mx-0 medium:px-7 medium:py-8">
          <div className="flex flex-wrap gap-2">
            <span tabIndex={0} className={`${btnOnBrand} cursor-pointer`}>프로젝트 문의</span>
            <span tabIndex={0} className={`${btnOnBrandQuiet} cursor-pointer`}>포트폴리오</span>
          </div>
          <p className="mt-4 text-sub text-[var(--text-3)]">파란 면 위에서는 흰 면이 강조입니다.</p>
        </div>
        <GroupLabel>목록</GroupLabel>
        <Card>
          <ul>
            <Row main="누르면 넘어가는 줄" sub="주 문장은 한 줄에 들어오는 짧은 말로 씁니다." href="/design-system" />
            <Row main="값을 보여 주는 줄" trail="값" />
            <Row main="상태를 보여 주는 줄" trail={<Badge>제작 중</Badge>} />
          </ul>
        </Card>
      </Section>

      <Section id="share" title="공유 이미지" summary="카카오톡이나 메신저에 링크를 붙이면 뜨는 그림입니다. 파란 면에 흰 로고와 문장 하나만 둡니다.">
        <div className="-mx-3 grid gap-3 medium:mx-0 wide:grid-cols-2">
          {SHARE.map((c) => (
            <figure key={c.file} className="rounded-block bg-surface p-3">
              <Image src={`/images/og/${c.file}`} alt={`공유 이미지 · ${c.name}`} width={1200} height={630}
                className="h-auto w-full rounded-thumb" />
              <figcaption className="px-3 pb-2 pt-3">
                <p className="text-sub font-medium text-[var(--text-1)]">{c.name}</p>
                <p className="text-min text-[var(--text-3)]">{c.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 출처 - 이 가이드가 기댄 자료와 그 한계 */}
      <div className={`${container} pb-16`}>
        <p className="max-w-3xl text-min text-[var(--text-3)]">
          모서리와 글자 크기, 여백, 움직임의 수치는 삼성전자가 공개한 One UI 디자인 가이드라인의 원칙을 참고했습니다.
          이 문서와 사이트는 삼성전자의 공식 산출물이 아니며, 대표 색상과 그 밖의 값은 MATE가 정했습니다.
        </p>
      </div>
    </div>
  );
}
