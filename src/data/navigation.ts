/**
 * 상단 메뉴. Figma 처럼 큰 갈래 넷에 마우스를 올리면 아래로 하위 메뉴 칸이 열린다.
 * 모바일 메뉴와 푸터 링크도 이 목록을 쓴다.
 */

export interface NavLink {
  href: string;
  label: string;
}

export interface NavItem extends NavLink {
  children?: NavLink[];
}

export const navItems: NavItem[] = [
  {
    href: '/team',
    label: '회사소개',
    children: [
      { href: '/team#about', label: '소개' },
      { href: '/team#how', label: '일하는 방식' },
      { href: '/team#capabilities', label: '역량' },
      { href: '/team#organization', label: '조직' },
      { href: '/team#awards', label: '수상 · 전시' },
      { href: '/team#access', label: '오시는 길' },
    ],
  },
  {
    href: '/services',
    label: '사업영역',
    children: [
      { href: '/services', label: '개요' },
      { href: '/web', label: '웹 · 앱' },
      { href: '/game', label: '게임 · XR' },
      { href: '/education', label: '교육 · 강의' },
    ],
  },
  { href: '/projects', label: '프로젝트' },
  {
    href: '/contact',
    label: '문의하기',
    children: [
      { href: '/contact', label: '프로젝트 문의' },
      { href: '/contact#faq', label: '자주 묻는 질문' },
    ],
  },
];

/** 사업영역 하위 페이지의 머리 탭 - 같은 순서를 쓴다 */
export const serviceTabs: NavLink[] = navItems[1].children ?? [];
