'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import OrgChart from '@/components/OrgChart';
import { teamCapabilities, awards, type Award } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import {
  FiArrowUpRight, FiStar, FiFileText, FiBookmark, FiGrid,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import {
  fadeUp, fadeLeft, fadeRight, riseTilt, clipUp, clipLeft, clipRight, lineDraw, stagger, inView,
} from '@/lib/motion';
import {
  arrowHover, btnPrimary, clipWrap, container, CONTACT_EMAIL, displaySize,
  displaySizeLg, hairlineCell, linkUnderline, sectionPad, sectionPadLg,
} from '@/lib/styles';

/* 수상 랭크 → react-icons (UI 이모지 금지) */
function getAwardIcon(award: Award): IconType {
  if (award.type === 'exhibition') return FiGrid;
  const rank = award.rank ?? '';
  if (rank.includes('인증서')) return FiFileText;
  if (['대상', '금상', '은상', '동상', '최우수상', '우수상', '장려상', '우수논문상'].includes(rank)) return FiStar;
  if (rank.includes('장상') || rank.includes('원장상')) return FiStar;
  return FiBookmark;
}

const TOTAL = teamCapabilities.capabilities.reduce((n, c) => n + c.projects, 0);

const stats = [
  { value: `${TOTAL}+`, label: '누적 프로젝트' },
  { value: `${projects.length}건`, label: '포트폴리오 공개' },
  { value: '5년', label: '팀 운영' },
  { value: `${teamCapabilities.stats.teamMembers}명`, label: '개발 4 · 디자인 2 · 운영 1' },
];

const whyChooseUs = [
  { title: '열린 저장소',        desc: '개발 중에도 GitHub을 열어 둡니다. 진행률을 물어보실 필요가 없습니다' },
  { title: '담당자 고정',        desc: '계약 때 만난 사람이 배포까지 갑니다. 중간에 팀이 바뀌지 않습니다' },
  { title: '한 팀 전담',          desc: '기획 · 개발 · 디자인 · 운영을 외부에 다시 넘기지 않습니다' },
  { title: '전부 인계',           desc: '소스 코드와 문서, 인프라 계정 소유권까지 넘겨드립니다' },
];

/* 섹션 헤더 — 라벨 행(라인 드로우) + 대형 타이틀 (홈과 동일 패턴, 섹션별 방향 교차) */
function SectionHead({ num, label, title, desc }: {
  num: string; label: string; title: React.ReactNode; desc?: string;
}) {
  const n = parseInt(num, 10);
  const even = n % 2 === 0;
  const clip = [clipRight, clipUp, clipLeft][n % 3]; // 03 clipRight · 04 clipUp · 05 clipLeft
  return (
    <div className="mb-16 sm:mb-20">
      <div className="relative pb-6 mb-10 sm:mb-14">
        <motion.p {...inView} variants={even ? fadeRight : fadeLeft} className="index-num font-en">
          {label}
        </motion.p>
        <motion.span {...inView} variants={lineDraw}
          className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
      </div>
      <motion.h2 {...inView} variants={stagger}
        className="text-[var(--text-1)] font-bold tracking-[-0.02em] leading-[1.04]"
        style={displaySize}>
        <span className={clipWrap}>
          <motion.span variants={clip} className="block">{title}</motion.span>
        </span>
      </motion.h2>
      {desc && (
        <motion.p {...inView} variants={even ? fadeLeft : fadeRight}
          className="mt-7 text-[17px] text-white/55 leading-[1.75] max-w-xl">
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
        description="개발 4 · 디자인 2 · 운영 1, 일곱 명이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역을 각각 전담합니다."
      />

      {/* ━━ 핵심 수치 — 헤어라인 스트립 ━━ */}
      <section className="border-b border-white/10">
        <div className={container}>
          <motion.div {...inView} variants={stagger} className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={i % 2 === 0 ? fadeUp : riseTilt}
                className={hairlineCell(i)}>
                <div className="flex items-baseline gap-3 py-7 sm:py-9">
                  <span className="font-en text-3xl sm:text-4xl font-bold text-[var(--text-1)] font-mono-stat tracking-[-0.02em]">
                    {stat.value}
                  </span>
                  <span className="text-[13px] text-white/45">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (01) About — 좌 제목 / 우 본문 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="relative pb-6 mb-10 sm:mb-14">
            <motion.p {...inView} variants={fadeLeft} className="index-num font-en">About</motion.p>
            <motion.span {...inView} variants={lineDraw}
              className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
          </div>

          <div className="grid lg:grid-cols-12 gap-y-14 gap-x-8">
            <motion.h2 {...inView} variants={stagger}
              className="lg:col-span-5 text-[var(--text-1)] font-bold tracking-[-0.02em] leading-[1.04]"
              style={displaySize}>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">Unity · 웹 · 앱까지<br />한 팀에서</motion.span>
              </span>
            </motion.h2>

            <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
              <motion.p variants={fadeRight}
                className="text-xl sm:text-2xl font-semibold text-[var(--text-1)] leading-[1.5] mb-8">
                MATE는 웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과
                자체 게임 제작 · 퍼블리싱을 함께 합니다.
              </motion.p>
              <motion.p variants={fadeUp} className="text-[17px] text-white/55 leading-[1.75] mb-16">
                5년간 쌓은 외주 경험을 바탕으로,
                개발 4명 · 디자인 2명 · 운영 1명, 총 7명이 하나의 팀으로 움직입니다.
                여러 회사에 나눠 맡기지 않아도, 필요한 개발을 한 팀에서 해결할 수 있습니다.
              </motion.p>

              <div>
                {whyChooseUs.map((item, i) => (
                  <motion.div key={item.title} variants={i % 2 === 0 ? fadeLeft : fadeRight}
                    className="grid sm:grid-cols-[11rem_1fr] gap-x-8 gap-y-2 py-7 border-t border-white/10 last:border-b">
                    <p className="text-[17px] font-bold text-[var(--text-1)]">{item.title}</p>
                    <p className="text-[15px] text-white/55 leading-[1.75]">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ (02) Vision — 대형 스테이트먼트 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="relative pb-6 mb-14 sm:mb-20">
            <motion.p {...inView} variants={fadeRight} className="index-num font-en">Vision</motion.p>
            <motion.span {...inView} variants={lineDraw}
              className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
          </div>

          <motion.h2 {...inView} variants={stagger}
            className="text-[var(--text-1)] font-bold tracking-[-0.02em] leading-[1.1] mb-16 sm:mb-24"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipLeft} className="block">
                MATE <span className="text-[var(--point)]">=</span> 기획 + 개발 + 배포
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={fadeRight} className="block text-white/30">끝까지 함께하는 개발 파트너</motion.span>
            </span>
          </motion.h2>

          <div className="grid lg:grid-cols-12 gap-y-8 gap-x-8">
            <motion.p {...inView} variants={fadeUp}
              className="lg:col-span-6 lg:col-start-7 text-[17px] sm:text-xl text-white/55 leading-[1.75]">
              요구사항을 정리하는 기획 단계부터 설계와 개발, 배포와 운영까지 프로젝트의 전 과정을 한 팀이 책임집니다.
              요청받은 기능을 만들어 넘기고 끝나는 외주가 아니라, 만들기 전에 방향을 함께 검증하고
              배포 이후의 개선까지 이어가는 파트너로 일합니다.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ━━ (03) Capabilities — 헤어라인 3열 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="03" label="Capabilities" title="전문 역량"
            desc="유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다." />

          <div className="grid grid-cols-1 md:grid-cols-3">
            {teamCapabilities.capabilities.map((capability, index) => (
              <div key={capability.id}
                className={[
                  'border-white/10',
                  index > 0 ? 'border-t pt-12 mt-12 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:pl-10' : '',
                  index < teamCapabilities.capabilities.length - 1 ? 'md:pr-10' : '',
                ].join(' ')}>
                <TeamCapabilityCard capability={capability} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (04) Organization ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="04" label="Organization" title="조직 구성"
            desc="개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다." />

          <OrgChart />
        </div>
      </section>

      {/* ━━ (05) Awards & Exhibitions ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="05" label={'Awards & Exhibitions'} title="수상 및 전시 경력" />

          <div className="max-w-5xl space-y-16 sm:space-y-20">
            {yearGroups.map((year, yi) => (
              <motion.div key={year} {...inView} variants={stagger}>
                <motion.span variants={yi % 2 === 0 ? fadeLeft : fadeRight}
                  className="index-num-lg font-en mb-6">{year}</motion.span>
                <div className="mt-6">
                  {awards.filter(a => a.year === year).map((award, ri) => {
                    const Icon = getAwardIcon(award);
                    // 연도 라벨과 반대 방향에서 시작해 행마다 교차
                    const rowDir = (yi + ri) % 2 === 0 ? fadeRight : fadeLeft;
                    return (
                      <motion.div key={award.id} variants={rowDir}
                        className="flex items-start gap-4 py-5 border-t border-white/10 last:border-b">
                        <Icon size={17} className="flex-shrink-0 mt-1 text-white/30" />
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-8">
                          <div className="min-w-0">
                            <p className="text-[17px] font-bold text-[var(--text-1)] leading-snug">{award.title}</p>
                            <p className="text-[15px] text-white/55 mt-1">{award.organization}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 mt-3 sm:mt-0 flex-shrink-0">
                            <span className="text-[13px] text-white/30">
                              {award.type === 'exhibition' ? '전시회' : '수상'}
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

      {/* ━━ (06) CTA ━━ */}
      <section className={`${sectionPadLg} border-t border-white/10`}>
        <div className={container}>
          <motion.p {...inView} variants={fadeUp} className="index-num font-en mb-10">Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="text-[var(--text-1)] font-bold tracking-[-0.02em] leading-[1.1] mb-8"
            style={displaySizeLg}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipLeft} className="block">함께 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block text-[var(--point)]">시작해볼까요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeLeft} className="caption-kr mb-14 sm:mb-20">
            — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeRight} className="flex flex-wrap items-center gap-8">
            <Link href="/contact" className={btnPrimary}>
              문의하기
              <FiArrowUpRight size={17} className={arrowHover} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkUnderline}>
              {CONTACT_EMAIL}
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
