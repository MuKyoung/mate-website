import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { landingDesignById, landingDesigns } from '@/data/landingDesigns';
import { landingOrder } from '@/data/landingService';
import { LANDING_ORIGIN } from '@/lib/shell';
import DesignDetailClient from './DesignDetailClient';

interface PageProps {
  params: { id: string };
}

/** 목록에 없는 번호는 404 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return landingDesigns.map((d) => ({ id: d.id }));
}

const siteUrl = 'https://devteammate.co.kr';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const d = landingDesignById(params.id);
  if (!d) return {};
  const title = `${d.title} · 랜딩페이지 스타일`;
  const description = `${d.summary} 이 스타일로 단일 랜딩페이지 제작을 문의할 수 있습니다.`;
  return {
    title,
    description,
    // 하위 도메인에서는 /LP-001/ 로 열린다(next.config.js)
    alternates: { canonical: `${LANDING_ORIGIN}/${d.id}/` },
    openGraph: {
      title, description,
      url: `${LANDING_ORIGIN}/${d.id}/`,
      type: 'website',
      images: [{ url: `${siteUrl}${d.thumb}`, width: 960, height: 600, alt: d.title }],
    },
  };
}

export default function LandingDesignPage({ params }: PageProps) {
  // 이전 · 다음은 갤러리와 같은 순서(사진이 들어간 디자인 먼저)
  const list = landingOrder(landingDesigns);
  const i = list.findIndex((d) => d.id === params.id);
  if (i < 0) notFound();
  const prev = list[i - 1] ?? null;
  const next = list[i + 1] ?? null;
  return <DesignDetailClient design={list[i]} prev={prev} next={next} />;
}
