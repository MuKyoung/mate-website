'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';

interface TeamMemberClientProps { params: { id: string } }

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find(m => m.id === params.id);
  if (!member) notFound();

  const memberProjects = projects.filter(p => member.projects.includes(p.id));

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── 페이지 헤더 ── */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/team"
            className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 mb-6 transition-colors text-xs">
            <FiArrowLeft size={12} />
            팀 목록으로
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* 프로필 이미지 */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border flex-shrink-0"
              style={{ background: '#3b82f6', borderColor: 'var(--border)' }}>
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-xl"
                placeholder={<div className="absolute inset-0 flex items-center justify-center text-2xl">👤</div>} />
            </div>
            {/* 이름/역할 */}
            <div>
              <span className="section-label mb-1">Team Member</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{member.name}</h1>
              <p className="text-sm text-[#60a5fa]">{member.role}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="py-10 sm:py-12" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-6">

              {/* 소개 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">{member.bio}</p>
              </motion.div>

              {/* 기술 스택 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">기술 스택</h2>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill, idx) => (
                    <motion.span key={skill}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + idx * 0.03 }}
                      className="tag tag-blue">{skill}</motion.span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}>
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memberProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="p-5 rounded-xl border sticky top-24"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">연락처</h2>
                <div className="space-y-3">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3 text-white/40 hover:text-white/75 transition-colors group text-sm">
                    <FiMail size={14} />
                    <span className="text-xs break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/40 hover:text-white/75 transition-colors group text-sm">
                      <FiGithub size={14} />
                      <span className="text-xs">GitHub 프로필</span>
                      <FiExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/40 hover:text-[#60a5fa] transition-colors group text-sm">
                      <FiLinkedin size={14} />
                      <span className="text-xs">LinkedIn 프로필</span>
                      <FiExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
