'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TeamMember } from '@/types';
import { FiGithub, FiLinkedin, FiMail, FiUser, FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { easeEnter } from '@/lib/motion';

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: (index % 3) * 0.12, duration: 1.05, ease: easeEnter }}
      className="group h-full flex flex-col rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <Link href={`/team/${member.id}`} className="block flex-1 p-8 sm:p-10">
        {/* 아바타 + 화살표 */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-[#e8f3ff]">
            <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
              placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#3182f6]"><FiUser size={38} /></div>}
            />
          </div>
          <FiArrowUpRight size={22}
            className="flex-shrink-0 mt-1 text-[#adb5bd] group-hover:text-[#3182f6] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
        </div>

        {/* 이름 / 역할 */}
        <h3 className="text-[24px] sm:text-[28px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2]">
          {member.name}
        </h3>
        <p className="text-[16px] font-semibold text-[#3182f6] mt-2">{member.role}</p>

        <p className="text-[15px] text-[#4e5968] mt-6 line-clamp-3 leading-[1.75]">{member.bio}</p>

        <div className="flex flex-wrap gap-2 mt-8">
          {member.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="tag-blue">{skill}</span>
          ))}
          {member.skills.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-[#e5e8eb] px-3 py-1 text-[13px] font-medium text-[#4e5968]">
              +{member.skills.length - 3}
            </span>
          )}
        </div>
      </Link>

      <div className="flex gap-5 px-8 sm:px-10 py-6 border-t border-[#e5e8eb]">
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer"
            className="text-[#adb5bd] hover:text-[#3182f6] transition-colors" aria-label="GitHub">
            <FiGithub size={19} />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
            className="text-[#adb5bd] hover:text-[#3182f6] transition-colors" aria-label="LinkedIn">
            <FiLinkedin size={19} />
          </a>
        )}
        <a href={`mailto:${member.email}`}
          className="text-[#adb5bd] hover:text-[#3182f6] transition-colors" aria-label="Email">
          <FiMail size={19} />
        </a>
      </div>
    </motion.div>
  );
}
