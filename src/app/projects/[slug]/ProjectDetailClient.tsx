'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiClock, FiYoutube, FiImage, FiArrowRight } from 'react-icons/fi';
import ParallaxImage from '@/components/ParallaxImage';
import { fadeUp, revealUp, clipUp, stagger, inView, onMount } from '@/lib/motion';

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
      {/* ── 헤더 밴드 (쿨 그레이 그라데이션) ── */}
      <section className="relative bg-gradient-to-b from-[#f4f6f8] to-white pt-44 sm:pt-56 pb-20 sm:pb-28 border-b border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/projects"
              className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[#4e5968] hover:text-[#3182f6] transition-colors mb-10">
              <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
              프로젝트 목록
            </Link>
          </motion.div>

          {/* 메타 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-3.5 mb-7">
            <span className="px-4 py-1.5 rounded-full text-[14px] font-bold text-[#3182f6] bg-white border border-[#e5e8eb]">
              {project.category}
            </span>
            <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#6b7684]">
              <FiClock size={15} />
              {project.durationMonths}개월
            </span>
          </motion.div>

          <motion.h1 {...onMount} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-8 max-w-5xl"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]"><motion.span variants={clipUp} className="block">{project.title}</motion.span></span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp} className="text-xl sm:text-2xl text-[#4e5968] leading-[1.6] max-w-3xl mb-12">
            {project.description}
          </motion.p>

          {/* 액션 버튼 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
                <FiExternalLink size={19} />
                라이브 데모
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
                <FiYoutube size={20} />
                YouTube
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-16 px-10 rounded-2xl text-[17px] font-bold text-[#191f28] bg-white border border-[#d1d6db] hover:bg-[#f4f6f8] transition-colors">
                <FiGithub size={19} />
                GitHub
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-16 gap-x-10 lg:gap-x-16 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-24">

              {/* 영상 / 썸네일 — 대형 */}
              {project.youtubeUrl ? (
                <motion.div {...inView} variants={revealUp}
                  className="relative rounded-[32px] overflow-hidden aspect-video border border-[#e5e8eb] bg-[#f4f6f8]">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="absolute inset-0 w-full h-full" />
                </motion.div>
              ) : (
                <ParallaxImage
                  src={project.thumbnail}
                  alt={project.title}
                  className="aspect-[16/9]"
                  rounded="rounded-[32px]"
                  placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#d1d6db]"><FiImage size={64} /></div>}
                />
              )}

              {/* 프로젝트 개요 */}
              <motion.div {...inView} variants={stagger}>
                <motion.p variants={fadeUp} className="index-num mb-6">01 — Overview</motion.p>
                <motion.h2 variants={fadeUp} className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06] mb-9"
                  style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                  프로젝트 개요
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[17px] text-[#4e5968] leading-[1.85] whitespace-pre-line">{project.longDescription}</motion.p>
              </motion.div>

              {/* 갤러리 */}
              {project.images && project.images.length > 0 && (
                <motion.div {...inView} variants={stagger}>
                  <motion.div variants={fadeUp} className="pb-8 mb-12 border-b border-[#e5e8eb]">
                    <p className="index-num mb-6">02 — Gallery</p>
                    <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
                      style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                      스크린샷
                    </h2>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {project.images.map((img, i) => (
                      <ParallaxImage
                        key={i}
                        src={img}
                        alt={`${project.title} ${i + 1}`}
                        className="aspect-[16/9]"
                        rounded="rounded-[24px]"
                        placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#d1d6db]"><FiImage size={40} /></div>}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1 space-y-16">

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp} className="rule-top">
                <p className="index-num mb-6">Tech stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span key={tech} className={i % 2 === 0 ? 'tag tag-blue' : 'tag'}>
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* 팀원 */}
              {team.length > 0 && (
                <motion.div {...inView} variants={fadeUp} className="rule-top">
                  <p className="index-num mb-3">Team</p>
                  <div>
                    {team.map(m => (
                      <Link key={m.id} href={`/team/${m.id}`}
                        className="group flex items-center gap-4 py-5 border-b border-[#e5e8eb] transition-colors">
                        <div className="w-12 h-12 rounded-full bg-[#3182f6] flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-[17px] font-bold text-[#191f28] group-hover:text-[#3182f6] truncate transition-colors">{m.name}</p>
                          <p className="text-[14px] text-[#4e5968] truncate">{m.role}</p>
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

      {/* ── 초대형 중앙 CTA (devigns 패턴) ── */}
      <section className="py-40 sm:py-56 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-10 max-w-6xl mx-auto"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">계획 중이신가요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp}
            className="text-xl text-[#4e5968] leading-[1.75] max-w-2xl mx-auto mb-14">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-3 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
              문의하기
              <FiArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
