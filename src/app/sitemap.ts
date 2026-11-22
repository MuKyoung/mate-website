import { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import { landingDesigns } from '@/data/landingDesigns';
import { templates } from '@/data/templateLibrary';
import { LANDING_ORIGIN } from '@/lib/shell';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://devteammate.co.kr';
  const currentDate = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/web/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/game/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/education/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/services/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 프로젝트 개별 페이지 추가
  projects.forEach((project) => {
    routes.push({
      url: `${baseUrl}/projects/${project.id}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // 단일 랜딩페이지 제작 - 하위 도메인(landingpage.devteammate.co.kr)의 소개 · 갤러리와 스타일별 상세.
  // 서치 콘솔 속성이 도메인 단위면 이 사이트맵으로 받는다. 주소 단위 속성이면 하위 도메인을 따로 등록해야 한다
  routes.push({
    url: `${LANDING_ORIGIN}/`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.9,
  });
  landingDesigns.forEach((d) => {
    routes.push({
      url: `${LANDING_ORIGIN}/${d.id}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  // 디자인 템플릿 라이브러리 - 같은 하위 도메인의 /templates/ 와 템플릿별 상세
  routes.push({
    url: `${LANDING_ORIGIN}/templates/`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  });
  templates.forEach((t) => {
    routes.push({
      url: `${LANDING_ORIGIN}/templates/${t.id}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  });

  return routes;
}

