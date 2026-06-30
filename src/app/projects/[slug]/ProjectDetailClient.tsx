'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiClock, FiYoutube, FiImage, FiArrowRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { fadeUp, fade, inView, easeEnter } from '@/lib/motion';

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
      {/* ── 헤더 밴드 (surface) ── */}
      <section className="bg-[#f7f7f7] border-b border-[#e1e1e1] pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/projects"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#4c4c4c] hover:text-[#262626] transition-colors mb-7">
            <FiArrowLeft size={13} />
            프로젝트 목록
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: easeEnter }}
            className="max-w-3xl"
          >
            {/* 메타 */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium tag-blue">
                {project.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5d5d5d]">
                <FiClock size={12} />
                {project.durationMonths}개월
              </span>
            </div>

            <h1 className="heading-lg mb-4">{project.title}</h1>
            <p className="text-[15px] text-[#4c4c4c] leading-relaxed mb-7">{project.description}</p>

            {/* 액션 버튼 */}
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
                  <FiExternalLink size={14} />
                  라이브 데모
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  <FiYoutube size={15} />
                  YouTube
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-[#262626] bg-white border border-[#c6c6c6] hover:bg-[#f0f0f0] transition-colors">
                  <FiGithub size={14} />
                  GitHub
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-10">

              {/* 영상 / 썸네일 */}
              <motion.div {...inView} variants={fadeUp}>
                {project.youtubeUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-[#e1e1e1] bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <div className="relative rounded-xl h-64 sm:h-80 overflow-hidden border border-[#e1e1e1] bg-[#f7f7f7]">
                    <SafeImage src={project.thumbnail} alt={project.title} fill className="object-cover"
                      placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#c6c6c6]"><FiImage size={48} /></div>} />
                  </div>
                )}
              </motion.div>

              {/* 프로젝트 개요 */}
              <motion.div {...inView} variants={fadeUp}>
                <p className="section-label mb-4">Overview</p>
                <h2 className="text-[15px] font-bold text-[#262626] mb-4">프로젝트 개요</h2>
                <p className="text-[15px] text-[#4c4c4c] leading-relaxed whitespace-pre-line">{project.longDescription}</p>
              </motion.div>

              {/* 갤러리 */}
              {project.images && project.images.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <p className="section-label mb-4">Gallery</p>
                  <h2 className="text-[15px] font-bold text-[#262626] mb-5">스크린샷</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {project.images.map((img, i) => (
                      <div key={i} className="relative rounded-xl h-40 sm:h-48 overflow-hidden border border-[#e1e1e1] bg-[#f7f7f7]">
                        <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill className="object-cover"
                          placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#c6c6c6]"><FiImage size={28} /></div>} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1 space-y-8">

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}
                className="rounded-xl border border-[#e1e1e1] bg-white p-5">
                <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-4">기술 스택</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map(tech => (
                    <span key={tech} className="tag tag-blue">{tech}</span>
                  ))}
                </div>
              </motion.div>

              {/* 팀원 */}
              {team.length > 0 && (
                <motion.div {...inView} variants={fadeUp}
                  className="rounded-xl border border-[#e1e1e1] bg-white p-5">
                  <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-2">팀원</h2>
                  <div className="divide-y divide-[#e1e1e1]">
                    {team.map(m => (
                      <Link key={m.id} href={`/team/${m.id}`}
                        className="group flex items-center gap-3 py-3 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-[#2a72e5] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-[14px] font-semibold text-[#262626] group-hover:text-[#2a72e5] transition-colors truncate">{m.name}</p>
                          <p className="text-[12px] text-[#5d5d5d] truncate">{m.role}</p>
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

      {/* ── CTA (다크 마케팅 밴드) ── */}
      <section className="bg-[#262626]">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <motion.div {...inView} variants={fade}>
              <p className="text-xs text-white/45 uppercase tracking-[0.16em] mb-3">Contact</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                비슷한 프로젝트를 계획 중이신가요?
              </h2>
              <p className="text-white/55 text-[15px]">게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.</p>
            </motion.div>
            <motion.div {...inView} variants={fade} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-lg font-medium text-white text-[15px] bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
                무료 상담 신청
                <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
