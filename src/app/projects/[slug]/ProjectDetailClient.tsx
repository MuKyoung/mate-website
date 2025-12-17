'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiClock, FiYoutube } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';

// 유튜브 URL에서 비디오 ID 추출
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface ProjectDetailClientProps {
  params: {
    slug: string;
  };
}

export default function ProjectDetailClient({ params }: ProjectDetailClientProps) {
  const project = projects.find((p) => p.id === params.slug);

  if (!project) {
    notFound();
  }

  const projectTeamMembers = teamMembers.filter((m) =>
    project.teamMembers.includes(m.id)
  );

  return (
    <div className="bg-[#0f0f23] min-h-screen">
      {/* Header */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href="/projects"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            프로젝트로 돌아가기
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{project.title}</h1>
            <p className="text-lg sm:text-xl text-white/60 mb-6 max-w-3xl leading-relaxed">{project.description}</p>
            
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <span className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm border border-white/10">
                {project.category}
              </span>
              <div className="flex items-center text-white/60">
                <FiClock className="mr-2" />
                개발 기간: {project.durationMonths}개월
              </div>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all text-sm font-medium"
                >
                  <FiExternalLink className="mr-2" />
                  라이브 데모
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
                >
                  <FiGithub className="mr-2" />
                  GitHub
                </a>
              )}
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FiYoutube className="mr-2" />
                  YouTube
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Video or Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {project.youtubeUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl h-72 sm:h-96 overflow-hidden border border-white/10">
                    <SafeImage
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="rounded-2xl"
                      placeholder={
                        <div className="absolute inset-0 flex items-center justify-center text-8xl text-white/20">
                          🎮
                        </div>
                      }
                    />
                  </div>
                )}
              </motion.div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">프로젝트 개요</h2>
                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                  {project.longDescription}
                </p>
              </motion.div>

              {/* Gallery */}
              {project.images && project.images.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">프로젝트 이미지</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative bg-white/5 rounded-xl h-48 overflow-hidden border border-white/10"
                      >
                        <SafeImage
                          src={image}
                          alt={`${project.title} - 이미지 ${index + 1}`}
                          fill
                          className="rounded-xl"
                          placeholder={
                            <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/20">
                              📷
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tech Stack */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">기술 스택</h2>
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-medium border border-purple-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Team Members */}
              {projectTeamMembers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">팀원</h2>
                  <div className="space-y-4">
                    {projectTeamMembers.map((member) => (
                      <Link
                        key={member.id}
                        href={`/team/${member.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">{member.name}</p>
                          <p className="text-sm text-white/50">{member.role}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

