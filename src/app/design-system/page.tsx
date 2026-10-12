import type { Metadata } from 'next';
import Image from 'next/image';
import { domains } from '@/data/domains';
import { container, sectionPad } from '@/lib/styles';
import { Swatch, TypeRow } from './Live';

export const metadata: Metadata = {
  title: 'Brand Guide',
  description: 'MATE 브랜드 가이드 · 로고, 대표 색상, 말투, 타이포그래피, 컴포넌트, 공유 이미지.',
  robots: { index: false, follow: false },
};

/**
 * MATE 브랜드 가이드.
 *
 * 색과 글자 크기의 숫자는 여기에 적지 않고 화면에서 읽어 보여 준다 (./Live).
 * 이 파일에 적는 것은 숫자가 아니라 규칙이다.
 */

/* ── 데이터 ─────────────────────────────────────────── */

const BLUE = [
  { token: '--primary-100', name: 'blue 100', note: '옅은 강조' },
  { token: '--primary-200', name: 'blue 200', note: '어두운 바탕 위 글자' },
  { token: '--primary-300', name: 'blue 300', note: '면의 호버' },
  { token: '--primary-400', name: 'MATE Blue', note: '로고 원색 · 면' },
  { token: '--primary-500', name: 'blue 500' },
  { token: '--primary-600', name: 'blue 600' },
];

const NEUTRAL = [
  { token: '--gray-50', name: 'white', note: '글자' },
  { token: '--gray-300', name: 'gray 300' },
  { token: '--gray-400', name: 'gray 400' },
  { token: '--gray-500', name: 'gray 500' },
  { token: '--surface-2', name: 'surface 2' },
  { token: '--surface', name: 'surface' },
  { token: '--canvas', name: 'canvas', note: '바탕' },
];

const TYPE = [
  { token: 'D1', cls: 'type-d1', sample: '멈추지 않게', use: '오프닝 · 마무리 문장' },
  { token: 'D2', cls: 'type-d2', sample: '일하는 방식', use: '섹션 제목' },
  { token: 'H1', cls: 'type-h1', sample: '타이틀 및 제목', use: '페이지 제목' },
  { token: 'H2', cls: 'type-h2', sample: '보조 타이틀 및 강조', use: '블록 제목' },
  { token: 'H3', cls: 'type-h3', sample: '보조 타이틀 및 강조', use: '가벼운 블록 제목' },
  { token: 'B1', cls: 'type-b1', sample: '서브 타이틀', use: '카드 제목' },
  { token: 'B2', cls: 'type-b2', sample: '주요 콘텐츠 및 내용', use: '강조 본문' },
  { token: 'B3', cls: 'type-b3', sample: '보조 콘텐츠 및 내용', use: '기본 본문' },
  { token: 'B4', cls: 'type-b4', sample: '안내 문구 강조', use: '라벨 · 버튼' },
  { token: 'C1', cls: 'type-c1', sample: '주요 콘텐츠를 세부적으로 설명', use: '캡션' },
  { token: 'C2', cls: 'type-c2', sample: '제한적으로 사용 / 밀도 높은 UI', use: '메타 정보' },
];

/** 말투 - 사이트 문구를 쓸 때 지키는 것 */
const VOICE = [
  ['한 일과 하는 일을 사실로 말합니다', '회사가 정하지 않은 약속이나 내력을 듣기 좋게 지어 넣지 않습니다.'],
  ['숫자는 데이터에서 가져옵니다', '납품 건수와 기간은 포트폴리오와 역량 데이터에서 계산합니다. 강의는 납품으로 세지 않습니다.'],
  ['두 사업을 나란히 씁니다', '자체 게임은 외주에서 나온 부산물이 아닙니다. SI와 퍼블리싱을 같은 무게로 적습니다.'],
  ['국문 문장으로 말합니다', '영문 두 단어 슬로건을 붙이지 않습니다. 영역 이름(Web & App 등)만 영문으로 씁니다.'],
  ['대시를 쓰지 않습니다', '줄표를 쓰지 않습니다. 범위는 물결표(1~3개월)로 적습니다.'],
] as const;

const LOGO_RULES = [
  '로고 둘레는 심볼의 원 지름만큼 비웁니다',
  '화면에서는 높이 20px 아래로 줄이지 않습니다',
  '파랑과 흰색 말고 다른 색으로 바꾸지 않습니다',
  '비율을 늘이거나 기울이지 않습니다',
  '그림자, 윤곽선, 그라디언트를 입히지 않습니다',
  '복잡한 사진 위에 바로 올리지 않습니다. 면을 깔고 올립니다',
];

