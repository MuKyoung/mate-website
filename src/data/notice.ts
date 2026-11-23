/**
 * 홈 첫 화면에 띄우는 안내 팝업 - src/components/home/NoticePopup.tsx 가 쓴다.
 *
 * 등록일은 `postedOn` 에서 시작해 `refreshDays` 마다 그날로 넘어간다(한국 시간 기준).
 * 2026-11-23(월)에 올렸으므로 매주 월요일 날짜로 바뀐다. 빌드 · 배포 없이 방문자 화면에서 계산한다.
 * 내리려면 `active` 를 false 로 둔다.
 */
export const notice = {
  active: true,
  /** '오늘 하루 보지 않기' 기록 이름. 새 공지로 바꾸면 이 값도 바꿔야 전에 닫은 사람에게도 다시 뜬다 */
  id: 'renewal-2026-11',
  title: '홈페이지 리뉴얼 안내',
  /** 처음 올린 날(YYYY-MM-DD, 한국 시간) */
  postedOn: '2026-11-23',
  /** 등록일을 그날로 다시 매기는 간격(일) */
  refreshDays: 7,
  body: [
    'MATE 홈페이지가 새롭게 바뀌었습니다.',
    '웹 · 앱, 게임 · XR, 교육 세 영역의 하는 일과 작업 사례를 새 화면에서 확인해 보세요.',
    '이용 중 불편한 점이나 궁금한 점은 프로젝트 문의로 남겨 주세요.',
  ],
  link: { href: '/contact', label: '프로젝트 문의' },
} as const;
