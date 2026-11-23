/**
 * 함께하는 곳 - 홈 첫 화면 아래 로고 띠(PartnersBand)와 숫자 칸(KeyNumbers)의 로고 흐름.
 *
 * 목록과 순서는 2026-11-23 사용자가 정했다. 로고는 각 곳의 공식 홈페이지 머리 로고를 받아 여백만 잘랐다
 * (세종호이스트크레인 · 우화는 MATE 가 만든 사이트의 로고). 그림은 public/images/partners/.
 * w · h 는 그림의 원래 크기 - 로고마다 다른 가로세로 비율로 크기를 맞추는 데 쓴다.
 */

export interface Partner {
  name: string;
  logo: string;
  w: number;
  h: number;
}

export const partners: Partner[] = [
  { name: '(주)세종호이스트크레인', logo: '/images/partners/sejong.webp', w: 355, h: 95 },
  { name: '(주)세코닉스', logo: '/images/partners/sekonix.svg', w: 510, h: 223 },
  { name: '한국인공지능게임협회', logo: '/images/partners/kaiga.webp', w: 512, h: 160 },
  { name: '플리더스', logo: '/images/partners/plithus.svg', w: 72, h: 18 },
  { name: '우화', logo: '/images/partners/woohwa.webp', w: 226, h: 160 },
  { name: '명지전문대학', logo: '/images/partners/mjc.webp', w: 285, h: 66 },
  { name: 'XSTAGE', logo: '/images/partners/xstage.webp', w: 833, h: 101 },
  { name: '댄스트럭트', logo: '/images/partners/danstruct.webp', w: 858, h: 103 },
  { name: '인디크래프트', logo: '/images/partners/indiecraft.webp', w: 380, h: 160 },
];
