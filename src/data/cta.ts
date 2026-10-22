import { projects } from '@/data/projects';

/**
 * 푸터 위 문의 칸의 문구 - 페이지마다 다르게 건다.
 *
 * Figma 는 모든 페이지가 같은 푸터(문의 칸 + 회사 정보)로 끝난다. 페이지 끝에 따로 두던
 * 문의 섹션의 문구를 그대로 옮겨 왔다. 문구를 새로 지어 넣지 않는다.
 */

export interface CtaCopy {
  line1: string;
  line2: string;
  desc: string;
  /** 동그란 버튼 두 줄 */
  button: [string, string];
  href: string;
}

const base: CtaCopy = {
  line1: '아직 정리가',
  line2: '안 되셨어도',
  desc: '요구사항과 목표는 첫 상담에서 같이 정리합니다.',
  button: ['프로젝트', '문의하기'],
  href: '/contact',
};

const byPath: Record<string, Partial<CtaCopy>> = {
  '/services': {
    line1: '어느 영역이든',
    line2: '창구는 하나입니다',
    desc: '어디로 가야 할지 모르겠으면 그냥 적어 보내주셔도 됩니다.',
  },
  '/web': {
    line1: '요구사항 정리부터',
    line2: '같이 합니다',
    desc: '아이디어 단계여도 됩니다. 요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일입니다.',
    button: ['웹 · 앱', '프로젝트 문의'],
    href: '/contact?domain=web',
  },
  '/game': {
    line1: '장면 한 컷이면',
    line2: '시작할 수 있습니다',
    desc: '기획서가 없어도 됩니다. 만들고 싶은 화면을 말로 설명해 주셔도 됩니다.',
    button: ['게임 · XR', '프로젝트 문의'],
    href: '/contact?domain=game',
  },
  '/education': {
    line1: '커리큘럼은 기관에 맞춰',
    line2: '다시 씁니다',
    desc: '대상, 시수, 목표만 알려주시면 표준 커리큘럼을 그에 맞게 재구성해 제안서로 보내드립니다.',
    button: ['강의 · 교육', '문의하기'],
    href: '/contact?domain=edu',
  },
  '/projects': {
    line1: '다음 줄에',
    line2: '들어갈 프로젝트',
    desc: `여기 올라온 ${projects.length}건은 전부 납품이 끝난 것입니다.`,
  },
  '/projects/*': {
    line1: '비슷한 걸',
    line2: '만들고 계신가요',
    desc: '기획 단계든 중간에 멈춘 상태든 받습니다.',
  },
  '/team': {
    line1: '함께 프로젝트를',
    line2: '시작해볼까요?',
    desc: '무료 상담으로 가능성을 확인하세요.',
  },
};

export function ctaFor(pathname: string): CtaCopy {
  // trailingSlash 설정 때문에 주소가 '/web/' 처럼 온다
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const hit = byPath[path] ?? (path.startsWith('/projects/') ? byPath['/projects/*'] : undefined);
  return { ...base, ...hit };
}
