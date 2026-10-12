import { DomainMeta } from '@/types';
import { awards, teamCapabilities } from '@/data/teamCapabilities';

/** 역량 데이터를 id로 찾기 쉽게 */
const cap = Object.fromEntries(
  teamCapabilities.capabilities.map((c) => [c.id, c]),
) as Record<'unity' | 'outsourcing' | 'education', (typeof teamCapabilities.capabilities)[number]>;

/** 대응 플랫폼 - 지표(N종)와 목록이 따로 놀지 않도록 여기서 한 번만 정의한다 */
export const gamePlatforms = [
  { name: 'PC', detail: 'Windows' },
  { name: 'Mobile', detail: 'iOS · Android' },
  { name: 'XR', detail: 'Meta Quest' },
];

/** 게임·XR 도메인과 맞닿은 전시·수상 (게임 페이지와 지표가 같은 출처를 쓰도록 공유) */
export const gameCredentials = awards
  .filter((a) => /게임|G-STAR|메타버스|인디/.test(`${a.title}${a.organization}`))
  .sort((a, b) => b.year - a.year);

/** 홈에 올릴 대표 이력 - 최근 것부터 6건 (전체 목록은 /team) */
export const homeCredentials = [...awards]
  .sort((a, b) => b.year - a.year)
  .slice(0, 6);

/** 교육·연구 기관과 맞닿은 이력 - 게임 전시·수상은 게임 도메인 몫이므로 제외한다 */
export const eduRecord = awards
  .filter((a) => /교육부|대학교|공학|교육혁신|산학협력/.test(`${a.organization}${a.title}`))
  .filter((a) => !/게임|G-STAR|인디|메타버스/.test(`${a.title}${a.organization}`))
  .sort((a, b) => b.year - a.year);

/**
 * MATE의 3개 사업 도메인.
 *
 * 각 도메인은 독립된 페이지·레이아웃·액센트 컬러를 갖는다.
 * 여기에는 세 도메인이 공유하는 메타(네비·허브 카드용)만 두고,
 * 도메인별 상세 콘텐츠는 아래 개별 상수로 분리한다.
 */
export const domains: DomainMeta[] = [
  {
    key: 'web',
    slug: 'web',
    en: 'Web & App',
    kr: '웹 · 앱 개발',
    lead: '기획서 한 장에서 배포된 서비스까지',
    trigger: '만들 건 정해졌는데 만들 사람이 없을 때',
    summary:
      '요구사항 정의부터 화면 설계, 구현, 배포, 운영까지. 한 팀이 끝까지 맡아 중간에 끊기지 않습니다.',
    stats: [
      { value: `${cap.outsourcing.projects}+`, label: '웹·앱 프로젝트' },
      { value: '5년+', label: '외주 개발 경력' },
      { value: '1~3개월', label: '평균 개발 기간' },
    ],
    tags: ['Next.js', 'Flutter', 'Python', 'AWS'],
  },
  {
    key: 'game',
    slug: 'game',
    en: 'Game & XR',
    kr: '게임 · XR 개발',
    lead: 'Unity로 만드는 게임과 몰입형 콘텐츠',
    trigger: '재미가 되는지 먼저 확인해야 할 때',
    summary:
      '2D·3D 게임부터 VR 시뮬레이션까지. G-STAR 전시와 콘텐츠진흥원 지원사업을 거친 팀이 직접 만듭니다.',
    stats: [
      { value: `${cap.unity.projects}+`, label: '게임·XR 프로젝트' },
      { value: `${gameCredentials.length}회`, label: '전시 · 수상' },
      { value: `${gamePlatforms.length}종`, label: '대응 플랫폼' },
    ],
    tags: ['Unity', 'C#', 'Meta Quest', 'Spine'],
  },
  {
    key: 'edu',
    slug: 'education',
    en: 'Education',
    kr: '교육 · 강의',
    lead: '현업에서 실제로 쓰는 것만 가르칩니다',
    trigger: '가르칠 사람이 실무를 해봤어야 할 때',
    summary:
      '외주 개발로 쌓은 실무를 그대로 커리큘럼에 옮깁니다. 기관 수준과 목표에 맞춰 과정을 새로 짭니다.',
    stats: [
      { value: `${cap.education.projects}+`, label: '진행 강의' },
      { value: '3년+', label: '교육 경력' },
      { value: '9개월', label: '최장 연속 과정' },
    ],
    tags: ['Unity', '웹 · 앱', 'AI 활용', '프로젝트 지도'],
  },
];