const COLOR_USE = [
  ['면에 깔 때', 'MATE Blue를 그대로 씁니다. 그 위 글자는 흰색입니다.'],
  ['어두운 바탕 위 글자', '로고 원색은 검정 위에서 어두워 읽히지 않습니다. 한 단계 밝은 blue 200을 씁니다.'],
  ['밝은 바탕 위 글자', 'MATE Blue를 그대로 씁니다.'],
  ['쓰지 않는 것', '이 색으로 그라디언트나 빛 번짐을 만들지 않습니다. 평평한 면으로만 씁니다.'],
] as const;

/** 링크를 공유할 때 미리보기로 뜨는 이미지 (public/images/og). 1200×630 JPG. */
const SHARE = [
  { file: 'og-default.jpg', name: '기본', note: '홈과 공통 페이지' },
  { file: 'og-web.jpg', name: '웹 · 앱', note: '/web과 웹 · 앱 프로젝트' },
  { file: 'og-game.jpg', name: '게임 · XR', note: '/game과 게임 프로젝트' },
  { file: 'og-education.jpg', name: '교육', note: '/education과 강의' },
];

const RADII = [
  ['6', 'rounded-[6px]'],
  ['10', 'rounded-card'],
  ['16', 'rounded-[16px]'],
  ['알약', 'rounded-pill'],
] as const;

/* ── 조각 ───────────────────────────────────────────── */

