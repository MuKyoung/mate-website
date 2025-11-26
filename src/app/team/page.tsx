import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamCapabilities, awards } from '@/data/teamCapabilities';
import { FiCheckCircle, FiAward } from 'react-icons/fi';

export const metadata: Metadata = {
  title: '팀 역량 - Mate 외주개발팀',
  description: '유니티 외주 개발과 개발 강의에 특화된 Mate 팀의 역량을 소개합니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다.',
  keywords: '외주개발, 유니티 개발, 개발 강의, Unity 외주, 게임 개발 교육, 유니티 강의',
};

export default function TeamPage() {
  return (
    <div className="pt-20">
      <PageHeader
        title="Mate 팀의 역량"
        description="유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다"
      />

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {teamCapabilities.stats.totalProjects}+
              </div>
              <div className="text-gray-600 text-sm">완료 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {teamCapabilities.stats.yearsExperience}년
              </div>
              <div className="text-gray-600 text-sm">외주 개발 경력</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {teamCapabilities.stats.teamMembers}명
              </div>
              <div className="text-gray-600 text-sm">전문 개발자</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {teamCapabilities.stats.successRate}%
              </div>
              <div className="text-gray-600 text-sm">프로젝트 성공률</div>
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
              수상 경력
            </h2>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Mate 팀의 전문성을 인정받은 수상 이력입니다
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-purple-900">{year}</span>
                    </div>
                    <div className="h-0.5 flex-grow bg-gradient-to-r from-yellow-400/50 to-transparent" />
                  </div>

                  {/* 해당 연도 수상 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 md:ml-24">
                    {awards
                      .filter(a => a.year === year)
                      .map((award) => (
                        <div
                          key={award.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-4">
                            {/* 메달 아이콘 */}
                            <div className="flex-shrink-0">
                              {award.rank === '대상' && <span className="text-4xl">🏆</span>}
                              {award.rank === '금상' && <span className="text-4xl">🥇</span>}
                              {award.rank === '은상' && <span className="text-4xl">🥈</span>}
                              {award.rank === '동상' && <span className="text-4xl">🥉</span>}
                              {(award.rank === '우수상' || award.rank === '장려상') && (
                                <span className="text-4xl">🏅</span>
                              )}
                              {!award.rank && <span className="text-4xl">🎖️</span>}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded">
                                  {award.rank}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg mb-1">{award.title}</h3>
                              <p className="text-purple-200 text-sm mb-2">{award.organization}</p>
                              {award.description && (
                                <p className="text-purple-300 text-sm">{award.description}</p>
                              )}
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

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
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

      {/* Capabilities Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              전문 역량
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의를 통해 다양한 프로젝트를 성공적으로 완수한 경험과 전문성을 보유하고 있습니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

