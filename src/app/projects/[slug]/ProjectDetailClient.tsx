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
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface ProjectDetailClientProps {
  params: { slug: string };
}

export default function ProjectDetailClient({ params }: ProjectDetailClientProps) {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) notFound();

  const projectTeamMembers = teamMembers.filter((m) => project.teamMembers.includes(m.id));

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/projects"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white mb-8 transition-colors text-sm">
            <FiArrowLeft size={14} />
            프로젝트로 돌아가기
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{project.title}</h1>
            <p className="text-sm sm:text-base text-white/40 mb-6 max-w-3xl leading-relaxed">{project.description}</p>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1.5 rounded-md text-white/60 text-xs border border-white/[0.1] bg-white/[0.04]">
                {project.category}
              </span>
              <div className="flex items-center text-white/35 text-sm">
                <FiClock className="mr-1.5" size={13} />
                개발 기간: {project.durationMonths}개월
              </div>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-[#3b82f6] text-white rounded-md text-xs font-medium hover:bg-[#2563eb] transition-colors">
                  <FiExternalLink className="mr-1.5" size={12} />
                  라이브 데모
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-white/60 rounded-md text-xs font-medium border border-white/[0.08] hover:bg-white/[0.05] hover:text-white transition-all">
                  <FiGithub className="mr-1.5" size={12} />
                  GitHub
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors">
                  <FiYoutube className="mr-1.5" size={12} />
                  YouTube
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              {/* Video / Image */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                {project.youtubeUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-white/[0.08] bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl h-72 sm:h-96 overflow-hidden border border-white/[0.08]"
                    style={{ background: 'var(--background)' }}>
                    <SafeImage src={project.thumbnail} alt={project.title} fill className="rounded-xl"
                      placeholder={
                        <div className="absolute inset-0 flex items-center justify-center text-8xl text-white/10">🎮</div>
                      }
                    />
                  </div>
                )}
              </motion.div>

              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl border"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold text-white mb-4">프로젝트 개요</h2>
                <p className="text-white/45 text-sm leading-relaxed whitespace-pre-line">{project.longDescription}</p>
              </motion.div>

              {/* Gallery */}
              {project.images && project.images.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-xl border"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <h2 className="text-sm font-semibold text-white mb-5">프로젝트 이미지</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.images.map((image, index) => (
                      <div key={index}
                        className="relative rounded-lg h-44 overflow-hidden border border-white/[0.06]"
                        style={{ background: 'var(--surface)' }}>
                        <SafeImage src={image} alt={`${project.title} - 이미지 ${index + 1}`} fill className="rounded-lg"
                          placeholder={<div className="absolute inset-0 flex items-center justify-center text-4xl text-white/10">📷</div>}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Tech Stack */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl border"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-4">기술 스택</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tag tag-blue">{tech}</span>
                  ))}
                </div>
              </motion.div>

              {/* Team Members */}
              {projectTeamMembers.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-5 rounded-xl border"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                  <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-4">팀원</h2>
                  <div className="space-y-2">
                    {projectTeamMembers.map((member) => (
                      <Link key={member.id} href={`/team/${member.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-[#3b82f6] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-[#60a5fa] transition-colors">{member.name}</p>
                          <p className="text-xs text-white/35">{member.role}</p>
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
