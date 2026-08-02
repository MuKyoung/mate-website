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
      {/* ── 헤더 (라이트 라벤더) ── */}
      <section className="relative bg-[#f4f3ff] pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/team"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5b5b6b] hover:text-[#4f46ff] mb-10 transition-colors">
              <FiArrowLeft size={14} />
              팀 목록으로
            </Link>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-7">
            {/* 아바타 */}
            <motion.div {...onMount} variants={fadeUp}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 bg-[#ecebff] ring-4 ring-white shadow-[0_8px_28px_-8px_rgba(79,70,255,0.35)]">
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
                placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#4f46ff]"><FiUser size={40} /></div>} />
            </motion.div>
            {/* 이름 / 역할 / 소개 */}
            <div>
              <motion.p {...onMount} variants={fadeUp} className="eyebrow text-[#4f46ff] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#4f46ff]" />
                Team Member
              </motion.p>
              <motion.h1 {...onMount} variants={stagger}
                className="text-[#0f0f19] font-extrabold tracking-[-0.035em] leading-[1.02] mb-3"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)' }}>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{member.name}</motion.span></span>
              </motion.h1>
              <motion.p {...onMount} variants={fadeUp} className="text-[16px] text-[#4f46ff] font-bold mb-4">{member.role}</motion.p>
              <motion.p {...onMount} variants={fadeUp} className="text-[15px] text-[#5b5b6b] leading-[1.75] max-w-xl">{member.bio}</motion.p>
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
              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}>
                <p className="text-[13px] font-semibold text-[#4f46ff] mb-4">01 — 기술 스택</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="tag-blue">{skill}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <p className="text-[13px] font-semibold text-[#4f46ff] mb-5">02 — 참여 프로젝트</p>
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
                className="p-6 rounded-2xl border border-[#e6e4f2] bg-white sticky top-24">
                <p className="text-[13px] font-semibold text-[#4f46ff] mb-4">연락처</p>
                <div className="space-y-1">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-xl text-[#5b5b6b] hover:text-[#4f46ff] hover:bg-[#ecebff] transition-colors">
                    <FiMail size={16} className="flex-shrink-0" />
                    <span className="text-[13px] break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-xl text-[#5b5b6b] hover:text-[#4f46ff] hover:bg-[#ecebff] transition-colors">
                      <FiGithub size={16} className="flex-shrink-0" />
                      <span className="text-[13px]">GitHub 프로필</span>
                      <FiExternalLink size={12} className="ml-auto text-[#b3b3c2] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-xl text-[#5b5b6b] hover:text-[#4f46ff] hover:bg-[#ecebff] transition-colors">
                      <FiLinkedin size={16} className="flex-shrink-0" />
                      <span className="text-[13px]">LinkedIn 프로필</span>
                      <FiExternalLink size={12} className="ml-auto text-[#b3b3c2] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA — 볼드 블루 풀블리드 ── */}
      <section className="relative py-24 sm:py-32 bg-[#4f46ff] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={fadeUp}>
              <p className="text-[13px] font-semibold text-white/80 mb-5">Contact</p>
              <h2 className="text-white font-extrabold tracking-[-0.035em] leading-[1.05]"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 3.25rem)' }}>
                함께 만들어볼까요?
              </h2>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
                프로젝트 문의
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
