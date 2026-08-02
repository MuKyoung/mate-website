'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiClock, FiYoutube, FiImage, FiArrowRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { fadeUp, clipUp, stagger, inView, onMount } from '@/lib/motion';

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

  const team = teamMembers.filter(m => project.teamMembers.includes(m.id));

  return (
    <>
      {/* ── 헤더 밴드 (라벤더 서피스) ── */}
      <section className="relative bg-[#f4f3ff] pt-36 sm:pt-44 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-[2.5rem] bg-[#d4ff3d] rotate-12 opacity-70 pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/projects"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5b5b6b] hover:text-[#4f46ff] transition-colors mb-8">
              <FiArrowLeft size={13} />
              프로젝트 목록
            </Link>
          </motion.div>

          {/* 메타 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full text-[12px] font-bold text-[#4f46ff] bg-white">
              {project.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#858594]">
              <FiClock size={12} />
              {project.durationMonths}개월
            </span>
          </motion.div>

          <motion.h1 {...onMount} variants={stagger}
            className="text-[#0f0f19] font-extrabold tracking-[-0.035em] leading-[1.02] mb-6 max-w-4xl"
            style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)' }}>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{project.title}</motion.span></span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp} className="text-[15px] sm:text-base text-[#5b5b6b] leading-[1.75] max-w-2xl mb-9">
            {project.description}
          </motion.p>

          {/* 액션 버튼 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-2xl text-[14px] font-bold text-white bg-[#4f46ff] hover:bg-[#3d33e8] transition-colors">
                <FiExternalLink size={14} />
                라이브 데모
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
                <FiYoutube size={15} />
                YouTube
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl text-[14px] font-bold text-[#0f0f19] bg-white border-2 border-[#0f0f19] hover:bg-[#0f0f19] hover:text-white transition-colors">
                <FiGithub size={14} />
                GitHub
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-14 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-14">

              {/* 영상 / 썸네일 */}
              <motion.div {...inView} variants={fadeUp}>
                {project.youtubeUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#e6e4f2] bg-[#f4f3ff]">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <div className="relative rounded-2xl h-72 sm:h-96 overflow-hidden border border-[#e6e4f2] bg-[#f4f3ff]">
                    <SafeImage src={project.thumbnail} alt={project.title} fill className="object-cover"
                      placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#cfcbe8]"><FiImage size={48} /></div>} />
                  </div>
                )}
              </motion.div>

              {/* 프로젝트 개요 */}
              <motion.div {...inView} variants={stagger}>
                <motion.p variants={fadeUp} className="text-[13px] font-semibold text-[#4f46ff] mb-4">01 — Overview</motion.p>
                <motion.h2 variants={fadeUp} className="text-[#0f0f19] font-extrabold tracking-[-0.03em] mb-6"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                  프로젝트 개요
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[15px] text-[#5b5b6b] leading-[1.85] whitespace-pre-line">{project.longDescription}</motion.p>
              </motion.div>

              {/* 갤러리 */}
              {project.images && project.images.length > 0 && (
                <motion.div {...inView} variants={stagger}>
                  <motion.div variants={fadeUp} className="flex items-baseline gap-4 pb-6 mb-8 border-b border-[#e6e4f2]">
                    <span className="text-[13px] font-semibold text-[#4f46ff]">02</span>
                    <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em]"
                      style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                      스크린샷
                    </h2>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img, i) => (
                      <motion.div key={i} variants={fadeUp} className="relative rounded-2xl h-48 sm:h-56 overflow-hidden border border-[#e6e4f2] bg-[#f4f3ff]">
                        <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill className="object-cover"
                          placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#cfcbe8]"><FiImage size={28} /></div>} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1 space-y-6">

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}
                className="rounded-2xl border border-[#e6e4f2] bg-white p-6">
                <h2 className="text-[13px] font-semibold text-[#858594] mb-5">Tech Stack</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech, i) => (
                    <span key={tech} className={i % 2 === 0 ? 'tag tag-blue' : 'tag'}>
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* 팀원 */}
              {team.length > 0 && (
                <motion.div {...inView} variants={fadeUp}
                  className="rounded-2xl border border-[#e6e4f2] bg-white p-6">
                  <h2 className="text-[13px] font-semibold text-[#858594] mb-2">Team</h2>
                  <div className="divide-y divide-[#e6e4f2]">
                    {team.map(m => (
                      <Link key={m.id} href={`/team/${m.id}`}
                        className="group flex items-center gap-3 py-4 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#4f46ff] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-[14px] font-bold text-[#0f0f19] group-hover:text-[#4f46ff] truncate transition-colors">{m.name}</p>
                          <p className="text-[12px] text-[#5b5b6b] truncate">{m.role}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA — 볼드 블루 풀블리드 ── */}
      <section className="relative py-24 sm:py-32 bg-[#4f46ff] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] font-semibold text-white/80 mb-5">Contact</p>
              <h2 className="text-white font-extrabold tracking-[-0.035em] leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span></span>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block text-white/60">계획 중이신가요?</motion.span></span>
              </h2>
              <motion.p variants={fadeUp} className="text-lg text-white/75 max-w-md">
                게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
                무료 상담 신청
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
