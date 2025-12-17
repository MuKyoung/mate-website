'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamCapabilities, awards } from '@/data/teamCapabilities';
import { FiCheckCircle, FiAward, FiArrowRight } from 'react-icons/fi';

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
  
  return '🏆';
}

export default function TeamPageClient() {
  const whyChooseUs = [
    { 
      title: '검증된 경험', 
      desc: '5년 이상의 유니티 외주 개발 경험과 30개 이상의 성공적인 프로젝트 완수' 
    },
    { 
      title: '전문 팀 구성', 
      desc: '클라이언트, 서버, UI/UX 등 각 분야의 전문가로 구성된 팀' 
    },
    { 
      title: '투명한 커뮤니케이션', 
      desc: '프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유' 
    },
    { 
      title: '품질 보증', 
      desc: '철저한 테스트와 코드 리뷰를 통한 높은 품질의 결과물 제공' 
    },
  ];

  return (
    <div className="bg-[#0f0f23]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              className="inline-block text-purple-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              About Team
            </motion.span>
            <h1 className="heading-lg text-white mb-6">
              <span className="gradient-text">MATE</span> 팀의 역량
            </h1>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { emoji: '🎯', value: '30+', label: '완료 프로젝트' },
              { emoji: '⏱️', value: '5년', label: '외주 개발 경력' },
              { emoji: '👥', value: '4명', label: '전문 개발자' },
              { emoji: '✅', value: '100%', label: '성공률' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-3xl sm:text-4xl mb-3">{stat.emoji}</div>
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block text-purple-600 text-sm font-medium tracking-widest uppercase mb-4">
              Why Choose Us
            </span>
            <h2 className="heading-md text-gray-900 mb-4">
              왜 <span className="gradient-text">MATE</span> 팀을 선택해야 할까요?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group flex items-start gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 sm:py-28 bg-[#0f0f23] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 shadow-lg shadow-yellow-500/25">
              <FiAward className="text-2xl sm:text-3xl text-white" />
            </div>
            <span className="block text-yellow-400 text-sm font-medium tracking-widest uppercase mb-4">
              Awards & Exhibitions
            </span>
            <h2 className="heading-md text-white mb-4">
              수상 및 전시 경력
            </h2>
            <p className="body-lg text-white/50 max-w-2xl mx-auto">
              MATE 팀의 전문성을 인정받은 수상 및 전시 이력입니다
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {Array.from(new Set(awards.map(a => a.year)))
              .sort((a, b) => b - a)
              .map((year, yearIndex) => (
                <motion.div 
                  key={year} 
                  className="mb-12 last:mb-0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: yearIndex * 0.1 }}
                >
                  {/* Year Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25"
                    >
                      <span className="text-xl sm:text-2xl font-bold text-white">{year}</span>
                    </motion.div>
                    <div className="h-px flex-grow bg-gradient-to-r from-yellow-400/50 to-transparent" />
                  </div>

                  {/* Awards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 sm:ml-6 md:ml-24">
                    {awards
                      .filter(a => a.year === year)
                      .map((award, awardIndex) => (
                        <motion.div
                          key={award.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: awardIndex * 0.05 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="group relative p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className="flex-shrink-0 text-3xl sm:text-4xl"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              {award.type === 'exhibition' ? '🎪' : getAwardIcon(award.rank)}
                            </motion.div>
                            <div className="flex-grow min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                  award.type === 'exhibition' 
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' 
                                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                                }`}>
                                  {award.type === 'exhibition' ? '전시회' : '수상'}
                                </span>
                                {award.rank && (
                                  <span className="px-2.5 py-1 bg-white/10 text-white/80 text-xs rounded-lg border border-white/10">
                                    {award.rank}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-base sm:text-lg text-white mb-1 break-words">
                                {award.title}
                              </h3>
                              <p className="text-white/50 text-sm">{award.organization}</p>
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

      {/* Capabilities Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block text-purple-600 text-sm font-medium tracking-widest uppercase mb-4">
              Capabilities
            </span>
            <h2 className="heading-md text-gray-900 mb-4">
              전문 역량
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의를 통해 다양한 프로젝트를 성공적으로 완수한 경험과 전문성을 보유하고 있습니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-[#0f0f23] relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-md text-white mb-6">
              프로젝트를 함께 시작할 준비가 되셨나요?
            </h2>
            <p className="body-lg text-white/60 mb-8 max-w-xl mx-auto">
              무료 상담을 통해 프로젝트에 대해 이야기해 보세요
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              무료 상담 신청
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

