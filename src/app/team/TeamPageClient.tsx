'use client';

import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import OrgChart from '@/components/OrgChart';
import SectionHead from '@/components/ui/SectionHead';
import CtaSection from '@/components/ui/CtaSection';
import StripeField from '@/components/visual/StripeField';
import { teamCapabilities, awards, type Award, counts } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { FiStar, FiFileText, FiBookmark, FiGrid } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { fadeUp, clipUp, rowIn, stagger, staggerTight, staggerRows, inView } from '@/lib/motion';
import { clipWrap, container, displaySize, sectionPad } from '@/lib/styles';

/* 수상 랭크 → react-icons (UI 이모지 금지) */
function getAwardIcon(award: Award): IconType {
  if (award.type === 'exhibition') return FiGrid;
  const rank = award.rank ?? '';
  if (rank.includes('인증서')) return FiFileText;
  if (['대상', '금상', '은상', '동상', '최우수상', '우수상', '장려상', '우수논문상'].includes(rank)) return FiStar;
  if (rank.includes('장상') || rank.includes('원장상')) return FiStar;
  return FiBookmark;
}

/* 개발 납품과 강의는 따로 센다. 둘을 더해 '누적 프로젝트' 라고 쓰면 틀린 말이 된다.
   회사 인원은 적지 않는다 (사용자 요청, 2026-10-16). */
const stats = [
  { value: `${counts.devProjects}+`, label: '개발 프로젝트 납품' },
  { value: `${counts.lectures}+`, label: '진행 강의' },
  { value: `${projects.length}건`, label: '포트폴리오 공개' },
  { value: `${teamCapabilities.stats.since}`, label: '시작한 해' },
];

/* 홈의 '일하는 방식' 과 같은 근거(faq.ts, process.ts)에서만 가져온다 */
const whyChooseUs = [
  { title: '열린 저장소',      desc: 'GitHub로 관리합니다. 프로젝트 기간 동안 진행 상황을 실시간으로 보실 수 있습니다' },
  { title: '주간 공유',        desc: '개발 단계에서는 주 단위로 공유하고, 코드 리뷰를 거쳐 올립니다' },
  { title: '소스 · 문서 인계', desc: '프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다' },
  { title: '배포 후 모니터링', desc: '배포한 뒤에도 모니터링으로 안정성을 확인합니다' },
];