export const domainByKey = Object.fromEntries(
  domains.map((d) => [d.key, d]),
) as Record<DomainMeta['key'], DomainMeta>;

/* ═══════════════════════════════════════════════════════
   WEB - 웹 · 앱 개발
   ═══════════════════════════════════════════════════════ */

/** 3단계 서비스 - 아코디언으로 펼쳐지는 작업 범위 */
export const webScope = [
  {
    id: 'product',
    step: 'Phase 01',
    en: 'Product',
    kr: '정의하고 설계합니다',
    desc:
      '무엇을 만들지가 정해지지 않은 상태로 시작해도 됩니다. 요구사항을 문서로 굳히고, 화면 흐름과 기술 스택을 정한 뒤에 견적과 일정을 냅니다.',
    items: [
      '요구사항 정의서',
      'IA · 화면 설계',
      '기술 스택 선정',
      '견적 · 일정 산출',
      '프로토타입 검증',
    ],
  },
  {
    id: 'build',
    step: 'Phase 02',
    en: 'Build',
    kr: '만들고 붙입니다',
    desc:
      '프론트엔드, 앱, 서버, 관리자 페이지를 한 팀이 함께 만듭니다. 주 단위로 동작하는 결과물을 공유해 방향이 틀어진 채로 오래 가지 않게 합니다.',
    items: [
      '반응형 웹 (Next.js)',
      '모바일 앱 (Flutter)',
      '백엔드 · API',
      '관리자 페이지',
      '결제 · 인증 연동',
      'AI · RAG 기능',
    ],
  },
  {
    id: 'operate',
    step: 'Phase 03',
    en: 'Operate',
    kr: '띄우고 지킵니다',
    desc:
      '배포로 끝내지 않습니다. 도메인 연결, 모니터링, 버그 대응, 기능 추가까지 이어서 맡을 수 있습니다.',
    items: ['AWS · Vercel 배포', '도메인 · SSL', '모니터링', '유지보수', '기능 추가'],
  },
];

/** 기술 스택 - 레이어별로 묶어 보여준다 */
export const webStack = [
  { layer: 'Frontend', items: ['HTML · CSS · JavaScript', 'React', 'Next.js', 'TypeScript'] },
  { layer: 'Mobile', items: ['Flutter'] },
  { layer: 'Backend', items: ['Python', 'Supabase'] },
  { layer: 'Infra', items: ['AWS', 'Vercel', 'GitHub'] },
];

/** 인도물 - 계약이 끝나면 무엇이 남는가 */
export const webDeliverables = [
  {
    title: '소스 코드 전체',
    desc: 'GitHub로 관리하며 개발 기간 중에도 실시간으로 열람하실 수 있습니다. 완료 시 저장소를 그대로 넘겨드립니다.',
  },
  {
    title: '기술 문서',
    desc: '완료 시 소스 코드와 함께 문서를 제공합니다. 어떤 문서가 필요한지는 착수 전에 함께 정합니다.',
  },
  {
    title: '배포 환경',
    desc: '어느 인프라에 올릴지, 계정을 누가 소유할지는 계약 단계에서 정해 두고 그대로 이행합니다.',
  },
  {
    title: '완료 후 유지보수',
    desc: '버그 수정, 기능 추가, 업데이트를 이어서 맡을 수 있습니다. 별도 협의로 진행합니다.',
  },
];

/* ═══════════════════════════════════════════════════════
   GAME - 게임 · XR 개발
   ═══════════════════════════════════════════════════════ */

