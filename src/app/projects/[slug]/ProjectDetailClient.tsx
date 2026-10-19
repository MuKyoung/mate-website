'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { FiExternalLink, FiGithub, FiArrowLeft, FiYoutube, FiArrowUpRight } from 'react-icons/fi';
import ParallaxImage from '@/components/ParallaxImage';
import ThumbFallback from '@/components/ThumbFallback';
import CtaSection from '@/components/ui/CtaSection';
import HorizonGlow from '@/components/visual/HorizonGlow';
import BrowserFrame from '@/components/visual/BrowserFrame';
import { fadeUp, clipUp, zoomTilt, lineDraw, stagger, inView, onMount } from '@/lib/motion';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';
import { btnOutline, btnPrimary, container, displaySize, linkUnderline, sectionPad } from '@/lib/styles';

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

export default function ProjectDetailClient({ params }: Props) {
  const project = projects.find(p => p.id === params.slug);
  if (!project) notFound();

  /* 개요가 한 줄 소개를 그대로 복제한 경우가 있다.
     같은 문장을 제목 아래에서 또 읽히게 두면 섹션만 있고 내용은 없는 화면이 된다. */
  const overview =
    project.longDescription.trim() !== project.description.trim() ? project.longDescription : null;

  /* 갤러리가 대표 이미지 하나만 담고 있으면 위에서 이미 본 그림이다. */
  const gallery = project.images.filter((img) => img !== project.thumbnail);

  /* 홈페이지 사례는 실제 주소가 있으니 브라우저 틀에 담아 보여 준다 */
  const isSite = project.category === 'Website' && Boolean(project.liveUrl);
  const index = String(projects.findIndex((p) => p.id === project.id) + 1).padStart(2, '0');

  return (
    <>
      {/* ── 헤더 ── */}
      <section className="relative overflow-hidden border-b border-white/10 pt-36 pb-14 sm:pt-48 sm:pb-20">
        <HorizonGlow side="top" rim="clamp(100px, 11vw, 170px)" radius="max(130vw, 940px)" />
        <div className={`relative ${container}`}>
          <motion.div {...onMount} variants={fadeUp} className="mb-12 flex items-center justify-between gap-6 border-b border-white/[0.12] pb-4 sm:mb-16">
            <Link href="/projects"
              className="group mono-label hover:text-white">
              <FiArrowLeft size={13} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
              <Scramble text="Projects" />
            </Link>
            <p className="mono-label"><span className="text-white/45">Case</span> <Scramble text={index} delay={200} /></p>
          </motion.div>

          <motion.h1 {...onMount} variants={stagger}
            className="mb-8 max-w-5xl font-medium leading-[0.98] tracking-[-0.05em] text-[var(--text-1)] sm:mb-10"
            style={{ fontSize: 'clamp(2.5rem, 7.4vw, 6.5rem)' }}>
            <SplitText text={project.title} className="block" delay={0.1} />
          </motion.h1>

          <div className="grid gap-x-gutter gap-y-10 lg:grid-cols-12">
            <motion.p {...onMount} variants={fadeUp}
              className="max-w-3xl text-[18px] leading-[1.65] text-white/70 sm:text-[21px] lg:col-span-8">
              {project.description}
            </motion.p>

            {/* 칸마다 이름표를 붙인 정보 */}
            <motion.dl {...onMount} variants={fadeUp} className="space-y-4 lg:col-span-3 lg:col-start-10">
              <div>
                <dt className="mono-label mb-1.5">Category:</dt>
                <dd className="text-[15px] text-white/85">{project.category}</dd>
              </div>
              {project.liveUrl && (
                <div>
                  <dt className="mono-label mb-1.5">Link:</dt>
                  <dd className="break-all font-mono text-[13px] text-white/85">{project.liveUrl.replace(/^https?:\/\//, '')}</dd>
                </div>
              )}
            </motion.dl>
          </div>

          {(project.liveUrl || project.youtubeUrl || project.githubUrl) && (
            <motion.div {...onMount} variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                  사이트 바로가기
                  <FiExternalLink size={15} />
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className={btnOutline}>
                  <FiYoutube size={17} />
                  YouTube
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={`${linkUnderline} ml-4 inline-flex items-center gap-2`}>
                  <FiGithub size={15} />
                  GitHub
                </a>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-12 lg:gap-x-gutter">
            <div className="space-y-24 sm:space-y-28 lg:col-span-8">

              {/* 영상 / 화면 - 대형 */}
              {project.youtubeUrl ? (
                <motion.div {...inView} variants={zoomTilt}
                  className="relative aspect-video overflow-hidden bg-[var(--surface)]">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="absolute inset-0 h-full w-full" />
                </motion.div>
              ) : isSite ? (
                <motion.div {...inView} variants={fadeUp}>
                  <BrowserFrame src={project.thumbnail} alt={`${project.title} 화면`}
                    url={(project.liveUrl ?? '').replace(/^https?:\/\//, '')} />
                </motion.div>
              ) : (
                <ParallaxImage
                  src={project.thumbnail}
                  alt={project.title}
                  className="aspect-[16/9]"
                  rounded="rounded-none"
                  placeholder={<ThumbFallback label={project.category} />}
                />
              )}

              {/* Overview - 내용이 한 줄 소개와 다를 때만 */}
              {overview && (
                <motion.div {...inView} variants={stagger}>
                  <div className="relative mb-10 pb-4 sm:mb-14">
                    <motion.p variants={fadeUp} className="mono-label">Overview:</motion.p>
                    <motion.span variants={lineDraw}
                      className="absolute bottom-0 left-0 right-0 block h-px bg-white/[0.12]" />
                  </div>
                  <h2 className="mb-9 font-medium leading-[1.06] tracking-[-0.04em] text-[var(--text-1)]" style={displaySize}>
                    <span className="block overflow-hidden pb-[0.1em]">
                      <motion.span variants={clipUp} className="block">프로젝트 개요</motion.span>
                    </span>
                  </h2>
                  <motion.p variants={fadeUp} className="whitespace-pre-line text-[17px] leading-[1.85] text-white/65">
                    {overview}
                  </motion.p>
                </motion.div>
              )}

              {/* Gallery - 대표 이미지와 다른 컷이 있을 때만 */}
              {gallery.length > 0 && (
                <motion.div {...inView} variants={stagger}>
                  <div className="relative mb-10 pb-4 sm:mb-14">
                    <motion.p variants={fadeUp} className="mono-label">Gallery:</motion.p>
                    <motion.span variants={lineDraw}
                      className="absolute bottom-0 left-0 right-0 block h-px bg-white/[0.12]" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {gallery.map((img, i) => (
                      <ParallaxImage
                        key={i}
                        src={img}
                        alt={`${project.title} ${i + 1}`}
                        className="aspect-[16/9]"
                        rounded="rounded-none"
                        placeholder={<ThumbFallback label={project.category} />}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 오른쪽 칸 - 다른 사례로 넘어가는 목록 */}
            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="lg:sticky lg:top-28">
                <p className="mono-label mb-4 border-b border-white/[0.12] pb-4">More cases:</p>
                <ul>
                  {projects.filter((p) => p.id !== project.id).slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <Link href={`/projects/${p.id}`}
                        className="group flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5 transition-[padding] duration-500 hover:pl-2">
                        <span className="text-[15px] text-white/70 transition-colors group-hover:text-white">{p.title}</span>
                        <FiArrowUpRight size={13} className="shrink-0 text-white/35 transition-colors group-hover:text-white" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaSection
        line1="비슷한 걸"
        line2="만들고 계신가요"
        kr="기획 단계든 중간에 멈춘 상태든 받습니다"
        cta="문의하기"
      />
    </>
  );
}
