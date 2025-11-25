import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { teamMembers } from '@/data/team';
import { projects } from '@/data/projects';
import { FiGithub, FiLinkedin, FiMail, FiArrowLeft } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SafeImage from '@/components/SafeImage';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return teamMembers.map((member) => ({
    id: member.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const member = teamMembers.find((m) => m.id === params.id);
  if (!member) {
    return {
      title: '팀원을 찾을 수 없습니다',
    };
  }
  return {
    title: `${member.name} - Digital Circus`,
    description: member.bio,
  };
}

export default function TeamMemberPage({ params }: PageProps) {
  const member = teamMembers.find((m) => m.id === params.id);

  if (!member) {
    notFound();
  }

  const memberProjects = projects.filter((p) => member.projects.includes(p.id));

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/team"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            팀으로 돌아가기
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-48 h-48 rounded-full bg-white/20 overflow-hidden">
              <SafeImage
                src={member.profileImage}
                alt={member.name}
                fill
                className="rounded-full"
                placeholder={
                  <div className="absolute inset-0 flex items-center justify-center text-8xl text-white/50">
                    👤
                  </div>
                }
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{member.name}</h1>
              <p className="text-2xl text-white/90 mb-4">{member.role}</p>
              <p className="text-lg text-white/80 max-w-2xl">{member.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Skills */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">기술 스택</h2>
                <div className="flex flex-wrap gap-3">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {memberProjects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">참여 프로젝트</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memberProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">연락처</h2>
                <div className="space-y-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <FiMail className="mr-3" size={20} />
                    {member.email}
                  </a>
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <FiGithub className="mr-3" size={20} />
                      GitHub 프로필
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <FiLinkedin className="mr-3" size={20} />
                      LinkedIn 프로필
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

