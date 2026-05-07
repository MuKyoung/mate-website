'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiClock, FiYoutube } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';

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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── 페이지 헤더 ── */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/projects"
            className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 mb-6 transition-colors text-xs">
            <FiArrowLeft size={12} />
            프로젝트 목록
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}>
            <span className="section-label mb-3">Project</span>
            <h1 className="heading-lg text-white mb-3">{project.title}</h1>
            <p className="text-white/40 text-sm max-w-xl leading-relaxed mb-5">{project.description}</p>

            {/* 메타 배지 */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border text-white/50"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                {project.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border text-white/40"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <FiClock size={10} />
                {project.durationMonths}개월
              </span>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors">
                  <FiExternalLink size={10} />
                  라이브 데모
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/50 border hover:text-white hover:bg-white/[0.04] transition-all"
                  style={{ borderColor: 'var(--border)' }}>
                  <FiGithub size={10} />
                  GitHub
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  <FiYoutube size={10} />
                  YouTube
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="py-10 sm:py-12" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-5">

              {/* 영상 / 썸네일 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}>
                {project.youtubeUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border"
                    style={{ background: '#000', borderColor: 'var(--border)' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : (
                  <div className="relative rounded-xl h-64 sm:h-80 overflow-hidden border"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                    <SafeImage src={project.thumbnail} alt={project.title} fill className="rounded-xl object-cover"
                      placeholder={<div className="absolute inset-0 flex items-center justify-center text-6xl text-white/10">🎮</div>} />
                  </div>
                )}
              </motion.div>

              {/* 프로젝트 개요 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-5 rounded-xl border"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">프로젝트 개요</h2>
                <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{project.longDescription}</p>
              </motion.div>

              {/* 갤러리 */}
              {project.images && project.images.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="p-5 rounded-xl border"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">스크린샷</h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {project.images.map((img, i) => (
                      <div key={i} className="relative rounded-lg h-36 sm:h-44 overflow-hidden border"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                        <SafeImage src={img} alt={`${project.title} ${i + 1}`} fill className="rounded-lg object-cover"
                          placeholder={<div className="absolute inset-0 flex items-center justify-center text-3xl text-white/10">📷</div>} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1 space-y-4">

              {/* 기술 스택 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-5 rounded-xl border"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">기술 스택</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map(tech => (
                    <span key={tech} className="tag tag-blue">{tech}</span>
                  ))}
                </div>
              </motion.div>

              {/* 팀원 */}
              {team.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="p-5 rounded-xl border"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">팀원</h2>
                  <div className="space-y-1.5">
                    {team.map(m => (
                      <Link key={m.id} href={`/team/${m.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/75 group-hover:text-[#60a5fa] transition-colors truncate">{m.name}</p>
                          <p className="text-[11px] text-white/30 truncate">{m.role}</p>
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
    </div>
  );
}
