'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { summarizeDepartments } from '@/data/organization';
import { FiExternalLink, FiGithub, FiArrowLeft, FiYoutube, FiImage, FiArrowUpRight } from 'react-icons/fi';
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

  const team = summarizeDepartments(project.teamMembers);

  return (
    <>
      {/* ── 헤더 — 다크 + 하단 헤어라인 ── */}
      <section className="pt-40 sm:pt-52 pb-16 sm:pb-24 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp} className="mb-12 sm:mb-16">
            <Link href="/projects"
              className="group inline-flex items-center gap-2 text-[15px] font-semibold text-white/55 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-colors">
              <FiArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
              프로젝트 목록
            </Link>
          </motion.div>

          {/* 메타 — 카테고리 · 기간 */}
          <motion.p {...onMount} variants={fadeUp} className="index-num mb-7">
            {project.category} · {project.durationMonths}개월
          </motion.p>

          <motion.h1 {...onMount} variants={stagger}
            className="text-[#f5f6f7] font-extrabold tracking-[-0.05em] leading-[0.96] mb-8 sm:mb-10 max-w-5xl"
            style={{ fontSize: 'clamp(2.5rem, 9vw, 7.5rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">{project.title}</motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="text-xl sm:text-2xl text-white/55 leading-[1.65] max-w-3xl mb-12 sm:mb-14">
            {project.description}
          </motion.p>

          {/* 액션 — 화이트 필 / 아웃라인 / 언더라인 링크 */}
          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-x-8 gap-y-5">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
                <FiExternalLink size={17} />
                라이브 데모
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-white border border-white/20 hover:border-white transition-colors duration-300">
                <FiYoutube size={18} className="text-[#ff0000]" />
                YouTube
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-white/55 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-colors">
                <FiGithub size={16} />
                GitHub
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-20 gap-x-10 lg:gap-x-16 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-24 sm:space-y-28">

              {/* 영상 / 썸네일 — 대형 */}
              {project.youtubeUrl ? (
                <motion.div {...inView} variants={revealUp}
                  className="relative rounded-[16px] overflow-hidden aspect-video bg-[#1d2024]">
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
                  rounded="rounded-[16px]"
                  placeholder={<div className="absolute inset-0 flex items-center justify-center text-white/20"><FiImage size={64} /></div>}
                />
              )}

              {/* (01) Overview */}
              <motion.div {...inView} variants={stagger}>
                <motion.div variants={fadeUp}
                  className="pb-6 border-b border-white/10 mb-10 sm:mb-14">
                  <p className="index-num font-en">(01) Overview</p>
                </motion.div>
                <motion.h2 variants={fadeUp}
                  className="text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[1.04] mb-9"
                  style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
                  프로젝트 개요
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[17px] text-white/55 leading-[1.85] whitespace-pre-line">
                  {project.longDescription}
                </motion.p>
              </motion.div>

              {/* (02) Gallery */}
              {project.images && project.images.length > 0 && (
                <motion.div {...inView} variants={stagger}>
                  <motion.div variants={fadeUp}
                    className="pb-6 border-b border-white/10 mb-10 sm:mb-14">
                    <p className="index-num font-en">(02) Gallery</p>
                  </motion.div>
                  <motion.h2 variants={fadeUp}
                    className="text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[1.04] mb-10 sm:mb-12"
                    style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
                    스크린샷
                  </motion.h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {project.images.map((img, i) => (
                      <ParallaxImage
                        key={i}
                        src={img}
                        alt={`${project.title} ${i + 1}`}
                        className="aspect-[16/9]"
                        rounded="rounded-xl"
                        placeholder={<div className="absolute inset-0 flex items-center justify-center text-white/20"><FiImage size={40} /></div>}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 — 룰탑 블록 */}
            <div className="lg:col-span-1 space-y-16">

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp} className="rule-top">
                <p className="index-num font-en mb-6">Tech stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tag">{tech}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 조직 — 실명 대신 부서 구성만 표시 */}
              {team.length > 0 && (
                <motion.div {...inView} variants={fadeUp} className="rule-top">
                  <p className="index-num font-en mb-3">Team</p>
                  <p className="text-[17px] font-bold text-[#f5f6f7] mb-5">
                    참여 인원 {project.teamMembers.length}명
                  </p>
                  <div>
                    {team.map(d => (
                      <div key={d.id}
                        className="flex items-center justify-between gap-4 py-5 border-b border-white/10">
                        <div className="min-w-0">
                          <p className="text-[16px] font-bold text-[#f5f6f7]">{d.name}</p>
                          <p className="text-[14px] text-white/55">{d.label}</p>
                        </div>
                        <span className="text-2xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.03em] flex-shrink-0">
                          {d.count}
                          <span className="text-[13px] font-bold text-white/30 ml-1">명</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── (03) CTA ── */}
      <section className="py-32 sm:py-48 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num font-en mb-10">(03) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[0.98] mb-8"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block">Let&apos;s build</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">together</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="caption-kr mb-14 sm:mb-20">
            — 비슷한 프로젝트를 계획 중이신가요? 게임 · 웹 · 앱 · AR/VR, 무료 상담으로 가능성을 확인하세요
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
              문의하기
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-white/60 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
