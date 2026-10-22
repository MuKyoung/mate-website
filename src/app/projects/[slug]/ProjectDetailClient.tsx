'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub, FiYoutube, FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import ProjectCard from '@/components/ProjectCard';
import { domainLabel, domainOf, projects } from '@/data/projects';
import { fadeLeft, fadeRight, fadeUp, stagger, staggerTight, inView, onMount } from '@/lib/motion';
import { arrowHover, btnLine, btnPoint, btnSm, chipLine, container, radiusCard } from '@/lib/styles';

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
 * 사례 상세 - 칩과 제목, 왼쪽 큰 그림과 오른쪽 정보 표, 문의 버튼 (Figma 12-1. Project detail).
 * 아래로 개요, 다른 컷, 다른 작업 세 장.
 */
export default function ProjectDetailClient({ params }: Props) {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) notFound();

  const domain = domainOf(project.category);
  const host = project.liveUrl?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

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

  const specs: [string, React.ReactNode][] = [
    ['프로젝트', project.title],
    ['영역', domainLabel[domain]],
    ['분류', project.category],
  ];
  if (project.liveUrl && host) {
    specs.push(['사이트', (
      <a key="site" href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-point-200">
        {host}<FiExternalLink size={13} />
      </a>
    )]);
  }

  const videoId = project.youtubeUrl ? getYouTubeVideoId(project.youtubeUrl) : null;

  return (
    <>
      <section data-header="light" className="bg-white pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pt-[140px]">
        <div className={container}>
          <motion.div {...onMount} variants={stagger}>
            <motion.span variants={fadeUp} className={chipLine}>{domainLabel[domain]}</motion.span>
            <motion.h1 variants={fadeUp} className="type-h1 mt-3 font-bold text-ink">{project.title}</motion.h1>
          </motion.div>

          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[minmax(0,868fr)_minmax(0,616fr)] lg:gap-4">
            <motion.div {...onMount} variants={fadeLeft}
              className={`relative aspect-[868/500] overflow-hidden bg-gray-100 ${radiusCard}`}>
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

            <motion.div {...onMount} variants={fadeRight} className="flex flex-col">
              <dl className="border-t border-line">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-6 border-b border-line py-4">
                    <dt className="shrink-0 text-[14px] text-gray-500">{k}</dt>
                    <dd className="text-right text-[14px] font-bold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="type-b3 mt-6 text-ink-2">{project.description}</p>
              <div className="mt-8 flex flex-col gap-2 lg:mt-auto lg:pt-8">
                <Link href={`/contact?domain=${domain}`}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-point-200 px-6 text-[15px] font-bold text-white transition-colors hover:bg-point-300">
                  비슷한 프로젝트 문의하기
                  <FiArrowUpRight size={16} className={arrowHover} />
                </Link>
                {(project.liveUrl || project.youtubeUrl || project.githubUrl) && (
                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[6px] border border-line text-[15px] font-bold text-ink transition-colors hover:border-point-200 hover:text-point-200">
                        사이트 바로가기 <FiExternalLink size={15} />
                      </a>
                    )}
                    {project.youtubeUrl && (
                      <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[6px] border border-line text-[15px] font-bold text-ink transition-colors hover:border-point-200 hover:text-point-200">
                        <FiYoutube size={17} /> YouTube
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[6px] border border-line text-[15px] font-bold text-ink transition-colors hover:border-point-200 hover:text-point-200">
                        <FiGithub size={15} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 개요 - 내용이 한 줄 소개와 다를 때만 ── */}
      {overview && (
        <section data-header="light" className="bg-gray-100 py-20 sm:py-28 xl:py-[120px]">
          <div className={`${container} grid gap-8 lg:grid-cols-12 lg:gap-8`}>
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
              <p className="eyebrow mb-3">Overview</p>
              <h2 className="type-h1 text-ink"><b>프로젝트 개요</b></h2>
            </motion.div>
            <motion.p {...inView} variants={fadeUp}
              className="whitespace-pre-line text-[16px] leading-[1.85] text-ink-2 sm:text-[17px] lg:col-span-8">
              {overview}
            </motion.p>
          </div>
        </section>
      )}

      {/* ── 다른 컷 - 대표 이미지와 다른 컷이 있을 때만 ── */}
      {gallery.length > 0 && (
        <section data-header="light" className="bg-white pt-20 sm:pt-28">
          <div className={container}>
            <motion.div {...inView} variants={fadeUp}>
              <p className="eyebrow mb-3">Gallery</p>
              <h2 className="type-h1 text-ink"><b>작업 화면</b>을 둘러보세요</h2>
            </motion.div>
            <motion.div {...inView} variants={staggerTight} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img, i) => (
                <motion.div key={img} variants={fadeUp} className={`relative aspect-[16/10] overflow-hidden bg-gray-100 ${radiusCard}`}>
                  <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill placeholder={<ThumbFallback label={project.category} />} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── 다른 작업 ── */}
      <section data-header="light" className="bg-white py-20 sm:py-28 xl:pb-[140px] xl:pt-[120px]">
        <div className={container}>
          <motion.h2 {...inView} variants={fadeUp} className="type-h2 text-ink">다른 작업 살펴보기</motion.h2>
          <motion.div {...inView} variants={staggerTight} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {related.map((p) => <ProjectCard key={p.id} project={p} />)}
          </motion.div>
          <div className="mt-12 flex justify-center gap-2 sm:mt-14">
            <Link href="/projects" className={`${btnPoint} ${btnSm}`}>목록으로 이동</Link>
            <Link href="/contact" className={`${btnLine} ${btnSm}`}>문의하기</Link>
          </div>
        </div>
      </section>
    </>
  );
}