/** 제작 유형 - 가로 스크롤 카드 */
export const gameCapabilities = [
  {
    id: '2d',
    no: '01',
    en: '2D Game',
    kr: '2D 게임',
    desc: 'Spine 기반 캐릭터 애니메이션부터 스테이지 구성, 밸런싱까지. 모바일·PC 양쪽에 대응합니다.',
    tags: ['Unity', 'Spine', '모바일', 'PC'],
  },
  {
    id: '3d',
    no: '02',
    en: '3D Game',
    kr: '3D 게임',
    desc: '레벨 디자인, 셰이더, 물리 기반 인터랙션. 저사양 기기까지 고려한 최적화를 함께 진행합니다.',
    tags: ['Unity', '레벨 디자인', '최적화'],
  },
  {
    id: 'vr',
    no: '03',
    en: 'VR Simulation',
    kr: 'VR 시뮬레이션',
    desc: '교육·훈련용 시뮬레이션이 가장 많습니다. 키오스크 조작, 중고차 점검, 생존 훈련 등을 만들었습니다.',
    tags: ['Meta Quest', 'XR Toolkit', '교육용', '훈련용'],
  },
  {
    id: 'ar',
    no: '04',
    en: 'AR Content',
    kr: 'AR 콘텐츠',
    desc: '전시·체험형 콘텐츠 중심. 마커 인식, 공간 배치, 모바일 기기 대응을 다룹니다.',
    tags: ['AR Foundation', '전시', '체험형'],
  },
  {
    id: 'proto',
    no: '05',
    en: 'Prototype',
    kr: '프로토타입',
    desc: '투자·심사·내부 설득용으로 돌아가는 빌드가 먼저 필요할 때. 범위를 좁혀 짧게 끊어 만듭니다.',
    tags: ['플레이어블', '피칭용', '범위 협의'],
  },
  {
    id: 'port',
    no: '06',
    en: 'Port & Optimize',
    kr: '포팅 · 최적화',
    desc: '이미 만들어진 빌드의 플랫폼 이식, 프레임 개선, 빌드 용량 축소를 맡습니다.',
    tags: ['플랫폼 이식', '프레임 개선', '용량 축소'],
  },
];

/** 게임 도메인 제작 공정 */
export const gamePipeline = [
  { no: '01', title: '컨셉 · 기획', desc: '장르, 코어 루프, 타깃 플랫폼을 확정하고 리스크를 먼저 꺼냅니다.' },
  { no: '02', title: '프로토타입', desc: '재미의 핵심만 남긴 빌드로 방향을 검증합니다. 이 단계에서 뒤집는 편이 쌉니다.' },
  { no: '03', title: '제작', desc: '아트·개발 병렬 진행. 정해진 주기마다 플레이 가능한 빌드를 전달합니다.' },
  { no: '04', title: 'QA · 최적화', desc: '실기기 테스트로 프레임·발열·용량을 잡습니다.' },
  { no: '05', title: '빌드 · 출시', desc: '스토어 등록과 심의 대응, 출시 후 패치까지 협의 범위에 따라 이어갑니다.' },
];

/* ═══════════════════════════════════════════════════════
   EDUCATION - 교육 · 강의
   ═══════════════════════════════════════════════════════ */

/**
 * 커리큘럼 - 주차별 아코디언.
 * 아래는 표준안이며, 실제 과정은 기관의 시수·수준·목표에 맞춰 다시 구성한다.
 */
