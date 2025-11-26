import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { FiExternalLink, FiGithub, FiArrowLeft, FiCalendar, FiYoutube } from 'react-icons/fi';
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

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) {
    return {
      title: '프로젝트를 찾을 수 없습니다',
    };
  }
  return {
    title: `${project.title} - Mate 외주개발팀`,
    description: `${project.description} | 유니티 외주 개발, 개발 강의 전문`,
    keywords: `유니티, Unity, 외주개발, 개발 강의, ${project.techStack.join(', ')}`,
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const project = projects.find((p) => p.id === params.slug);

  if (!project) {
    notFound();
  }

  const projectTeamMembers = teamMembers.filter((m) =>
    project.teamMembers.includes(m.id)
  );

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/projects"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            프로젝트로 돌아가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-white/90 mb-6 max-w-3xl">{project.description}</p>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="px-4 py-2 bg-white/20 rounded-full">{project.category}</span>
            <div className="flex items-center text-white/80">
              <FiCalendar className="mr-2" />
              {new Date(project.startDate).toLocaleDateString('ko-KR')}
              {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('ko-KR')}`}
            </div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
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
                className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
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
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiYoutube className="mr-2" />
                YouTube
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Project Video or Image */}
              {project.youtubeUrl ? (
                // 유튜브 영상 임베드
                <div className="relative rounded-xl mb-8 overflow-hidden aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.youtubeUrl)}?rel=0`}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                // 썸네일 이미지
                <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl h-96 mb-8 overflow-hidden">
                  <SafeImage
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="rounded-xl"
                    placeholder={
                      <div className="absolute inset-0 flex items-center justify-center text-8xl text-white/30">
                        🚀
                      </div>
                    }
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">프로젝트 개요</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.longDescription}
                </p>
              </div>

              {/* Gallery */}
              {project.images && project.images.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">프로젝트 이미지</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg h-48 overflow-hidden"
                      >
                        <SafeImage
                          src={image}
                          alt={`${project.title} - 이미지 ${index + 1}`}
                          fill
                          className="rounded-lg"
                          placeholder={
                            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-400">
                              📷
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Tech Stack */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">기술 스택</h2>
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              {projectTeamMembers.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">팀원</h2>
                  <div className="space-y-4">
                    {projectTeamMembers.map((member) => (
                      <Link
                        key={member.id}
                        href={`/team/${member.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

