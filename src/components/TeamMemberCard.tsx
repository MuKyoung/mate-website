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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className="group h-full flex flex-col rounded-2xl border border-[#e6e4f2] bg-white hover:border-[#4f46ff] hover:shadow-[0_8px_28px_-8px_rgba(79,70,255,0.25)] transition-all duration-200"
    >
      <Link href={`/team/${member.id}`} className="block flex-1 p-6">
        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#ecebff]">
            <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
              placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#4f46ff]"><FiUser size={24} /></div>}
            />
          </div>
          {/* 이름 / 역할 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[17px] font-bold text-[#0f0f19] truncate">{member.name}</h3>
              <FiArrowUpRight size={16} className="flex-shrink-0 mt-0.5 text-[#b3b3c2] group-hover:text-[#4f46ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-[13px] text-[#4f46ff] font-semibold mt-0.5">{member.role}</p>
          </div>
        </div>

        <p className="text-[#5b5b6b] text-[13px] mt-5 line-clamp-2 leading-relaxed">{member.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-5">
          {member.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="tag-blue">{skill}</span>
          ))}
          {member.skills.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-[#e6e4f2] px-2.5 py-[3px] text-[12px] font-medium text-[#5b5b6b]">
              +{member.skills.length - 3}
            </span>
          )}
        </div>
      </Link>

      <div className="flex gap-4 px-6 py-4 border-t border-[#e6e4f2]">
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer"
            className="text-[#b3b3c2] hover:text-[#4f46ff] transition-colors" aria-label="GitHub">
            <FiGithub size={16} />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
            className="text-[#b3b3c2] hover:text-[#4f46ff] transition-colors" aria-label="LinkedIn">
            <FiLinkedin size={16} />
          </a>
        )}
        <a href={`mailto:${member.email}`}
          className="text-[#b3b3c2] hover:text-[#4f46ff] transition-colors" aria-label="Email">
          <FiMail size={16} />
        </a>
      </div>
    </motion.div>
  );
}
