import { domainByKey } from '@/data/domains';
import type { DomainKey } from '@/types';

/**
 * 홈 화면에만 쓰는 구성.
 * 문구는 영역 데이터(domains.ts)에서 가져오고, 여기서는 줄바꿈과 사진만 정한다.
 * 사진 한 장은 홈에서 한 자리만 쓴다 - 사진 슬라이드 세 장과 References 판이 겹치지 않는다.
 * (강의 사진만 큐브 03 면과 같다 - 공개할 수 있는 강의 사진이 그 한 장뿐이다.)
 */

export interface HeroSlide {
  key: DomainKey;
  href: string;
  image: string;
  alt: string;
  /** 큰 제목 두 줄 */
  title: [string, string];
  desc: string;
  /** 사진이 어느 작업에서 나왔는지 - 첫 화면 오른쪽 아래에 작게 적는다 */
  credit: string;
}

export const heroSlides: HeroSlide[] = [
  {
    key: 'web',
    href: '/web',
    // 포트폴리오의 세종호이스트크레인 홈페이지 첫 화면에 걸린 사진 (고객사 게재 허락, 2026-10-16)
    image: '/images/projects/세종호이스트크레인-메인.webp',
    alt: '(주)세종호이스트크레인 홈페이지 첫 화면에 쓴 갠트리 크레인 사진',
    title: ['기획서 한 장에서', '배포된 서비스까지'],
    desc: domainByKey.web.summary,
    credit: '(주)세종호이스트크레인 홈페이지',
  },
  {
    key: 'game',
    href: '/game',
    image: '/images/projects/VR 키오스크 시뮬레이션.webp',
    alt: 'VR 키오스크 시뮬레이션 화면. 상품을 스캔하는 장면',
    title: ['Unity로 만드는', '게임과 몰입형 콘텐츠'],
    desc: domainByKey.game.summary,
    credit: 'VR 키오스크 시뮬레이션',
  },
  {
    key: 'edu',
    href: '/education',
    image: '/images/projects/미래산업과학고.webp',
    alt: '미래산업과학고등학교 수업 현장',
    title: ['현업에서 실제로', '쓰는 것만 가르칩니다'],
    desc: domainByKey.edu.summary,
    credit: '미래산업과학고등학교 정규 수업',
  },
];

/** References 칸의 세로 판 - 첫 화면 큐브 · 사진 슬라이드와 다른 사진을 가진 작업만.
    세종호이스트크레인 화면은 큐브 01 면이 쓰고 있어 넣지 않는다 */
export const referenceIds = ['3', '6', '11', '9'];
