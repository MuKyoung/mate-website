'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft, FiArrowRight, FiExternalLink, FiUser } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';
import { fadeUp, revealUp, clipUp, stagger, inView, onMount } from '@/lib/motion';

interface TeamMemberClientProps { params: { id: string } }

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find(m => m.id === params.id);
  if (!member) notFound();

  const memberProjects = projects.filter(p => member.projects.includes(p.id));

  return (
    <>
      {/* ── 헤더 (쿨 그레이 그라데이션) ── */}
      <section className="relative bg-gradient-to-b from-[#f4f6f8] to-white pt-40 sm:pt-52 pb-20 sm:pb-28 border-b border-[#e5e8eb]">
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div {...onMount} variants={fadeUp}>
            <Link href="/team"
              className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[#4e5968] hover:text-[#3182f6] mb-14 transition-colors">
              <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
              팀 목록으로
            </Link>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
            {/* 아바타 */}
            <motion.div {...onMount} variants={fadeUp}
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden flex-shrink-0 bg-[#e8f3ff] ring-4 ring-white shadow-[0_12px_32px_rgba(25,31,40,0.12)]">
              <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
                placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#3182f6]"><FiUser size={56} /></div>} />
            </motion.div>
            {/* 이름 / 역할 / 소개 */}
            <div>
              <motion.p {...onMount} variants={fadeUp} className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-[#3182f6] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3182f6]" />
                Team Member
              </motion.p>
              <motion.h1 {...onMount} variants={stagger}
                className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-5"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                <span className="block overflow-hidden pb-[0.08em]"><motion.span variants={clipUp} className="block">{member.name}</motion.span></span>
              </motion.h1>
              <motion.p {...onMount} variants={fadeUp} className="text-xl sm:text-2xl font-semibold text-[#3182f6]">{member.role}</motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 (white) ── */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 max-w-6xl">

            {/* 메인 */}
            <div className="lg:col-span-2 space-y-20">
              {/* 소개 */}
              <motion.div {...inView} variants={revealUp}>
                <p className="index-num mb-6">01 — 소개</p>
                <p className="text-[17px] sm:text-xl text-[#4e5968] leading-[1.85]">{member.bio}</p>
              </motion.div>

              {/* 기술 스택 */}
              <motion.div {...inView} variants={fadeUp}>
                <p className="index-num mb-6">02 — 기술 스택</p>
                <div className="flex flex-wrap gap-2.5">
                  {member.skills.map((skill) => (
                    <span key={skill} className="tag-blue">{skill}</span>
                  ))}
                </div>
              </motion.div>

              {/* 참여 프로젝트 */}
              {memberProjects.length > 0 && (
                <motion.div {...inView} variants={fadeUp}>
                  <p className="index-num mb-6">03 — 참여 프로젝트</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
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
                className="p-8 sm:p-10 rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] sticky top-28">
                <p className="index-num mb-6">연락처</p>
                <div className="space-y-1.5">
                  <a href={`mailto:${member.email}`}
                    className="flex items-center gap-3.5 -mx-3 px-3 py-3.5 rounded-2xl text-[#4e5968] hover:text-[#3182f6] hover:bg-[#e8f3ff] transition-colors">
                    <FiMail size={19} className="flex-shrink-0" />
                    <span className="text-[15px] break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 -mx-3 px-3 py-3.5 rounded-2xl text-[#4e5968] hover:text-[#3182f6] hover:bg-[#e8f3ff] transition-colors">
                      <FiGithub size={19} className="flex-shrink-0" />
                      <span className="text-[15px]">GitHub 프로필</span>
                      <FiExternalLink size={14} className="ml-auto text-[#adb5bd] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 -mx-3 px-3 py-3.5 rounded-2xl text-[#4e5968] hover:text-[#3182f6] hover:bg-[#e8f3ff] transition-colors">
                      <FiLinkedin size={19} className="flex-shrink-0" />
                      <span className="text-[15px]">LinkedIn 프로필</span>
                      <FiExternalLink size={14} className="ml-auto text-[#adb5bd] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 초대형 중앙 CTA ── */}
      <section className="py-40 sm:py-56 bg-white border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-14 max-w-6xl mx-auto"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">함께 만들어볼까요?</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-3 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
              문의하기
              <FiArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
