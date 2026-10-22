'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub, FiYoutube, FiArrowUpRight, FiArrowLeft } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import { domainLabel, domainOf, projects } from '@/data/projects';
import { fadeUp, stagger, staggerTight, inView, onMount } from '@/lib/motion';
import { arrowHover, btnLine, btnPoint, chip, container, radiusCard } from '@/lib/styles';

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

interface Props { params: { slug: string } }

/**
 * 사례 상세 - 가운데 좁은 단에 분류 · 제목 · 정보 줄 · 큰 화면 · 개요, 끝에 다른 작업 세 장.
 */
export default function ProjectDetailClient({ params }: Props) {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) notFound();

  const domain = domainOf(project.category);
  const host = project.liveUrl?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const no = String(projects.findIndex((p) => p.id === project.id) + 1).padStart(2, '0');

  /* 개요가 한 줄 소개를 그대로 복제한 경우가 있다.
     같은 문장을 제목 아래에서 또 읽히게 두면 섹션만 있고 내용은 없는 화면이 된다. */
  const overview =
    project.longDescription.trim() !== project.description.trim() ? project.longDescription : null;

  /* 갤러리가 대표 이미지 하나만 담고 있으면 위에서 이미 본 그림이다. */
  const gallery = project.images.filter((img) => img !== project.thumbnail);

  /* 화면을 공개한 작업을 먼저, 그 안에서 같은 영역을 먼저 세운다 */
  const rank = (p: (typeof projects)[number]) =>
    (p.thumbnail ? 0 : 2) + (domainOf(p.category) === domain ? 0 : 1);
  const related = projects
    .filter((p) => p.id !== project.id)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 3);

  const videoId = project.youtubeUrl ? getYouTubeVideoId(project.youtubeUrl) : null;

  const meta: [string, React.ReactNode][] = [
    ['영역', domainLabel[domain]],
    ['분류', project.category],
  ];
  if (project.liveUrl && host) {
    meta.push(['사이트', (
      <a key="site" href={project.liveUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-point-200 hover:underline">
        {host}<FiExternalLink size={12} />
      </a>
    )]);
  }

  return (
    <>
      <article data-header="light" className="bg-white pb-20 pt-32 sm:pb-28 sm:pt-40">
        <div className={container}>
          <motion.div {...onMount} variants={stagger} className="mx-auto max-w-[920px]">
            <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
              <Link href="/projects" className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3 hover:text-point-200">
                <FiArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                Projects
              </Link>
              <span className="font-mono text-[12px] tracking-[0.06em] text-ink-3">Case {no}</span>
            </motion.div>

            <motion.span variants={fadeUp} className={`${chip} mt-10`}>{domainLabel[domain]}</motion.span>
            <motion.h1 variants={fadeUp}
              className="mt-4 font-medium leading-[1.15] tracking-[-0.022em] text-ink"
              style={{ fontSize: 'clamp(2.125rem, 1.2rem + 2.6vw, 3.75rem)' }}>
              {project.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-[17px] leading-[1.7] text-ink-2 sm:text-[19px]">
              {project.description}
            </motion.p>

            <motion.dl variants={fadeUp} className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-y border-line py-4">
              {meta.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-3 text-[14px]">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">{k}</dt>
                  <dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* 큰 화면 - 본문 단보다 넓게 */}
          <motion.div {...onMount} variants={fadeUp}
            className={`relative mx-auto mt-10 aspect-[16/9] max-w-[1180px] overflow-hidden bg-gray-100 sm:mt-14 ${radiusCard}`}>
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="absolute inset-0 h-full w-full" />
            ) : (
              <SafeImage src={project.thumbnail} alt={project.title} fill
                className={project.category === 'Website' ? '[&_img]:!object-top' : ''}
                placeholder={<ThumbFallback label={project.category} />} />
            )}
          </motion.div>

          <div className="mx-auto max-w-[920px]">
            {/* 개요 - 내용이 한 줄 소개와 다를 때만 */}
            {overview && (
              <motion.div {...inView} variants={fadeUp} className="mt-16 grid gap-6 sm:mt-20 md:grid-cols-[200px_1fr]">
                <p className="eyebrow">Overview:</p>
                <p className="whitespace-pre-line text-[16px] leading-[1.9] text-ink-2 sm:text-[17px]">{overview}</p>
              </motion.div>
            )}

            {/* 다른 컷 - 대표 이미지와 다른 컷이 있을 때만 */}
            {gallery.length > 0 && (
              <motion.div {...inView} variants={staggerTight} className="mt-14 grid gap-3 sm:grid-cols-2">
                {gallery.map((img, i) => (
                  <motion.div key={img} variants={fadeUp} className={`relative aspect-[16/10] overflow-hidden bg-gray-100 ${radiusCard}`}>
                    <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill placeholder={<ThumbFallback label={project.category} />} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div {...inView} variants={fadeUp} className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8 sm:mt-16">
              <Link href={`/contact?domain=${domain}`} className={btnPoint}>
                비슷한 프로젝트 문의하기
                <FiArrowUpRight size={16} className={arrowHover} />
              </Link>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnLine}>
                  사이트 바로가기 <FiExternalLink size={15} />
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className={btnLine}>
                  <FiYoutube size={17} /> YouTube
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={btnLine}>
                  <FiGithub size={15} /> GitHub
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </article>

      {/* ── 다른 작업 ── */}
      <section data-header="light" className="bg-gray-100 py-20 sm:py-28 xl:py-32">
        <div className={container}>
          <SectionHead eyebrow="More work:" title={<>다른 작업 <b>살펴보기</b></>}
            more={{ href: '/projects', label: '목록으로' }} />
          <motion.div {...inView} variants={staggerTight} className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProjectCard key={p.id} project={p} />)}
          </motion.div>
        </div>
      </section>
    </>
  );
}