function Block({ label, title, lead, children }: {
  label: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${sectionPad} border-t border-[var(--border)]`}>
      <div className={container}>
        <p className="index-num mb-8">{label}</p>
        <div className="mb-12 grid gap-x-gutter gap-y-5 sm:mb-16 lg:grid-cols-12">
          <h2 className="type-d2 text-[var(--text-1)] lg:col-span-6">{title}</h2>
          {lead && (
            <p className="type-b3 leading-[1.85] text-white/70 lg:col-span-5 lg:col-start-8 lg:self-end">{lead}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="type-b4 mb-5 text-white/60">{children}</h3>;
}

/** 로고를 정해진 바탕 위에 보여 준다. 흰 로고는 원본을 필터로 뒤집어 쓴다. */
function LogoPlate({ name, bg, white, note }: { name: string; bg: string; white: boolean; note: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-[var(--border)]">
      <div className="flex h-[180px] items-center justify-center px-8" style={{ background: bg }}>
        <Image src="/images/logo.png" alt="MATE" width={1991} height={493}
          className={`h-10 w-auto ${white ? 'brightness-0 invert' : ''}`} />
      </div>
      <div className="bg-[var(--surface)] px-4 py-3.5">
        <p className="type-b4 text-[var(--text-1)]">{name}</p>
        <p className="type-c2 mt-1 text-white/60">{note}</p>
      </div>
    </div>
  );
}

/* ── 페이지 ─────────────────────────────────────────── */

export default function BrandGuidePage() {
  return (
    <div>
      {/* 가이드의 표지도 가이드를 따른다 - 대표 색상 면에 흰 글자 */}
      <div className="bg-[var(--brand-fill)] pb-16 pt-36 sm:pb-20 sm:pt-44">
        <div className={container}>
          <p className="mb-8 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80">Brand Guide</p>
          <h1 className="font-bold leading-[1.06] tracking-[-0.025em] text-white"
            style={{ fontSize: 'clamp(2.5rem, 7.2vw, 6.5rem)' }}>
            멈추지 않게<br />만듭니다
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-white/90">
            MATE의 로고와 색, 말투를 정해 둔 문서입니다. 사이트와 소개서, 공유 이미지가 같은 얼굴을 하도록
            이 기준을 따릅니다.
          </p>
        </div>
      </div>

      {/* ── 01 브랜드 ── */}
      <Block label="01 Brand" title="무엇을 하는 회사인가"
        lead="SI 개발과 자체 퍼블리싱을 함께 하는 팀입니다. 맡은 것을 만들고, 저희 이름으로도 냅니다.">
        <div className="grid gap-gutter lg:grid-cols-3">
          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>캐치프레이즈</SubTitle>
            <p className="type-h2 text-[var(--text-1)]">멈추지 않게 만듭니다</p>
            <p className="type-b3 mt-4 leading-[1.8] text-white/70">
              만드는 것과 돌아가게 하는 것은 다릅니다. 그래서 배포한 뒤까지 봅니다.
            </p>
          </div>
          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>개발 전문성</SubTitle>
            <p className="type-b3 leading-[1.8] text-[var(--text-1)]">
              웹 · 앱, 게임 · XR, 교육. 기획부터 배포까지 한 팀이 합니다.
            </p>
          </div>
          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>배포 안정성</SubTitle>
            <p className="type-b3 leading-[1.8] text-[var(--text-1)]">
              배포한 뒤에도 모니터링으로 안정성을 확인하고, 끝난 뒤의 유지보수를 맡습니다.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <SubTitle>말투</SubTitle>
          <dl className="border-t border-[var(--border)]">
            {VOICE.map(([rule, why]) => (
              <div key={rule} className="grid gap-x-gutter gap-y-2 border-b border-[var(--border)] py-6 lg:grid-cols-12">
                <dt className="type-b1 text-[var(--text-1)] lg:col-span-5">{rule}</dt>
                <dd className="type-b3 leading-[1.8] text-white/70 lg:col-span-6 lg:col-start-7">{why}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Block>

      {/* ── 02 로고 ── */}
      <Block label="02 Logo" title="로고"
        lead="심볼은 M 위에 원 두 개가 놓인 모양입니다. 심볼과 워드마크를 함께 쓰는 것이 기본이고, 자리가 좁으면 심볼만 씁니다.">
        <div className="grid gap-gutter md:grid-cols-3">
          <LogoPlate name="기본" bg="#FFFFFF" white={false} note="밝은 바탕 · 인쇄물" />
          <LogoPlate name="반전 · 파란 면" bg="var(--brand-fill)" white note="표지 · 오프닝 · 아이콘" />
          <LogoPlate name="반전 · 검은 바탕" bg="var(--canvas)" white note="사이트 헤더" />
        </div>

        <div className="mt-14 grid gap-x-gutter gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SubTitle>심볼만 쓸 때</SubTitle>
            <div className="flex items-end gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[22px] bg-[var(--brand-fill)]">
                <Image src="/images/logo-mark.png" alt="MATE 심볼" width={380} height={369}
                  className="h-12 w-auto brightness-0 invert" />
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-[22px] bg-white">
                <Image src="/images/logo-mark.png" alt="MATE 심볼" width={380} height={369} className="h-12 w-auto" />
              </div>
            </div>
            <p className="type-c1 mt-4 leading-[1.8] text-white/60">
              앱 아이콘과 파비콘은 파란 면에 흰 심볼입니다. 심볼 폭이 전체의 3분의 2가 되게 둡니다.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <SubTitle>지킬 것</SubTitle>
            <ul className="border-t border-[var(--border)]">
              {LOGO_RULES.map((rule) => (
                <li key={rule} className="type-b3 border-b border-[var(--border)] py-4 leading-[1.7] text-[var(--text-1)]">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      {/* ── 03 색 ── */}
      <Block label="03 Color" title="대표 색상은 하나입니다"
        lead="MATE Blue는 로고 파일에서 잰 값 그대로입니다. 강조색을 따로 두지 않고, 누를 수 있는 것과 강조할 것 모두 이 색으로 합니다.">
        <div className="grid gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Swatch token="--primary-400" name="MATE Blue" note="대표 색상" tall />
          </div>
          <dl className="lg:col-span-6 lg:col-start-7">
            {COLOR_USE.map(([k, v]) => (
              <div key={k} className="border-b border-[var(--border)] py-5 first:border-t">
                <dt className="type-b4 mb-1.5 text-white/60">{k}</dt>
                <dd className="type-b3 leading-[1.75] text-[var(--text-1)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14">
          <SubTitle>파랑의 단계</SubTitle>
          <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 xl:grid-cols-6">
            {BLUE.map((s) => <Swatch key={s.token} {...s} />)}
          </div>
        </div>

        <div className="mt-14">
          <SubTitle>무채색</SubTitle>
          <div className="grid grid-cols-2 gap-gutter sm:grid-cols-4 xl:grid-cols-7">
            {NEUTRAL.map((s) => <Swatch key={s.token} {...s} />)}
          </div>
        </div>

        <div className="mt-14">
          <SubTitle>영역 색</SubTitle>
          <p className="type-b3 mb-7 max-w-2xl leading-[1.85] text-white/70">
            게임과 교육은 그 영역 페이지 안에서만 자기 색을 씁니다. 웹 · 앱은 대표 색상을 그대로 씁니다.
            홈과 공통 영역(헤더, 문의)에는 영역 색이 나오지 않습니다.
          </p>
          <div className="grid gap-gutter lg:grid-cols-3">
            {domains.map((d) => (
              <div key={d.key} data-domain={d.key} className="rounded-card border border-[var(--border)] p-6">
                <p className="type-b1 mb-1 text-[var(--text-1)]">{d.kr}</p>
                <p className="type-c2 mb-6 text-white/55">data-domain=&quot;{d.key}&quot;</p>
                <div className="grid grid-cols-3 gap-2">
                  <Swatch token="--domain-100" name="100" />
                  <Swatch token="--domain-200" name="200" />
                  <Swatch token="--domain-300" name="300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Block>

      {/* ── 04 글자 ── */}
      <Block label="04 Typography" title="Pretendard"
        lead="국문과 영문 모두 한 가족으로 씁니다. 굵기는 700 · 500 · 400 셋만 씁니다. 큰 글자도 700을 넘기지 않고, 자간은 조금만 좁힙니다.">
        <div className="border-t border-[var(--border)]">
          {TYPE.map((t) => <TypeRow key={t.token} {...t} />)}
        </div>
      </Block>

      {/* ── 05 부품 ── */}
      <Block label="05 Components" title="버튼과 면">
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>버튼 · 검은 바탕</SubTitle>
            <div className="flex flex-col items-start gap-4">
              <span className="type-b3 inline-flex h-14 items-center rounded-pill bg-white px-9 font-bold text-[var(--canvas)]">
                프로젝트 문의
              </span>
              <span className="type-b3 inline-flex h-14 items-center rounded-pill border border-white/20 px-9 font-bold text-white">
                보조 동작
              </span>
            </div>
            <p className="type-c1 mt-5 leading-[1.7] text-white/60">올리면 MATE Blue로 바뀝니다.</p>
          </div>

          <div className="rounded-card bg-[var(--brand-fill)] p-8">
            <p className="type-b4 mb-5 text-white/75">버튼 · 파란 면</p>
            <span className="type-b3 inline-flex h-14 items-center rounded-pill bg-white px-9 font-bold text-[var(--brand-fill)]">
              프로젝트 문의
            </span>
            <p className="type-c1 mt-5 leading-[1.7] text-white/85">흰 버튼에 글자는 MATE Blue.</p>
          </div>

          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>글자의 밝기</SubTitle>
            <div className="flex flex-col gap-3">
              <p className="type-b3 text-[var(--text-1)]">text-1: 제목 · 본문</p>
              <p className="type-b3 text-[var(--text-2)]">text-2: 보조 설명</p>
              <p className="type-b3 text-[var(--text-3)]">text-3: 메타 정보</p>
              <p className="type-b3 text-[var(--point)]">강조: 대표 색상</p>
            </div>
          </div>

          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>모서리</SubTitle>
            <div className="flex items-end gap-4">
              {RADII.map(([n, cls]) => (
                <div key={n} className="text-center">
                  <div className={`h-14 w-14 border border-white/15 bg-[var(--surface-2)] ${cls}`} />
                  <p className="type-c2 mt-2.5 text-white/60">{n}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>상태</SubTitle>
            <div className="flex flex-col gap-3">
              <p className="type-b3 border-l-2 border-[var(--success)] pl-4 text-[var(--success-on-dark)]">전송 완료</p>
              <p className="type-b3 border-l-2 border-[var(--danger)] pl-4 text-[var(--danger-on-dark)]">오류 발생</p>
              <p className="type-b3 border-l-2 border-[var(--point)] pl-4 text-[var(--point)]">현재 위치</p>
            </div>
          </div>

          <div className="rounded-card border border-[var(--border)] p-8">
            <SubTitle>경계선</SubTitle>
            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-2 h-px bg-[var(--border)]" />
                <span className="type-c2 text-white/60">border</span>
              </div>
              <div>
                <div className="mb-2 h-px bg-[var(--border-2)]" />
                <span className="type-c2 text-white/60">border-2</span>
              </div>
            </div>
            <p className="type-c1 mt-5 leading-[1.7] text-white/60">
              면은 그림자나 빛 번짐이 아니라 가는 선과 여백으로 나눕니다.
            </p>
          </div>
        </div>
      </Block>

      {/* ── 06 공유 이미지 ── */}
      <Block label="06 Share" title="공유 이미지"
        lead="카카오톡이나 메신저에 링크를 붙이면 뜨는 그림입니다. 표지와 같은 구성으로, 파란 면에 흰 로고와 문장 하나만 둡니다. 영역 색은 쓰지 않습니다.">
        <div className="grid gap-gutter sm:grid-cols-2">
          {SHARE.map((c) => (
            <figure key={c.file} className="overflow-hidden rounded-card border border-[var(--border)]">
              <Image src={`/images/og/${c.file}`} alt={`공유 이미지 · ${c.name}`} width={1200} height={630}
                className="h-auto w-full" />
              <figcaption className="bg-[var(--surface)] px-4 py-3.5">
                <p className="type-b4 text-[var(--text-1)]">{c.name}</p>
                <p className="type-c2 mt-1 text-white/60">{c.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Block>
    </div>
  );
}
