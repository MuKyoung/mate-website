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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <Link href={`/team/${member.id}`}>
        <div className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
          <SafeImage
            src={member.profileImage}
            alt={member.name}
            fill
            className="absolute inset-0"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/50">
                👤
              </div>
            }
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
          <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{member.bio}</p>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {member.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{member.skills.length - 3}
              </span>
            )}
          </div>

          {/* Social Links */}
          <div className="flex space-x-3">
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-purple-600 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-purple-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
            )}
            <a
              href={`mailto:${member.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-purple-600 transition-colors"
              aria-label="Email"
            >
              <FiMail size={20} />
            </a>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

