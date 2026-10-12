/**
 * 스톡 사진 - 홈의 분위기를 잡는 데 쓰는 바깥 사진.
 *
 * 전부 Unsplash 에서 받았고, 받은 날(2026-10-13) 기준으로 원본 페이지에
 * "Free to use under the Unsplash License" 라고 적혀 있는 것만 골랐다.
 * 이 라이선스는 상업적 이용과 수정, 출처 표기 없는 사용을 허용한다.
 * 유료(Unsplash+) 사진은 쓰지 않는다. 파일은 public/images/stock 에 있다.
 *
 * 고르는 기준
 *  - 사람, 상표, 어느 도시인지 알아볼 수 있는 풍경은 쓰지 않는다.
 *  - 저희 사무실이나 팀, 설비로 읽힐 수 있는 사진은 쓰지 않는다. 스톡 사진은
 *    분위기를 잡을 뿐이고 저희에 대한 사실을 말하지 않는다.
 *  - 한 장은 한 곳에만 쓴다. 저희가 만든 것을 보여 줄 자리(최근 작업)에는 쓰지 않는다.
 *
 * 사진을 바꾸면 여기의 출처도 같이 바꾼다. 브랜드 가이드가 이 목록을 그대로 보여 준다.
 */
export interface StockPhoto {
  src: string;
  width: number;
  height: number;
  /** 무엇이 찍혀 있는지 */
  what: string;
  /** 어디에 쓰는지 */
  where: string;
  /** 찍은 사람 */
  by: string;
  /** 원본 페이지 */
  source: string;
}

export const stock = {
  hero: {
    src: '/images/stock/hero-light-trails.webp', width: 2000, height: 1333,
    what: '밤의 고속도로를 지나는 불빛', where: '홈 · 첫 화면',
    by: 'Markus Spiske', source: 'https://unsplash.com/photos/mbrF_62mp-Y',
  },
  about: {
    src: '/images/stock/about-glass-tower.webp', width: 1600, height: 780,
    what: '아래에서 올려다본 유리 건물', where: '홈 · 소개',
    by: 'John Thomas', source: 'https://unsplash.com/photos/O7LjOIDDREs',
  },
  web: {
    src: '/images/stock/web-code.webp', width: 1600, height: 1067,
    what: '코드가 떠 있는 화면', where: '홈 · 하는 일 (웹 · 앱)',
    by: 'Mohammad Rahmani', source: 'https://unsplash.com/photos/3Sx3hSQcQIA',
  },
  game: {
    src: '/images/stock/game-vr-lens.webp', width: 1600, height: 1067,
    what: 'VR 헤드셋의 렌즈', where: '홈 · 하는 일 (게임 · XR)',
    by: 'James Yarema', source: 'https://unsplash.com/photos/E-CdfbrnnFs',
  },
  edu: {
    src: '/images/stock/edu-lecture-hall.webp', width: 1600, height: 1200,
    what: '빈 강의실', where: '홈 · 하는 일 (교육)',
    by: 'Po-Hsuan Huang', source: 'https://unsplash.com/photos/mNY_-DvKisc',
  },
  process: {
    src: '/images/stock/process-network.webp', width: 1800, height: 1200,
    what: '네트워크 장비에 꽂힌 케이블', where: '홈 · 일하는 방식',
    by: 'Scott Rodgerson', source: 'https://unsplash.com/photos/PSpf_XgOM5w',
  },
  contact: {
    src: '/images/stock/contact-star-trails.webp', width: 2000, height: 1125,
    what: '오래 열어 찍은 별의 궤적', where: '홈 · 문의',
    by: 'Vimal S', source: 'https://unsplash.com/photos/m4mdxKUBM58',
  },
} satisfies Record<string, StockPhoto>;

export const stockList: StockPhoto[] = Object.values(stock);
