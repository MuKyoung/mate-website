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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: easeEnter }}
      className="group rounded-xl border border-[#e1e1e1] bg-white hover:border-[#c6c6c6] transition-colors"
    >
      <Link href={`/team/${member.id}`} className="block p-5">
        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#e1e1e1] flex-shrink-0 bg-[#f7f7f7]">
            <SafeImage src={member.profileImage} alt={member.name} fill className="rounded-full"
              placeholder={<div className="absolute inset-0 flex items-center justify-center text-[#a3a3a3]"><FiUser size={22} /></div>}
            />
          </div>
          {/* 이름 / 역할 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-bold text-[#262626] truncate">{member.name}</h3>
              <FiArrowUpRight size={15} className="flex-shrink-0 mt-0.5 text-[#c6c6c6] group-hover:text-[#2a72e5] transition-colors" />
            </div>
            <p className="text-[13px] text-[#2a72e5] font-medium mt-0.5">{member.role}</p>
          </div>
        </div>

        <p className="text-[#5d5d5d] text-[13px] mt-4 line-clamp-2 leading-relaxed">{member.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {member.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="tag tag-blue">{skill}</span>
          ))}
          {member.skills.length > 3 && (
            <span className="tag">+{member.skills.length - 3}</span>
          )}
        </div>
      </Link>

      <div className="flex gap-4 px-5 py-3.5 border-t border-[#e1e1e1]">
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer"
            className="text-[#a3a3a3] hover:text-[#262626] transition-colors" aria-label="GitHub">
            <FiGithub size={16} />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
            className="text-[#a3a3a3] hover:text-[#2a72e5] transition-colors" aria-label="LinkedIn">
            <FiLinkedin size={16} />
          </a>
        )}
        <a href={`mailto:${member.email}`}
          className="text-[#a3a3a3] hover:text-[#2a72e5] transition-colors" aria-label="Email">
          <FiMail size={16} />
        </a>
      </div>
    </motion.div>
  );
}
