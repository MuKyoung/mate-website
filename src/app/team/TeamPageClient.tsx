'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamCapabilities, awards } from '@/data/teamCapabilities';
import { FiCheckCircle, FiAward, FiArrowRight } from 'react-icons/fi';

function getAwardIcon(rank?: string): string {
  if (!rank) return '🏆';
  if (rank === '대상') return '🏆';
  if (rank === '금상') return '🥇';
  if (rank === '은상') return '🥈';
  if (rank === '동상') return '🥉';
  if (rank === '최우수상' || rank === '우수상' || rank === '장려상' || rank === '우수논문상') return '🏅';
  if (rank.includes('인증서')) return '📜';
  if (rank.includes('장상') || rank.includes('원장상')) return '🏅';
  return '🏆';
}

export default function TeamPageClient() {
  const whyChooseUs = [
    { title: '검증된 경험',       desc: '5년 이상의 유니티 외주 개발 경험과 30개 이상의 성공적인 프로젝트 완수' },
    { title: '전문 팀 구성',       desc: '클라이언트, 서버, UI/UX 등 각 분야의 전문가로 구성된 팀' },
    { title: '투명한 커뮤니케이션', desc: '프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유' },
    { title: '품질 보증',          desc: '철저한 테스트와 코드 리뷰를 통한 높은 품질의 결과물 제공' },
  ];

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center max-w-4xl mx-auto">
            <span className="section-label justify-center mb-4">About Team</span>
            <h1 className="heading-lg text-white mb-5">MATE 팀의 역량</h1>
            <p className="body-lg text-white/40 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.05] max-w-5xl mx-auto">
            {[
              { value: '30+', label: '완료 프로젝트' },
              { value: '5년', label: '외주 개발 경력' },
              { value: '4명', label: '전문 개발자' },
              { value: '100%', label: '성공률' },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="py-7 px-6 text-center"
                style={{ background: 'var(--surface)' }}>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 font-mono-stat">{stat.value}</div>
                <div className="text-xs text-white/30 tracking-wider uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16">
            <span className="section-label justify-center mb-4">Why Choose Us</span>
            <h2 className="heading-md text-gray-900 mb-4">왜 MATE 팀을 선택해야 할까요?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                whileHover={{ y: -4 }}
                className="flex items-start gap-4 p-6 sm:p-7 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FiCheckCircle className="text-[#3b82f6]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 sm:py-28 overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl mb-5">
              <FiAward className="text-white text-xl" />
            </div>
            <span className="block section-label justify-center mb-3">Awards & Exhibitions</span>
            <h2 className="heading-md text-white mb-3">수상 및 전시 경력</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base">
              MATE 팀의 전문성을 인정받은 수상 및 전시 이력입니다
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a).map((year, yearIndex) => (
              <motion.div key={year} className="mb-12 last:mb-0"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: yearIndex * 0.08 }}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-base font-bold text-white">{year}</span>
                  </div>
                  <div className="h-px flex-grow bg-white/[0.08]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 sm:ml-6 md:ml-[4.5rem]">
                  {awards.filter(a => a.year === year).map((award, awardIndex) => (
                    <motion.div key={award.id}
                      initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: awardIndex * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="p-5 rounded-xl border transition-all duration-300 hover:border-white/[0.14]"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start gap-3.5">
                        <span className="flex-shrink-0 text-2xl leading-none">
                          {award.type === 'exhibition' ? '🎪' : getAwardIcon(award.rank)}
                        </span>
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${
                              award.type === 'exhibition'
                                ? 'bg-blue-500/10 text-blue-300/80 border-blue-500/15'
                                : 'bg-amber-500/10 text-amber-300/80 border-amber-500/15'
                            }`}>
                              {award.type === 'exhibition' ? '전시회' : '수상'}
                            </span>
                            {award.rank && (
                              <span className="px-2 py-0.5 bg-white/[0.06] text-white/50 text-[10px] rounded border border-white/[0.07]">
                                {award.rank}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm text-white mb-0.5 break-words">{award.title}</h3>
                          <p className="text-white/35 text-xs">{award.organization}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 sm:py-28 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16">
            <span className="section-label justify-center mb-4">Capabilities</span>
            <h2 className="heading-md text-gray-900 mb-4">전문 역량</h2>
            <p className="body-lg text-gray-500 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의를 통해 다양한 프로젝트를 성공적으로 완수한 경험과 전문성을 보유하고 있습니다
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="heading-md text-white mb-4">프로젝트를 함께 시작할 준비가 되셨나요?</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">무료 상담을 통해 프로젝트에 대해 이야기해 보세요</p>
            <Link href="/contact"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200 shadow-lg shadow-blue-500/15">
              무료 상담 신청
              <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
