'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TeamMember } from '@/types';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/team/${member.id}`}>
        <div className="relative h-56 bg-[#3b82f6]/10 overflow-hidden">
          <SafeImage src={member.profileImage} alt={member.name} fill className="absolute inset-0"
            placeholder={<div className="absolute inset-0 flex items-center justify-center text-5xl text-[#3b82f6]/30">👤</div>}
          />
        </div>
        <div className="p-5">
          <h3 className="text-base font-bold text-gray-900 mb-0.5">{member.name}</h3>
          <p className="text-xs text-[#3b82f6] font-medium mb-2.5">{member.role}</p>
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{member.bio}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {member.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-blue-50 text-[#3b82f6] text-[11px] rounded border border-blue-100">
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded border border-gray-100">
                +{member.skills.length - 3}
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="GitHub">
                <FiGithub size={16} />
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-[#3b82f6] transition-colors" aria-label="LinkedIn">
                <FiLinkedin size={16} />
              </a>
            )}
            <a href={`mailto:${member.email}`} onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-[#3b82f6] transition-colors" aria-label="Email">
              <FiMail size={16} />
            </a>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
