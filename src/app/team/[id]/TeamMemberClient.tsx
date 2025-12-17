'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';

interface TeamMemberClientProps {
  params: {
    id: string;
  };
}

export default function TeamMemberClient({ params }: TeamMemberClientProps) {
  const member = teamMembers.find((m) => m.id === params.id);

  if (!member) {
    notFound();
  }

  const memberProjects = projects.filter((p) => member.projects.includes(p.id));

  return (
    <div className="bg-[#0f0f23] min-h-screen">
      {/* Header */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href="/team"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            팀으로 돌아가기
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20"
            >
              <SafeImage
                src={member.profileImage}
                alt={member.name}
                fill
                className="rounded-full"
                placeholder={
                  <div className="absolute inset-0 flex items-center justify-center text-7xl bg-gradient-to-br from-purple-600 to-pink-600">
                    👤
                  </div>
                }
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center md:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{member.name}</h1>
              <p className="text-xl sm:text-2xl gradient-text font-medium mb-4">{member.role}</p>
              <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">{member.bio}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">기술 스택</h2>
                <div className="flex flex-wrap gap-3">
                  {member.skills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg font-medium border border-purple-500/20"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Projects */}
              {memberProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memberProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 sticky top-24"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">연락처</h2>
                <div className="space-y-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center text-white/70 hover:text-purple-400 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mr-3 group-hover:bg-purple-500/30 transition-colors">
                      <FiMail size={18} className="text-purple-400" />
                    </div>
                    <span className="text-sm break-all">{member.email}</span>
                  </a>
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-white/70 hover:text-white transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 transition-colors">
                        <FiGithub size={18} />
                      </div>
                      <span className="text-sm">GitHub 프로필</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-white/70 hover:text-blue-400 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <FiLinkedin size={18} className="text-blue-400" />
                      </div>
                      <span className="text-sm">LinkedIn 프로필</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

