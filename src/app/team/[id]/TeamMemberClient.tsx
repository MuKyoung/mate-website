'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';

interface TeamMemberClientProps {
  params: { id: string };
}

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find((m) => m.id === params.id);
  if (!member) notFound();

  const memberProjects = projects.filter((p) => member.projects.includes(p.id));

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/team"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white mb-8 transition-colors text-sm">
            <FiArrowLeft size={14} />
            팀으로 돌아가기
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border border-white/[0.1] shadow-2xl flex-shrink-0"
            >
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-xl"
                placeholder={
                  <div className="absolute inset-0 flex items-center justify-center text-6xl bg-[#3b82f6]">👤</div>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="flex-1 text-center md:text-left"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1.5">{member.name}</h1>
              <p className="text-base text-[#60a5fa] font-medium mb-4">{member.role}</p>
              <p className="text-sm sm:text-base text-white/40 max-w-2xl leading-relaxed">{member.bio}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55 }}
                className="p-6 sm:p-7 rounded-xl border"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              >
                <h2 className="text-base font-semibold text-white mb-5">기술 스택</h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, idx) => (
                    <motion.span key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.04 }}
                      className="tag tag-blue"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Projects */}
              {memberProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-base font-semibold text-white mb-5">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl border sticky top-24"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
              >
                <h2 className="text-sm font-semibold text-white mb-4">연락처</h2>
                <div className="space-y-3">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center text-white/40 hover:text-[#60a5fa] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-blue-500/[0.1] transition-colors">
                      <FiMail size={14} />
                    </div>
                    <span className="text-xs break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/40 hover:text-white transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-white/[0.1] transition-colors">
                        <FiGithub size={14} />
                      </div>
                      <span className="text-xs">GitHub 프로필</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center text-white/40 hover:text-[#60a5fa] transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-blue-500/[0.1] transition-colors">
                        <FiLinkedin size={14} />
                      </div>
                      <span className="text-xs">LinkedIn 프로필</span>
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