export default function TeamPageClient() {
  const yearGroups = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="MATE 팀 소개"
        description="개발 · 디자인 · 운영이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역을 각각 전담합니다."
      />

      {/* ━━ 숫자 - 칸마다 이름표를 붙인 줄 ━━ */}
      <section className="border-b border-white/10">
        <div className={container}>
          <motion.div {...inView} variants={staggerTight} className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:py-12 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <p className="mono-label mb-3">{stat.label}:</p>
                <p className="font-en font-mono-stat text-[40px] leading-none tracking-[-0.032em] text-[var(--text-1)] sm:text-[52px]">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ About - 좌 제목 / 우 본문과 일하는 방식 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <motion.p {...inView} variants={fadeUp} className="mono-label mb-10 border-b border-white/[0.12] pb-4 sm:mb-14">About:</motion.p>

          <div className="grid gap-x-8 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <motion.h2 {...inView} variants={stagger}
                className="font-medium leading-[1.08] tracking-[-0.028em] text-[var(--text-1)]"
                style={displaySize}>
                <span className={clipWrap}>
                  <motion.span variants={clipUp} className="block">Unity · 웹 · 앱까지</motion.span>
                </span>
                <span className={clipWrap}>
                  <motion.span variants={clipUp} className="block text-white/45">한 팀에서</motion.span>
                </span>
              </motion.h2>
              <motion.div {...inView} variants={fadeUp} className="relative mt-12 hidden h-56 lg:block">
                <StripeField seed={31} className="absolute inset-0" />
              </motion.div>
            </div>

            <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
              <motion.p variants={fadeUp}
                className="mb-6 text-[20px] font-medium leading-[1.5] tracking-[-0.016em] text-[var(--text-1)] sm:text-[24px]">
                MATE는 웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과
                자체 게임 제작 · 퍼블리싱을 함께 합니다.
              </motion.p>
              <motion.p variants={fadeUp} className="mb-14 text-[17px] leading-[1.75] text-white/60">
                {teamCapabilities.stats.since}년부터 쌓은 외주 경험을 바탕으로,
                개발 · 디자인 · 운영이 하나의 팀으로 움직입니다.
                여러 회사에 나눠 맡기지 않아도, 필요한 개발을 한 팀에서 해결할 수 있습니다.
              </motion.p>

              <motion.p variants={fadeUp} className="mono-label mb-4">How we work:</motion.p>
              <motion.ol variants={staggerRows} className="space-y-2">
                {whyChooseUs.map((item, i) => (
                  <motion.li key={item.title} variants={rowIn}
                    className="sweep grid gap-x-6 gap-y-2 border border-white/10 bg-[var(--surface)] p-5 transition-colors hover:border-white/25 sm:grid-cols-[2rem_10rem_1fr] sm:items-baseline">
                    <span className="font-mono text-[12px] text-white/45 tabular-nums">{i + 1}</span>
                    <p className="text-[16px] font-medium text-[var(--text-1)]">{item.title}</p>
                    <p className="text-[15px] leading-[1.7] text-white/60">{item.desc}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ Vision - 큰 문장 하나 ━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <motion.p {...inView} variants={fadeUp} className="mono-label mb-14 border-b border-white/[0.12] pb-4 sm:mb-20">Vision:</motion.p>

          <motion.h2 {...inView} variants={stagger}
            className="mb-14 font-medium leading-[1.06] tracking-[-0.032em] text-[var(--text-1)] sm:mb-20"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block font-en">
                MATE <span className="text-[var(--point)]">=</span> 기획 + 개발 + 배포
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block text-white/45">끝까지 함께하는 개발 파트너</motion.span>
            </span>
          </motion.h2>

          <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
            <motion.p {...inView} variants={fadeUp}
              className="text-[17px] leading-[1.75] text-white/60 sm:text-[19px] lg:col-span-6 lg:col-start-7">
              단순 기능 구현을 넘어 기획 · 디자인 · 개발 · 배포 전 과정을 함께하는 파트너십을 지향합니다.
              배포한 뒤에도 모니터링으로 안정성을 확인하고, 유지보수를 이어서 맡습니다.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ━━ Capabilities - 세 장의 패널 ━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Capabilities" title="전문 역량"
            desc="유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다." />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {teamCapabilities.capabilities.map((capability, index) => (
              <TeamCapabilityCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Organization ━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Organization" title="조직 구성"
            desc="개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다." />
          <OrgChart />
        </div>
      </section>

      {/* ━━ Awards & Exhibitions - 해마다 묶은 목록 ━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Awards & Exhibitions" title="수상 및 전시 경력" />

          <div className="space-y-14 sm:space-y-16">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={staggerRows} className="grid gap-x-gutter gap-y-4 lg:grid-cols-12">
                <motion.p variants={rowIn} className="font-mono text-[13px] text-white/50 tabular-nums lg:col-span-2 lg:pt-5">
                  {year}
                </motion.p>
                <div className="border-t border-white/[0.12] lg:col-span-10">
                  {awards.filter(a => a.year === year).map((award) => {
                    const Icon = getAwardIcon(award);
                    return (
                      <motion.div key={award.id} variants={rowIn}
                        className="group flex items-start gap-4 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.02]">
                        <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center ${
                          award.type === 'exhibition' ? 'border border-white/25 text-white/70' : 'bg-primary-200 text-white'}`}>
                          <Icon size={12} />
                        </span>
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-8">
                          <div className="min-w-0">
                            <p className="text-[17px] font-medium leading-snug tracking-[-0.012em] text-[var(--text-1)]">{award.title}</p>
                            <p className="mt-1 text-[14px] text-white/55">{award.organization}</p>
                          </div>
                          <div className="mt-3 flex flex-shrink-0 flex-wrap items-center gap-2 sm:mt-0">
                            <span className="font-mono text-[11px] uppercase text-white/45">
                              {award.type === 'exhibition' ? '전시' : '수상'}
                            </span>
                            {award.rank && <span className="tag">{award.rank}</span>}
                          </div>
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

      <CtaSection line1="함께 프로젝트를" line2="시작해볼까요?"
        kr="무료 상담으로 가능성을 확인하세요." cta="문의하기" />
    </>
  );
}
