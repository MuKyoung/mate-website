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
      className="group h-full flex flex-col rounded-2xl border border-[#e4e4e4] bg-white hover:border-[#0a0a0a] transition-colors"
    >
      <Link href={`/team/${member.id}`} className="block flex-1 p-6">
        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#e4e4e4] flex-shrink-0 bg-[#f5f5f5]">
            <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
              placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#a1a1aa]"><FiUser size={24} /></div>}
            />
          </div>
          {/* 이름 / 역할 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[17px] font-bold text-[#0a0a0a] truncate group-hover:text-[#2a72e5] transition-colors">{member.name}</h3>
              <FiArrowUpRight size={16} className="flex-shrink-0 mt-0.5 text-[#a1a1aa] group-hover:text-[#2a72e5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-[13px] text-[#2a72e5] font-medium mt-0.5">{member.role}</p>
          </div>
        </div>

        <p className="text-[#52525b] text-[13px] mt-5 line-clamp-2 leading-relaxed">{member.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-5">
          {member.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="tag tag-blue">{skill}</span>
          ))}
          {member.skills.length > 3 && (
            <span className="tag">+{member.skills.length - 3}</span>
          )}
        </div>
      </Link>

      <div className="flex gap-4 px-6 py-4 border-t border-[#e4e4e4]">
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer"
            className="text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors" aria-label="GitHub">
            <FiGithub size={16} />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
            className="text-[#a1a1aa] hover:text-[#2a72e5] transition-colors" aria-label="LinkedIn">
            <FiLinkedin size={16} />
          </a>
        )}
        <a href={`mailto:${member.email}`}
          className="text-[#a1a1aa] hover:text-[#2a72e5] transition-colors" aria-label="Email">
          <FiMail size={16} />
        </a>
      </div>
    </motion.div>
  );
}
