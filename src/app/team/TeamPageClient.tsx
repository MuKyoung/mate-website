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
import { fadeUp, clipUp, stagger, inView, easeEnter } from '@/lib/motion';

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

/* 섹션 헤더 — eyebrow + 초대형 클립 리빌 타이틀 */
function SectionHead({ eyebrow, title, desc, dark = false }: {
  eyebrow: string; title: string; desc?: string; dark?: boolean;
}) {
  return (
    <div className="mb-14">
      <motion.span {...inView} variants={fadeUp}
        className={`eyebrow mb-5 ${dark ? 'text-[#5b9bff]' : 'text-[#2a72e5]'}`}>
        {eyebrow}
      </motion.span>
      <motion.h2 {...inView} variants={stagger} className={`display-section ${dark ? 'text-white' : 'text-[#0a0a0a]'}`}>
        <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{title}</motion.span></span>
      </motion.h2>
      {desc && (
        <motion.p {...inView} variants={fadeUp}
          className={`mt-5 text-lg leading-relaxed max-w-xl ${dark ? 'on-dark-2' : 'text-[#52525b]'}`}>
          {desc}
        </motion.p>
      )}
    </div>
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
                <p className="text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] font-mono-stat tracking-tight mb-1.5">{stat.value}</p>
                <p className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.16em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 멤버 (white) ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Members" title="팀 멤버" desc="각 분야의 전문가가 기획부터 배포까지 함께합니다." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us (surface) ── */}
      <section className="py-24 sm:py-32 bg-[#f5f5f5] border-y border-[#e4e4e4]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Why Choose Us" title="왜 MATE 팀인가요?" desc="Unity · 웹 · 앱까지 한 팀에서 해결합니다." />
          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            {whyChooseUs.map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="flex items-start gap-4 p-7 bg-white rounded-2xl border border-[#e4e4e4] hover:border-[#0a0a0a] transition-colors">
                <FiCheckCircle className="flex-shrink-0 mt-0.5 text-[#2a72e5]" size={18} />
                <div>
                  <p className="text-[15px] font-bold text-[#0a0a0a] mb-1.5">{item.title}</p>
                  <p className="text-[13px] text-[#52525b] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 전문 역량 (DARK 대비 밴드) ── */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Capabilities" title="전문 역량"
            desc="유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다." dark />
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
          <SectionHead eyebrow="Awards & Exhibitions" title="수상 및 전시 경력"
            desc="MATE 팀의 전문성을 인정받은 이력입니다." />

          <div className="space-y-12 max-w-4xl">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={fadeUp}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-base font-extrabold text-[#0a0a0a] font-mono-stat tracking-tight">{year}</span>
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
                        className="flex items-start gap-3 p-5 rounded-2xl border border-[#e4e4e4] bg-white hover:border-[#0a0a0a] transition-colors">
                        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#c6e6ff] text-[#0957c8] flex-shrink-0">
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className={award.type === 'exhibition' ? 'tag tag-blue' : 'badge-success'}>
                              {award.type === 'exhibition' ? '전시회' : '수상'}
                            </span>
                            {award.rank && <span className="tag">{award.rank}</span>}
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

      {/* ── CTA (DARK) ── */}
      <section className="relative py-28 sm:py-40 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6 justify-center">Contact</motion.span>
          <motion.h2 {...inView} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">함께 프로젝트를</motion.span></span>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">시작해볼까요?</motion.span></span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg mb-10 max-w-lg mx-auto">
            무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              무료 상담 신청
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
