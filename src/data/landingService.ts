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
  'MATE의 고객 납품 사례가 아니며, 상호·수치·후기·일정은 모두 예시입니다. 사진 자리는 실제 촬영한 사진으로 채웁니다.',
  '외부 디자인 기반 샘플은 원작자 표시 조건(CC BY 4.0)이 있어, 그 스타일로 만든 페이지에도 원작자 표시가 한 줄 들어갑니다.',
];

/**
 * 문의로 넘어갈 때 쓰는 주소 - 본 사이트의 /contact 가 design 값을 읽어 제목을 채운다.
 * 이 화면은 하위 도메인(landingpage.devteammate.co.kr)에서 열리므로 본 사이트 절대 주소로 보낸다
 */
export const landingContactHref = (id?: string) =>
  `${MAIN_ORIGIN}/contact/?domain=web${id ? `&design=${id}` : ''}`;
