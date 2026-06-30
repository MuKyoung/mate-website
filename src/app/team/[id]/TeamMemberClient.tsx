'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft, FiExternalLink, FiUser } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';
import { fadeUp, inView } from '@/lib/motion';

interface TeamMemberClientProps { params: { id: string } }

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find(m => m.id === params.id);
  if (!member) notFound();

  const memberProjects = projects.filter(p => member.projects.includes(p.id));

  return (
    <>
      {/* ── 헤더 (surface) ── */}
      <section className="bg-[#f7f7f7] border-b border-[#e1e1e1] pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/team"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#5d5d5d] hover:text-[#262626] mb-8 transition-colors">
            <FiArrowLeft size={13} />
            팀 목록으로
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.6, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* 아바타 */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#e1e1e1] flex-shrink-0 bg-[#f7f7f7]">
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
                placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#a3a3a3]"><FiUser size={30} /></div>} />
            </div>
            {/* 이름 / 역할 */}
            <div>
              <span className="section-label mb-2">Team Member</span>
              <h1 className="heading-lg mb-1">{member.name}</h1>
              <p className="text-[15px] text-[#2a72e5] font-medium">{member.role}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-12">
              {/* 소개 */}
              <motion.div {...inView} variants={fadeUp}>
                <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-3">소개</h2>
                <p className="text-[15px] text-[#4c4c4c] leading-relaxed max-w-2xl">{member.bio}</p>
              </motion.div>

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}>
                <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-3">기술 스택</h2>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span key={skill} className="tag tag-blue">{skill}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-4">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memberProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 사이드바 — 연락처 */}
            <div className="lg:col-span-1">
              <motion.div {...inView} variants={fadeUp}
                className="p-5 rounded-xl border border-[#e1e1e1] bg-white sticky top-24">
                <h2 className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] mb-4">연락처</h2>
                <div className="space-y-1">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg text-[#5d5d5d] hover:text-[#262626] hover:bg-[#f7f7f7] transition-colors">
                    <FiMail size={15} className="flex-shrink-0" />
                    <span className="text-[13px] break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg text-[#5d5d5d] hover:text-[#262626] hover:bg-[#f7f7f7] transition-colors">
                      <FiGithub size={15} className="flex-shrink-0" />
                      <span className="text-[13px]">GitHub 프로필</span>
                      <FiExternalLink size={11} className="ml-auto text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg text-[#5d5d5d] hover:text-[#2a72e5] hover:bg-[#f7f7f7] transition-colors">
                      <FiLinkedin size={15} className="flex-shrink-0" />
                      <span className="text-[13px]">LinkedIn 프로필</span>
                      <FiExternalLink size={11} className="ml-auto text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
