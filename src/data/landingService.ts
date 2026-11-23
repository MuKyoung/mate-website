/**
 * 단일 랜딩페이지 제작 - 서비스 소개 문구 (/landing-page).
 * 원문은 landing-library/SERVICE-COPY.md. 가격 · 제작 기간 · 수정 횟수는 정해지기 전까지 적지 않는다.
 */

import { MAIN_ORIGIN } from '@/lib/shell';

export const landingHero = {
  title: '당신의 공간과 사람, 제품이 보이는 한 페이지.',
  sub: '실제 촬영부터 브랜드 디자인, 웹사이트 구현까지.',
  desc: '마음에 드는 스타일을 고르면 MATE가 매장과 일하는 사람, 제품에 맞춰 다시 디자인합니다. 디자인 시안만 맡기셔도 되고, 촬영과 웹사이트 구현까지 이어서 맡기셔도 됩니다.',
};

/** 맡길 수 있는 일 - 네 가지를 따로 나눠 맡을 수 있다 */
export const landingScope = [
  { title: '디자인 시안', desc: '고른 스타일을 바탕으로 문구, 사진 자리, 색, 글꼴을 브랜드에 맞게 조정한 PC·모바일 시안을 만듭니다. 시안만 의뢰할 수 있습니다.' },
  { title: '촬영', desc: '매장과 공간, 일하는 사람, 제품을 직접 찍어 시안의 사진 자리를 채웁니다.' },
  { title: '웹 구현', desc: '확정한 시안을 휴대폰과 PC에서 모두 잘 보이는 반응형 웹페이지로 만들어 공개합니다.' },
  { title: '기능 고도화', desc: '예약, 문의, 결제, 관리 기능을 붙이거나 여러 페이지로 넓힙니다.' },
];

export const landingScopeNote = '네 가지 일을 따로 나눠 맡을 수 있습니다. 범위와 일정, 비용은 상담에서 고른 스타일과 가진 자료를 보고 정합니다.';

/** 제작 과정 - optional 은 필요할 때만 하는 단계 */
export const landingProcess = [
  { title: '스타일 고르기', desc: '갤러리에서 디자인 번호를 골라 문의합니다.' },
  { title: '상담', desc: '업종과 목적, 가진 사진·문구를 듣고 맡길 범위를 정합니다.' },
  { title: '촬영', desc: '필요한 장면을 정해 매장·사람·제품을 찍습니다.', optional: true },
  { title: '시안', desc: 'PC·모바일 시안을 보며 함께 고칩니다.' },
  { title: '웹 구현', desc: '반응형 페이지로 만들어 공개합니다.', optional: true },
  { title: '고도화', desc: '예약·문의·결제 기능이나 페이지를 더합니다.', optional: true },
];

/** 갤러리 아래 안내 - 샘플과 실제 고객 사례를 구별하고 출처를 밝힌다 */
export const landingSampleNotes = [
  '이 갤러리의 디자인은 제작 스타일 샘플입니다. 공개 라이선스로 배포된 외부 디자인을 바탕으로 MATE가 사진과 글꼴을 정리한 샘플과, MATE가 구성한 시안이 함께 있습니다.',
  'MATE의 고객 납품 사례가 아니며, 상호·수치·후기·일정은 모두 예시입니다. 지금 들어 있는 사진은 Unsplash의 무료 사진(Unsplash License)을 예시로 넣은 것이고, 제작할 때는 실제 촬영한 사진으로 바꿉니다. 얼굴 사진, 화면 캡처, 지도처럼 실제 자료가 들어갈 자리는 비워 두었습니다.',
  '외부 디자인 기반 샘플은 원작자 표시 조건(CC BY 4.0)이 있어, 그 스타일로 만든 페이지에도 원작자 표시가 한 줄 들어갑니다.',
  '권리 표시: MATE 시안은 MATE가 구성했으며, 허락 없이 복제하거나 다른 곳에 옮겨 쓸 수 없습니다. 외부 디자인 기반 샘플의 디자인 권리는 각 원작자에게, KRDS 요소의 권리는 행정안전부에, 사진과 글꼴의 권리는 각 사진가와 글꼴 제작자에게 있습니다.',
];

/**
 * 권리 표시 - 묶음마다 주장할 수 있는 것만 적는다.
 * 외부 디자인 기반(CC BY 4.0)에는 MATE 권리나 이용 제한을 붙이지 않는다(라이선스 조건이 막는다).
 * 사진(Unsplash) · 글꼴(OFL) · KRDS 요소는 MATE 것이 아니라서 늘 빼고 적는다. 해는 시안을 만든 해
 */
const RIGHTS = '© 2026 MATE.';
export const rightsNotice = {
  /** MATE 시안 · 디자인 템플릿 */
  mate: `${RIGHTS} 허락 없이 복제하거나 다른 곳에 옮겨 쓸 수 없습니다. 사진과 글꼴의 권리는 각 권리자에게 있습니다.`,
  /** KRDS 바탕 MATE 시안 */
  krds: `${RIGHTS} KRDS에서 가져온 요소는 공공누리 제1유형 조건을 따르고, 그 밖의 구성과 문구는 허락 없이 복제하거나 다른 곳에 옮겨 쓸 수 없습니다. 사진과 글꼴의 권리는 각 권리자에게 있습니다.`,
  /** 외부 디자인 기반 */
  template: (creator: string) => `원작 디자인의 권리는 원작자 ${creator}에게 있습니다.`,
  /**
   * 두 갤러리 첫 화면의 사이트 저작권 줄 - 푸터와 같은 사이트 전체 표시다(2026-11-24 사용자 요청, 단서 문구는 붙이지 않는다).
   * 외부 디자인 기반 23개는 상세 화면의 원작자 · CC BY 표시와 /credits/ 가 개별 표시로 앞서므로 여기서 따로 빼지 않는다.
   */
  site: `${RIGHTS} All rights reserved.`,
};

