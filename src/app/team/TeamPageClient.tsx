'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TeamMemberCard from '@/components/TeamMemberCard';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamMembers } from '@/data/team';
import { teamCapabilities, awards, type Award } from '@/data/teamCapabilities';
import {
  FiCheckCircle, FiArrowRight, FiStar, FiFileText, FiBookmark, FiGrid,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { fadeUp, stagger, inView, easeEnter } from '@/lib/motion';

/* 수상 랭크 → react-icons (UI 이모지 금지) */
function getAwardIcon(award: Award): IconType {
  if (award.type === 'exhibition') return FiGrid;
  const rank = award.rank ?? '';
  if (rank.includes('인증서')) return FiFileText;
  if (['대상', '금상', '은상', '동상', '최우수상', '우수상', '장려상', '우수논문상'].includes(rank)) return FiStar;
  if (rank.includes('장상') || rank.includes('원장상')) return FiStar;
  return FiBookmark;
}

const stats = [
  { value: '30+', label: '완료 프로젝트' },
  { value: '5년', label: '외주 개발 경력' },
  { value: '5명', label: '전문 개발자' },
  { value: '100%', label: '성공률' },
];

const whyChooseUs = [
  { title: '검증된 경험',        desc: '5년 이상의 유니티 외주 개발 경험, 30개 이상 프로젝트 완수' },
  { title: '전문 팀 구성',        desc: '클라이언트 · 서버 · UI/UX 각 분야 전문가로 구성' },
  { title: '투명한 커뮤니케이션', desc: '프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유' },
  { title: '품질 보증',           desc: '철저한 테스트와 코드 리뷰로 높은 품질의 결과물 제공' },
];

export default function TeamPageClient() {
  const yearGroups = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        eyebrow="About Team"
        title="MATE 팀 소개"
        description="Unity 게임 · AR/VR · 웹/앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다."
      />

      {/* ── 핵심 수치 (white) ── */}
      <section className="bg-white border-b border-[#e4e4e4]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12%' }}
                transition={{ delay: i * 0.09, duration: 0.7, ease: easeEnter }}
                className={[
                  'py-10 px-5 sm:px-6 border-[#e4e4e4]',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'sm:border-l' : '',
                  i >= 2 ? 'sm:border-t-0' : '',
                ].join(' ')}>
                <p className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] font-mono-stat tracking-tight mb-1.5">{stat.value}</p>
                <p className="text-[13px] text-[#a1a1aa]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 멤버 (white) — 가로 규칙선 헤더 ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-baseline justify-between gap-4 pb-6 mb-12 border-b border-[#e4e4e4]">
            <div className="flex items-baseline gap-5">
              <span className="text-[13px] text-[#a1a1aa]">01</span>
              <h2 className="text-[#0a0a0a] font-semibold tracking-[-0.025em]"
                style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                팀 멤버
              </h2>
            </div>
            <p className="text-[14px] text-[#52525b]">각 분야의 전문가가 기획부터 배포까지 함께합니다.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us (surface) — 좌측 고정 제목 ── */}
      <section className="py-24 sm:py-32 bg-[#f5f5f5] border-y border-[#e4e4e4]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-y-12 gap-x-8">
            <div className="lg:col-span-4">
              <motion.div {...inView} variants={fadeUp} className="lg:sticky lg:top-28">
                <p className="text-[13px] text-[#a1a1aa] mb-4">02 — Why MATE</p>
                <h2 className="text-[#0a0a0a] font-semibold tracking-[-0.025em] leading-[1.1] mb-6"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                  왜 MATE 팀인가요?
                </h2>
                <p className="text-[15px] text-[#52525b] leading-[1.75] max-w-sm">
                  Unity · 웹 · 앱까지 한 팀에서 해결합니다.
                </p>
              </motion.div>
            </div>
            <motion.div {...inView} variants={stagger}
              className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {whyChooseUs.map((item) => (
                <motion.div key={item.title} variants={fadeUp}
                  className="flex items-start gap-4 p-7 bg-white rounded-sm border border-[#e4e4e4] hover:border-[#0a0a0a] transition-colors">
                  <FiCheckCircle className="flex-shrink-0 mt-0.5 text-[#0a0a0a]" size={18} />
                  <div>
                    <p className="text-[15px] font-semibold text-[#0a0a0a] mb-1.5">{item.title}</p>
                    <p className="text-[13px] text-[#52525b] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 전문 역량 (DARK 대비 밴드) ── */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-12 max-w-xl">
            <p className="text-[13px] text-white/35 mb-4">03 — Capabilities</p>
            <h2 className="text-white font-semibold tracking-[-0.025em] leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
              전문 역량
            </h2>
            <p className="text-[15px] text-white/55 leading-[1.75]">
              유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} dark />
            ))}
          </div>
        </div>
      </section>

      {/* ── 수상 및 전시 (white) ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-12">
            <p className="text-[13px] text-[#a1a1aa] mb-4">04 — Awards &amp; Exhibitions</p>
            <h2 className="text-[#0a0a0a] font-semibold tracking-[-0.025em]"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
              수상 및 전시 경력
            </h2>
          </motion.div>

          <div className="space-y-12 max-w-4xl">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={fadeUp}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-base font-semibold text-[#0a0a0a] font-mono-stat tracking-tight">{year}</span>
                  <div className="h-px flex-grow bg-[#e4e4e4]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {awards.filter(a => a.year === year).map((award, ai) => {
                    const Icon = getAwardIcon(award);
                    return (
                      <motion.div key={award.id}
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-12%' }}
                        transition={{ delay: ai * 0.09, duration: 0.7, ease: easeEnter }}
                        className="flex items-start gap-3 p-5 rounded-sm border border-[#e4e4e4] bg-white hover:border-[#0a0a0a] transition-colors">
                        <span className="flex items-center justify-center w-9 h-9 rounded-sm border border-[#e4e4e4] text-[#0a0a0a] flex-shrink-0">
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className="tag">
                              {award.type === 'exhibition' ? '전시회' : '수상'}
                            </span>
                            {award.rank && (
                              <span className="inline-flex items-center rounded-full border border-[#e4e4e4] px-2.5 py-[3px] text-[12px] font-medium text-[#52525b]">
                                {award.rank}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-semibold text-[#0a0a0a] leading-snug">{award.title}</p>
                          <p className="text-[12px] text-[#52525b] mt-0.5">{award.organization}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (DARK) — 좌측 정렬 ── */}
      <section className="py-24 sm:py-32 bg-[#0a0a0a] border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] text-white/35 mb-5">Contact</p>
              <motion.h2 variants={fadeUp}
                className="text-white font-semibold tracking-[-0.03em] leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
                함께 프로젝트를 시작해볼까요?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[15px] text-white/55 max-w-md">
                무료 상담으로 가능성을 확인하세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors">
                무료 상담 신청
                <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
