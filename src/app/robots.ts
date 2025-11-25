import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/team/[id]'], // 팀원 개별 페이지는 검색 엔진에서 제외
      },
    ],
    sitemap: 'https://mate.dev/sitemap.xml',
  };
}

