'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft, FiArrowRight, FiExternalLink, FiUser } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';
import { fadeUp, clipUp, stagger, inView, onMount } from '@/lib/motion';

interface TeamMemberClientProps { params: { id: string } }

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find(m => m.id === params.id);
  if (!member) notFound();

  const memberProjects = projects.filter(p => member.projects.includes(p.id));

  return (
    <>
      {/* ── 헤더 (DARK) ── */}
      <section className="relative bg-[#0a0a0a] overflow-hidden pt-36 sm:pt-44 pb-16 sm:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/3 right-0 w-[55vw] h-[55vw] rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/team"
              className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white mb-10 transition-colors">
              <FiArrowLeft size={14} />
              팀 목록으로
            </Link>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* 아바타 */}
            <motion.div {...onMount} variants={fadeUp}
              className="relative w-24 h-24 rounded-full overflow-hidden border border-white/15 flex-shrink-0 bg-white/[0.04]">
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
                placeholder={<div className="absolute inset-0 flex items-center justify-center text-white/40"><FiUser size={34} /></div>} />
            </motion.div>
            {/* 이름 / 역할 */}
            <div>
              <motion.span {...onMount} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-4">Team Member</motion.span>
              <motion.h1 {...onMount} variants={stagger} className="display-section text-white mb-3">
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{member.name}</motion.span></span>
              </motion.h1>
              <motion.p {...onMount} variants={fadeUp} className="text-lg text-[#5b9bff] font-medium">{member.role}</motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-14">
              {/* 소개 */}
              <motion.div {...inView} variants={fadeUp}>
                <h2 className="eyebrow text-[#2a72e5] mb-5">소개</h2>
                <p className="text-lg text-[#52525b] leading-relaxed max-w-2xl">{member.bio}</p>
              </motion.div>

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}>
                <h2 className="eyebrow text-[#2a72e5] mb-5">기술 스택</h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="tag tag-blue">{skill}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <h2 className="eyebrow text-[#2a72e5] mb-6">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                className="p-6 rounded-2xl border border-[#e4e4e4] bg-white sticky top-24">
                <h2 className="eyebrow text-[#2a72e5] mb-5">연락처</h2>
                <div className="space-y-1">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-lg text-[#52525b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors">
                    <FiMail size={16} className="flex-shrink-0" />
                    <span className="text-[13px] break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-lg text-[#52525b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors">
                      <FiGithub size={16} className="flex-shrink-0" />
                      <span className="text-[13px]">GitHub 프로필</span>
                      <FiExternalLink size={12} className="ml-auto text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-lg text-[#52525b] hover:text-[#2a72e5] hover:bg-[#f5f5f5] transition-colors">
                      <FiLinkedin size={16} className="flex-shrink-0" />
                      <span className="text-[13px]">LinkedIn 프로필</span>
                      <FiExternalLink size={12} className="ml-auto text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA (DARK) ── */}
      <section className="relative py-24 sm:py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger} className="display-section text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">함께 만들어볼까요?</motion.span></span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              프로젝트 문의
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
