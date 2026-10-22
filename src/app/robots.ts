import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 사내 작업 관리 도구와 내기용 핀볼 게임 - 색인 대상이 아니다
        disallow: ['/taskmanager/', '/pinball/'],
      },
    ],
    sitemap: 'https://devteammate.co.kr/sitemap.xml',
  };
}