/**
 * 움직이는 페이지(모션 그래픽 포함) 묶음 - 갤러리 위에 따로 보여 준다.
 * 그림이 아니라 실제로 열리는 샘플 페이지다. 원본과 생성기는 landing-library/motion/
 */
export const landingMotion = {
  desc: '스크롤과 손길에 반응하는 랜딩페이지 샘플입니다. 카드를 누르면 그림이 아니라 실제 페이지가 열리고, PC와 모바일 화면으로 바꿔 가며 움직여 볼 수 있습니다.',
  /** 상세 화면의 미리보기 위 안내 */
  hint: '실제로 움직이는 페이지입니다. 안에서 스크롤하고 눌러 보세요.',
  /** 상세 화면의 샘플 안내 - 사진이 없는 시안이라 갤러리의 다른 디자인과 문장이 다르다 */
  note: '제작 스타일 샘플입니다. 상호·가격·일정·수치는 예시이고, 그림과 문구, 움직임은 제작할 때 브랜드에 맞게 바꿉니다.',
};

/**
 * 문의로 넘어갈 때 쓰는 주소 - 본 사이트의 /contact 가 design 값을 읽어 제목을 채운다.
 * 이 화면은 하위 도메인(landingpage.devteammate.co.kr)에서 열리므로 본 사이트 절대 주소로 보낸다
 */
export const landingContactHref = (id?: string) =>
  `${MAIN_ORIGIN}/contact/?domain=web${id ? `&design=${id}` : ''}`;

/**
 * 디자인 템플릿 라이브러리 (/landing-page/templates, 하위 도메인에서는 /templates/).
 * 원본과 생성기는 template-library/. 가격 · 제작 기간 · 수정 횟수는 정해지기 전까지 적지 않는다.
 */
export const templateHero = {
  desc: '프레젠테이션, 카드뉴스, 상세페이지, 로고, 영상, 인쇄물까지 15가지 종류의 스타일 샘플입니다. 마음에 드는 번호를 골라 문의하면 내용과 사진을 바꿔 제작합니다.',
};

/** 템플릿 갤러리 아래 안내 - 샘플과 실제 고객 사례를 구별하고 사진 출처를 밝힌다 */
export const templateSampleNotes = [
  '이 갤러리의 디자인은 MATE가 구성한 제작 스타일 샘플입니다. 고객 납품 사례가 아니며 상호·이름·가격·일정·수치는 모두 예시입니다.',
  '사진은 Unsplash의 무료 사진(Unsplash License)이고 템플릿마다 사진가를 적었습니다. 사진 속 인물·상표·장소는 샘플과 관계가 없으며, 제작할 때는 주신 사진이나 촬영한 사진으로 바꿉니다.',
  '글꼴은 상업 이용이 허용된 공개 글꼴(OFL)을 썼습니다.',
  `권리 표시: ${RIGHTS} 템플릿의 디자인과 문구는 허락 없이 복제하거나 다른 곳에 옮겨 쓸 수 없습니다. 사진과 글꼴의 권리는 각 사진가와 글꼴 제작자에게 있습니다.`,
];

/**
 * 랜딩페이지 디자인과 디자인 템플릿 두 갤러리를 오가는 탭.
 * 상대 주소라 하위 도메인(/ · /templates/)과 본 사이트 경로(/landing-page/ · /landing-page/templates/) 양쪽에서 맞다
 */
export const landingTabs = { here: './', templates: 'templates/', landing: '../' };

/** 랜딩페이지 갤러리 · 상세에서 고르는 미리보기 화면 */
export type LandingView = 'pc' | 'mobile';
/** 고른 화면을 상세 · 갤러리를 오가는 동안 이어 쓰려고 sessionStorage 에 두는 열쇠 */
export const LANDING_VIEW_KEY = 'mate-landing-view';
/** 상세로 갈 때 고른 화면을 주소에 싣는다 (PC 는 기본이라 붙이지 않는다) */
export const landingViewQuery = (view: LandingView) => (view === 'mobile' ? '?view=mobile' : '');

/** 주소(?view=) → 저장해 둔 값 순서로 고른 화면을 읽는다. 브라우저에서만 부른다 */
export function readLandingView(): LandingView | null {
  const q = new URLSearchParams(window.location.search).get('view');
  if (q === 'pc' || q === 'mobile') return q;
  try {
    const saved = sessionStorage.getItem(LANDING_VIEW_KEY);
    return saved === 'pc' || saved === 'mobile' ? saved : null;
  } catch {
    return null; // 저장소를 막아 둔 브라우저
  }
}

export function saveLandingView(view: LandingView) {
  try {
    sessionStorage.setItem(LANDING_VIEW_KEY, view);
  } catch {
    // 저장소를 막아 둔 브라우저 - 이번 화면에서만 바뀐다
  }
}
