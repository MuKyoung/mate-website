'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TeamMemberCard from '@/components/TeamMemberCard';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import { teamMembers } from '@/data/team';
import { teamCapabilities, awards, type Award } from '@/data/teamCapabilities';
import {
  FiCheckCircle, FiArrowRight, FiAward, FiGrid,
  FiStar, FiFileText, FiBookmark,
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

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <motion.div {...inView} variants={fadeUp} className="mb-10">
      <span className="section-label mb-3">{eyebrow}</span>
      <h2 className="heading-md mb-2">{title}</h2>
      {desc && <p className="text-[#4c4c4c] text-[15px] max-w-lg leading-relaxed">{desc}</p>}
    </motion.div>
  );
}

export default function TeamPageClient() {
  const yearGroups = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        eyebrow="About Team"
        title="MATE 팀 소개"
        description="Unity 게임 · AR/VR · 웹/앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다."
      />

      {/* ── 핵심 수치 ── */}
      <section className="bg-white border-b border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.32, ease: easeEnter }}
                className={[
                  'py-8 px-5 sm:px-6 border-[#e1e1e1]',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'sm:border-l' : '',
                  i >= 2 ? 'sm:border-t-0' : '',
                ].join(' ')}>
                <p className="text-2xl sm:text-3xl font-bold text-[#262626] font-mono-stat mb-1">{stat.value}</p>
                <p className="text-[11px] text-[#a3a3a3] uppercase tracking-[0.14em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 멤버 (white) ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Members" title="팀 멤버" desc="각 분야의 전문가가 기획부터 배포까지 함께합니다." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us (surface) ── */}
      <section className="py-20 sm:py-28 bg-[#f7f7f7] border-y border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Why Choose Us" title="왜 MATE 팀인가요?" desc="Unity · 웹 · 앱까지 한 팀에서 해결합니다." />
          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {whyChooseUs.map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="flex items-start gap-3 p-5 bg-white rounded-xl border border-[#e1e1e1] hover:border-[#c6c6c6] transition-colors">
                <FiCheckCircle className="flex-shrink-0 mt-0.5 text-[#2a72e5]" size={16} />
                <div>
                  <p className="text-sm font-semibold text-[#262626] mb-1">{item.title}</p>
                  <p className="text-[13px] text-[#5d5d5d] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 전문 역량 (white) ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Capabilities" title="전문 역량"
            desc="유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 수상 및 전시 (surface) ── */}
      <section className="py-20 sm:py-28 bg-[#f7f7f7] border-y border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-10">
            <span className="section-label mb-3"><FiAward size={12} /> Awards &amp; Exhibitions</span>
            <h2 className="heading-md mb-2">수상 및 전시 경력</h2>
            <p className="text-[#4c4c4c] text-[15px] max-w-md leading-relaxed">MATE 팀의 전문성을 인정받은 이력입니다.</p>
          </motion.div>

          <div className="space-y-10 max-w-4xl">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={fadeUp}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-sm font-bold text-[#262626] font-mono-stat">{year}</span>
                  <div className="h-px flex-grow bg-[#e1e1e1]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {awards.filter(a => a.year === year).map((award, ai) => {
                    const Icon = getAwardIcon(award);
                    return (
                      <motion.div key={award.id}
                        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ delay: ai * 0.06, duration: 0.32, ease: easeEnter }}
                        className="flex items-start gap-3 p-4 rounded-xl border border-[#e1e1e1] bg-white hover:border-[#c6c6c6] transition-colors">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f7f7f7] border border-[#e1e1e1] text-[#2a72e5] flex-shrink-0">
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className={award.type === 'exhibition' ? 'tag tag-blue' : 'badge-success'}>
                              {award.type === 'exhibition' ? '전시회' : '수상'}
                            </span>
                            {award.rank && <span className="tag">{award.rank}</span>}
                          </div>
                          <p className="text-[13px] font-semibold text-[#262626] leading-snug">{award.title}</p>
                          <p className="text-[12px] text-[#5d5d5d] mt-0.5">{award.organization}</p>
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

      {/* ── CTA (다크 밴드) ── */}
      <section className="bg-[#262626]">
        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <p className="text-xs text-white/45 uppercase tracking-[0.16em] mb-3">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">함께 프로젝트를 시작해볼까요?</h2>
              <p className="text-white/55 text-[15px]">무료 상담으로 가능성을 확인하세요.</p>
            </div>
            <Link href="/contact"
              className="group flex-shrink-0 inline-flex items-center gap-2 h-12 px-7 rounded-lg text-[15px] font-medium text-white bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
              무료 상담 신청
              <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
