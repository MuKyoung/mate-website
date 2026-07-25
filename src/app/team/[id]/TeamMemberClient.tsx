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
      <section className="bg-[#0a0a0a] pt-36 sm:pt-44 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
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
              <motion.p {...onMount} variants={fadeUp} className="text-[13px] text-white/35 mb-4">Team Member</motion.p>
              <motion.h1 {...onMount} variants={stagger}
                className="text-white font-semibold tracking-[-0.03em] leading-[1.05] mb-3"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{member.name}</motion.span></span>
              </motion.h1>
              <motion.p {...onMount} variants={fadeUp} className="text-[15px] text-white/55">{member.role}</motion.p>
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
                <p className="text-[13px] text-[#a1a1aa] mb-4">01 — 소개</p>
                <p className="text-[15px] text-[#52525b] leading-[1.75] max-w-2xl">{member.bio}</p>
              </motion.div>

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}>
                <p className="text-[13px] text-[#a1a1aa] mb-4">02 — 기술 스택</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="tag">{skill}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <p className="text-[13px] text-[#a1a1aa] mb-5">03 — 참여 프로젝트</p>
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
                className="p-6 rounded-sm border border-[#e4e4e4] bg-white sticky top-24">
                <p className="text-[13px] text-[#a1a1aa] mb-4">연락처</p>
                <div className="space-y-1">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-sm text-[#52525b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors">
                    <FiMail size={16} className="flex-shrink-0" />
                    <span className="text-[13px] break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-sm text-[#52525b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors">
                      <FiGithub size={16} className="flex-shrink-0" />
                      <span className="text-[13px]">GitHub 프로필</span>
                      <FiExternalLink size={12} className="ml-auto text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-sm text-[#52525b] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors">
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

      {/* ── CTA (DARK) — 좌측 정렬 ── */}
      <section className="py-24 sm:py-32 bg-[#0a0a0a] border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={fadeUp}>
              <p className="text-[13px] text-white/35 mb-5">Contact</p>
              <h2 className="text-white font-semibold tracking-[-0.03em] leading-[1.05]"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 3.25rem)' }}>
                함께 만들어볼까요?
              </h2>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors">
                프로젝트 문의
                <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
