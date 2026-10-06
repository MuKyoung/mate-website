import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 사내 작업 관리 도구 — 색인 대상이 아니다
        disallow: ['/taskmanager/'],
      },
    ],
    sitemap: 'https://devteammate.co.kr/sitemap.xml',
  };
}

