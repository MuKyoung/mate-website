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
      {/* ── 헤더 밴드 (DARK) ── */}
      <section className="relative bg-[#0a0a0a] overflow-hidden pt-36 sm:pt-44 pb-16 sm:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/3 right-0 w-[55vw] h-[55vw] rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/projects"
              className="inline-flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition-colors mb-8">
              <FiArrowLeft size={13} />
              프로젝트 목록
            </Link>
          </motion.div>

          {/* 메타 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium text-[#5b9bff] bg-white/5 border border-white/10">
              {project.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] on-dark-2">
              <FiClock size={12} />
              {project.durationMonths}개월
            </span>
          </motion.div>

          <motion.h1 {...onMount} variants={stagger} className="display-section text-white mb-6 max-w-4xl">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{project.title}</motion.span></span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp} className="text-lg on-dark-2 leading-relaxed max-w-2xl mb-9">
            {project.description}
          </motion.p>

          {/* 액션 버튼 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-full text-[14px] font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
                <FiExternalLink size={14} />
                라이브 데모
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[14px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                <FiYoutube size={15} />
                YouTube
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[14px] font-medium text-white border border-white/25 hover:border-white/60 hover:bg-white/5 transition-colors">
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
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#e4e4e4] bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <div className="relative rounded-2xl h-72 sm:h-96 overflow-hidden border border-[#e4e4e4] bg-[#f5f5f5]">
                    <SafeImage src={project.thumbnail} alt={project.title} fill className="object-cover"
                      placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#a1a1aa]"><FiImage size={48} /></div>} />
                  </div>
                )}
              </motion.div>

              {/* 프로젝트 개요 */}
              <motion.div {...inView} variants={stagger}>
                <motion.span variants={fadeUp} className="eyebrow text-[#2a72e5] mb-5">Overview</motion.span>
                <motion.h2 variants={stagger} className="display-section text-[#0a0a0a] mb-6">
                  <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">프로젝트 개요</motion.span></span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-[#52525b] leading-relaxed whitespace-pre-line">{project.longDescription}</motion.p>
              </motion.div>

              {/* 갤러리 */}
              {project.images && project.images.length > 0 && (
                <motion.div {...inView} variants={stagger}>
                  <motion.span variants={fadeUp} className="eyebrow text-[#2a72e5] mb-5">Gallery</motion.span>
                  <motion.h2 variants={stagger} className="display-section text-[#0a0a0a] mb-8">
                    <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">스크린샷</motion.span></span>
                  </motion.h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img, i) => (
                      <motion.div key={i} variants={fadeUp} className="relative rounded-2xl h-48 sm:h-56 overflow-hidden border border-[#e4e4e4] bg-[#f5f5f5]">
                        <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill className="object-cover"
                          placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#a1a1aa]"><FiImage size={28} /></div>} />
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
                className="rounded-2xl border border-[#e4e4e4] bg-white p-6">
                <h2 className="eyebrow text-[#a1a1aa] mb-5">Tech Stack</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map(tech => (
                    <span key={tech} className="tag tag-blue">{tech}</span>
                  ))}
                </div>
              </motion.div>

              {/* 팀원 */}
              {team.length > 0 && (
                <motion.div {...inView} variants={fadeUp}
                  className="rounded-2xl border border-[#e4e4e4] bg-white p-6">
                  <h2 className="eyebrow text-[#a1a1aa] mb-2">Team</h2>
                  <div className="divide-y divide-[#e4e4e4]">
                    {team.map(m => (
                      <Link key={m.id} href={`/team/${m.id}`}
                        className="group flex items-center gap-3 py-4 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 group-hover:bg-[#2a72e5] transition-colors">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-[14px] font-semibold text-[#0a0a0a] group-hover:text-[#2a72e5] transition-colors truncate">{m.name}</p>
                          <p className="text-[12px] text-[#52525b] truncate">{m.role}</p>
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

      {/* ── CTA (DARK) ── */}
      <section className="relative py-28 sm:py-40 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6 justify-center">Contact</motion.span>
          <motion.h2 {...inView} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span></span>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">계획 중이신가요?</motion.span></span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg mb-10 max-w-lg mx-auto">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              무료 상담 신청
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
