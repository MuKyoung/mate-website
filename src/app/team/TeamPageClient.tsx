'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamCapabilities, awards } from '@/data/teamCapabilities';
import { FiCheckCircle, FiArrowRight, FiAward } from 'react-icons/fi';

function getAwardIcon(rank?: string): string {
  if (!rank) return '🏆';
  if (rank === '대상') return '🏆';
  if (rank === '금상') return '🥇';
  if (rank === '은상') return '🥈';
  if (rank === '동상') return '🥉';
  if (['최우수상', '우수상', '장려상', '우수논문상'].includes(rank)) return '🏅';
  if (rank.includes('인증서')) return '📜';
  if (rank.includes('장상') || rank.includes('원장상')) return '🏅';
  return '🏆';
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
};

export default function TeamPageClient() {
  const whyChooseUs = [
    { title: '검증된 경험',        desc: '5년 이상의 유니티 외주 개발 경험, 30개 이상 프로젝트 완수' },
    { title: '전문 팀 구성',        desc: '클라이언트 · 서버 · UI/UX 각 분야 전문가로 구성' },
    { title: '투명한 커뮤니케이션', desc: '프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유' },
    { title: '품질 보증',           desc: '철저한 테스트와 코드 리뷰로 높은 품질의 결과물 제공' },
  ];

  const yearGroups = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);

  return (
    <div style={{ background: 'var(--background)' }}>

      {/* ── 페이지 헤더 ── */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}>
            <span className="section-label mb-3">About Team</span>
            <h1 className="heading-lg text-white mb-3">MATE 팀 소개</h1>
            <p className="text-white/40 text-sm sm:text-base max-w-lg leading-relaxed">
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 핵심 수치 ── */}
      <section className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0"
            style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
            {[
              { value: '30+', label: '완료 프로젝트' },
              { value: '5년', label: '외주 개발 경력' },
              { value: '4명', label: '전문 개발자' },
              { value: '100%', label: '성공률' },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45 }}
                className="py-8 px-6 text-center sm:text-left"
                style={{ borderColor: 'var(--border)' }}>
                <p className="text-2xl sm:text-3xl font-bold text-white font-mono-stat mb-1">{stat.value}</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="mb-10">
            <span className="section-label mb-3" style={{ color: '#3b82f6' }}>Why Choose Us</span>
            <h2 className="heading-md text-gray-900 mb-2">왜 MATE 팀인가요?</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {whyChooseUs.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="flex items-start gap-3 p-5 bg-white rounded-xl border border-gray-100">
                <FiCheckCircle className="flex-shrink-0 mt-0.5 text-[#3b82f6]" size={16} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수상 및 전시 ── */}
      <section className="py-16 sm:py-20 border-y" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <FiAward size={14} className="text-amber-400" />
              <span className="section-label mb-0" style={{ color: '#f59e0b' }}>Awards & Exhibitions</span>
            </div>
            <h2 className="heading-md text-white mb-2">수상 및 전시 경력</h2>
            <p className="text-white/35 text-sm max-w-md">MATE 팀의 전문성을 인정받은 이력입니다.</p>
          </motion.div>

          <div className="space-y-10 max-w-4xl">
            {yearGroups.map((year, yi) => (
              <motion.div key={year}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: yi * 0.07, duration: 0.45 }}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-sm font-bold text-white font-mono-stat">{year}</span>
                  <div className="h-px flex-grow" style={{ background: 'var(--border)' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {awards.filter(a => a.year === year).map((award, ai) => (
                    <motion.div key={award.id}
                      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: ai * 0.04, duration: 0.4 }}
                      className="flex items-start gap-3 p-4 rounded-lg border transition-colors hover:border-white/[0.14]"
                      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                      <span className="text-lg leading-none flex-shrink-0">
                        {award.type === 'exhibition' ? '🎪' : getAwardIcon(award.rank)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                            award.type === 'exhibition'
                              ? 'bg-blue-500/10 text-blue-300/80 border-blue-500/15'
                              : 'bg-amber-500/10 text-amber-300/80 border-amber-500/15'
                          }`}>
                            {award.type === 'exhibition' ? '전시회' : '수상'}
                          </span>
                          {award.rank && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] text-white/40 rounded border border-white/[0.07]">
                              {award.rank}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white leading-snug">{award.title}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{award.organization}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 전문 역량 ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="mb-10">
            <span className="section-label mb-3" style={{ color: '#3b82f6' }}>Capabilities</span>
            <h2 className="heading-md text-gray-900 mb-2">전문 역량</h2>
            <p className="text-gray-500 text-sm max-w-lg">
              유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">함께 프로젝트를 시작해볼까요?</h2>
              <p className="text-white/40 text-sm">무료 상담으로 시작합니다.</p>
            </div>
            <Link href="/contact"
              className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors">
              무료 상담 신청
              <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