export const eduCourses = [
  {
    id: 'unity',
    code: 'C-01',
    title: 'Unity 게임 개발',
    weeks: '12주 · 주 1회 3시간',
    level: '입문 ~ 중급',
    summary: '엔진 조작에서 시작해 각자의 게임을 빌드해 제출하는 것으로 끝납니다.',
    outline: [
      { range: '1–3주', title: '엔진과 C# 기초', detail: '씬 구성, 컴포넌트 구조, 변수와 제어문을 게임 안에서 익힙니다.' },
      { range: '4–6주', title: '게임 로직', detail: '플레이어 조작, 충돌, 상태 관리. 작은 미니게임을 완성합니다.' },
      { range: '7–9주', title: 'UI와 데이터', detail: '인벤토리, 저장·불러오기, 씬 전환을 붙입니다.' },
      { range: '10–12주', title: '개인 프로젝트', detail: '기획부터 빌드까지 직접. 마지막 주에 발표와 코드 리뷰를 합니다.' },
    ],
  },
  {
    id: 'webapp',
    code: 'C-02',
    title: '웹 · 앱 개발',
    weeks: '12주 · 주 1회 3시간',
    level: '입문 ~ 중급',
    summary: '마지막 주에 각자 배포된 주소를 하나씩 들고 나갑니다.',
    outline: [
      { range: '1–3주', title: 'HTML · CSS · JS', detail: '브라우저가 무엇을 하는지부터. 정적 페이지를 직접 띄웁니다.' },
      { range: '4–6주', title: 'React와 Next.js', detail: '컴포넌트 사고방식, 상태 관리, 라우팅.' },
      { range: '7–9주', title: '데이터 연동', detail: 'API 호출, 인증, 데이터베이스 연결.' },
      { range: '10–12주', title: '배포와 운영', detail: 'Vercel 배포, 도메인 연결, 에러 추적까지 경험합니다.' },
    ],
  },
  {
    id: 'ai',
    code: 'C-03',
    title: 'AI 활용 개발',
    weeks: '8주 · 주 1회 3시간',
    level: '개발 경험자',
    summary: '이미 코드를 쓸 줄 아는 사람이 AI를 실제 제품에 붙이는 법을 배웁니다.',
    outline: [
      { range: '1–2주', title: 'LLM API 기초', detail: '프롬프트 설계, 토큰과 비용, 스트리밍 응답.' },
      { range: '3–5주', title: 'RAG 구축', detail: '문서 임베딩, 벡터 검색, 응답 근거 붙이기.' },
      { range: '6–8주', title: '제품에 통합', detail: '실패 처리, 평가, 배포. 팀 프로젝트로 마무리합니다.' },
    ],
  },
];

/** 교육 대상 */
export const eduAudiences = [
  {
    no: '01',
    title: '고등학교',
    detail: '특성화고·마이스터고 정규 수업과 방과후 과정. 미래산업과학고에서 9개월 연속 과정을 진행했습니다.',
    points: ['정규 · 방과후', '포트폴리오 산출물', '대회 준비 지도'],
  },
  {
    no: '02',
    title: '대학교',
    detail: '학과 특강, 캡스톤 지도, 창업 동아리 멘토링. 졸업작품이 실제로 돌아가는 수준까지 끌어올립니다.',
    points: ['학과 특강', '캡스톤 지도', '취업 포트폴리오'],
  },
  {
    no: '03',
    title: '기관 · 기업',
    detail: '재직자 대상 사내 교육과 직무 전환 과정. 팀의 현재 스택에 맞춰 커리큘럼을 다시 짭니다.',
    points: ['사내 교육', '직무 전환', '스택 맞춤'],
  },
];

/** 운영 방식 */
export const eduFormat = [
  { k: '진행 형태', v: '오프라인 · 온라인 · 병행 모두 가능' },
  { k: '정규 과정', v: '12주 · 주 1회 3시간이 표준 (AI 활용 과정은 8주)' },
  { k: '최장 운영', v: '9개월 연속, 미래산업과학고 정규 수업' },
  { k: '최소 단위', v: '단기 특강 4시간부터' },
  { k: '준비물', v: '개인 노트북 · 실습 환경은 사전에 세팅해 드립니다' },
  { k: '산출물', v: '수강생마다 빌드된 결과물과 소스 코드가 남습니다' },
  { k: '커스터마이징', v: '기관 목표와 수준에 맞춰 주차 구성을 다시 짭니다' },
];
