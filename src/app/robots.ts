import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 사내 도구(Hub, 예전 주소 /taskmanager 는 /hub 로 넘어간다)와 내기용 핀볼 게임 - 색인 대상이 아니다
        disallow: ['/hub/', '/taskmanager/', '/pinball/'],
      },
    ],
    sitemap: 'https://devteammate.co.kr/sitemap.xml',
  };
}

