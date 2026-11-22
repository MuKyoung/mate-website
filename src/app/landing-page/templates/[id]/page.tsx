import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { templateById, templatePage, templates } from '@/data/templateLibrary';
import { LANDING_ORIGIN } from '@/lib/shell';
import TemplateDetailClient from './TemplateDetailClient';

interface PageProps {
  params: { id: string };
}

/** 목록에 없는 번호는 404 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

const siteUrl = 'https://devteammate.co.kr';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = templateById(params.id);
  if (!t) return {};
  const title = `${t.id} ${t.title} · ${t.formatLabel} 템플릿`;
  const description = `${t.summary} 이 템플릿으로 제작을 문의할 수 있습니다.`;
  return {
    title,
    description,
    // 하위 도메인에서는 /templates/PT-01/ 로 열린다(next.config.js)
    alternates: { canonical: `${LANDING_ORIGIN}/templates/${t.id}/` },
    openGraph: {
      title, description,
      url: `${LANDING_ORIGIN}/templates/${t.id}/`,
      type: 'website',
      images: [{ url: `${siteUrl}${templatePage(t.id, 1)}`, alt: t.title }],
    },
  };
}

export default function TemplatePage({ params }: PageProps) {
  const i = templates.findIndex((t) => t.id === params.id);
  if (i < 0) notFound();
  const prev = templates[i - 1] ?? null;
  const next = templates[i + 1] ?? null;
  return <TemplateDetailClient template={templates[i]} prev={prev} next={next} />;
}
