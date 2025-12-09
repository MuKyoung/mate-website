import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamCapabilities, awards } from '@/data/teamCapabilities';
import { FiCheckCircle, FiAward } from 'react-icons/fi';

// 수상 등급에 따른 아이콘 반환 함수
function getAwardIcon(rank?: string): string {
  if (!rank) return '🏆';
  
  if (rank === '대상') return '🏆';
  if (rank === '금상') return '🥇';
  if (rank === '은상') return '🥈';
  if (rank === '동상') return '🥉';
  if (rank === '최우수상' || rank === '우수상' || rank === '장려상' || rank === '우수논문상') return '🏅';
  if (rank.includes('인증서')) return '📜';
  if (rank.includes('장상') || rank.includes('원장상')) return '🏅';
  
  // 위 조건에 해당하지 않으면 기본 트로피 아이콘
  return '🏆';
}

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '팀 역량 - Mate 외주개발팀',
  description: '유니티 외주 개발과 개발 강의에 특화된 Mate 팀의 역량을 소개합니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다.',
  keywords: '외주개발, 유니티 개발, 개발 강의, Unity 외주, 게임 개발 교육, 유니티 강의, 유니티 외주개발 팀',
  alternates: {
    canonical: `${siteUrl}/team`,
  },
  openGraph: {
    title: '팀 역량 - Mate 외주개발팀',
    description: '유니티 외주 개발과 개발 강의에 특화된 Mate 팀의 역량을 소개합니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다.',
    url: `${siteUrl}/team`,
    type: 'website',
  },
};

export default function TeamPage() {
  return (
    <div className="pt-20">
      <PageHeader
        title="Mate 팀의 역량"
        description="유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다"
      />

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
              왜 Mate 팀을 선택해야 할까요?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">검증된 경험</h3>
                  <p className="text-gray-600 text-sm">
                    4년 이상의 유니티 외주 개발 경험과 30개 이상의 성공적인 프로젝트 완수
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">전문 팀 구성</h3>
                  <p className="text-gray-600 text-sm">
                    클라이언트, 서버, UI/UX 등 각 분야의 전문가로 구성된 팀
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">투명한 커뮤니케이션</h3>
                  <p className="text-gray-600 text-sm">
                    프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">품질 보증</h3>
                  <p className="text-gray-600 text-sm">
                    철저한 테스트와 코드 리뷰를 통한 높은 품질의 결과물 제공
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
              <FiAward className="text-3xl text-purple-900" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              수상 및 전시 경력
            </h2>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Mate 팀의 전문성을 인정받은 수상 및 전시 이력입니다
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {/* 연도별 그룹화 */}
            {Array.from(new Set(awards.map(a => a.year)))
              .sort((a, b) => b - a)
              .map((year) => (
                <div key={year} className="mb-12 last:mb-0">
                  {/* 연도 헤더 */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl font-bold text-purple-900">{year}</span>
                    </div>
                    <div className="h-0.5 flex-grow bg-gradient-to-r from-yellow-400/50 to-transparent" />
                  </div>

                  {/* 해당 연도 수상 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 sm:ml-6 md:ml-24">
                    {awards
                      .filter(a => a.year === year)
                      .map((award) => (
                        <div
                          key={award.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* 아이콘 - 전시회 또는 수상에 따라 다르게 표시 */}
                            <div className="flex-shrink-0">
                              <span className="text-3xl sm:text-4xl">
                                {award.type === 'exhibition' ? '🎪' : getAwardIcon(award.rank)}
                              </span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                  award.type === 'exhibition' 
                                    ? 'bg-blue-500/30 text-blue-200' 
                                    : 'bg-yellow-500/30 text-yellow-200'
                                }`}>
                                  {award.type === 'exhibition' ? '전시회' : '수상'}
                                </span>
                                {award.rank && (
                                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded">
                                    {award.rank}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-base sm:text-lg mb-1 text-white break-words">{award.title}</h3>
                              <p className="text-purple-100 text-sm">{award.organization}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              전문 역량
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의를 통해 다양한 프로젝트를 성공적으로 완수한 경험과 전문성을 보유하고 있습니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

