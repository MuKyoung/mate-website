import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/styles';

/**
 * 홈 첫 화면에 띄우는 안내 팝업 - src/components/home/NoticePopup.tsx 가 쓴다.
 * 모양 · 문구 틀은 세종호이스트크레인 사이트(sjhoist.com)의 공지 팝업을 따랐다(2026-11-23 사용자 요청).
 *
 * 등록일은 `postedOn` 에서 시작해 `refreshDays` 마다 그날로 넘어간다(한국 시간 기준).
 * 2026-11-23(월)에 올렸으므로 매주 월요일 날짜로 바뀐다. 빌드 · 배포 없이 방문자 화면에서 계산한다.
 * 내리려면 `active` 를 false 로 둔다.
 */
export const notice = {
  active: true,
  /** '오늘 하루 열지 않기' 기록 이름. 새 공지로 바꾸면 이 값도 바꿔야 전에 닫은 사람에게도 다시 뜬다 */
  id: 'renewal-2026-11',
  title: 'MATE 홈페이지 리뉴얼 안내',
  /** 처음 올린 날(YYYY-MM-DD, 한국 시간) */
  postedOn: '2026-11-23',
  /** 등록일을 그날로 다시 매기는 간격(일) */
  refreshDays: 7,
  /** 한 줄씩 끊어 보인다 */
  body: [
    '안녕하십니까, MATE입니다.',
    '고객 여러분의 편의를 높이기 위해 홈페이지 리뉴얼 작업을 진행하고 있습니다.',
    '이용 중 일부 페이지의 접근이 매끄럽지 않을 수 있으니 너른 양해를 부탁드립니다.',
  ],
  /** 본문 아래 연락처, 한 줄에 하나 */
  contacts: [
    { label: '대표전화', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
    { label: '메일', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { label: '프로젝트 문의', value: '문의 양식', href: '/contact' },
  ],
} as const;
