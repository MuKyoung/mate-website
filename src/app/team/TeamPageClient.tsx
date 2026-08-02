'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import OrgChart from '@/components/OrgChart';
import { teamCapabilities, awards, type Award } from '@/data/teamCapabilities';
import {
  FiArrowUpRight, FiStar, FiFileText, FiBookmark, FiGrid,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

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
  { value: '7명', label: '전문 인력' },
  { value: '100%', label: '성공률' },
];

const whyChooseUs = [
  { title: '검증된 경험',        desc: '5년 이상의 유니티 외주 개발 경험, 30개 이상 프로젝트 완수' },
  { title: '전문 팀 구성',        desc: '클라이언트 · 서버 · UI/UX 각 분야 전문가로 구성' },
  { title: '투명한 커뮤니케이션', desc: '프로젝트 전 과정에서 지속적인 소통과 진행 상황 공유' },
  { title: '품질 보증',           desc: '철저한 테스트와 코드 리뷰로 높은 품질의 결과물 제공' },
];

/* 섹션 헤더 — 라벨 행 + 대형 타이틀 (홈과 동일 패턴) */
function SectionHead({ num, label, title, desc }: {
  num: string; label: string; title: React.ReactNode; desc?: string;
}) {
  return (
    <div className="mb-16 sm:mb-20">
      <motion.p {...inView} variants={fadeUp}
        className="index-num pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-14">
        ({num}) {label}
      </motion.p>
      <motion.h2 {...inView} variants={fadeUp}
        className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04]"
        style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
        {title}
      </motion.h2>
      {desc && (
        <motion.p {...inView} variants={fadeUp}
          className="mt-7 text-[17px] text-[#4e5968] leading-[1.75] max-w-xl">
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

      {/* ━━ 핵심 수치 — 헤어라인 스트립 ━━ */}
      <section className="bg-white border-b border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label}
                className={[
                  'border-[#e5e8eb]',
                  i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
                  i >= 2 ? 'lg:border-t-0' : '',
                ].join(' ')}>
                <div className="flex items-baseline gap-3 py-7 sm:py-9">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]">
                    {stat.value}
                  </span>
                  <span className="text-[13px] text-[#6b7684]">{stat.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (01) About — 좌 제목 / 우 본문 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp}
            className="index-num pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-14">(01) About</motion.p>

          <div className="grid lg:grid-cols-12 gap-y-14 gap-x-8">
            <motion.h2 {...inView} variants={fadeUp}
              className="lg:col-span-5 text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
              Unity · 웹 · 앱까지<br />한 팀에서
            </motion.h2>

            <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
              <motion.p variants={fadeUp}
                className="text-xl sm:text-2xl font-semibold text-[#191f28] leading-[1.5] mb-8">
                MATE는 Unity 게임 · AR/VR · 웹/앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다.
              </motion.p>
              <motion.p variants={fadeUp} className="text-[17px] text-[#4e5968] leading-[1.75] mb-16">
                5년 이상의 외주 개발 경험과 30개 이상의 완료 프로젝트를 바탕으로,
                개발 4명 · 디자인 2명 · 운영 1명, 총 7명이 하나의 팀으로 움직입니다.
                여러 회사에 나눠 맡기지 않아도, 필요한 개발을 한 팀에서 해결할 수 있습니다.
              </motion.p>

              <div>
                {whyChooseUs.map((item) => (
                  <motion.div key={item.title} variants={fadeUp}
                    className="grid sm:grid-cols-[11rem_1fr] gap-x-8 gap-y-2 py-7 border-t border-[#e5e8eb] last:border-b">
                    <p className="text-[17px] font-bold text-[#191f28]">{item.title}</p>
                    <p className="text-[15px] text-[#4e5968] leading-[1.75]">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ (02) Vision — 대형 스테이트먼트 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp}
            className="index-num pb-6 border-b border-[#e5e8eb] mb-14 sm:mb-20">(02) Vision</motion.p>

          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.1] mb-16 sm:mb-24"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">
                MATE <span className="text-[#3182f6]">=</span> 기획 + 개발 + 배포
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block text-[#c6cbd1]">끝까지 함께하는 개발 파트너</motion.span>
            </span>
          </motion.h2>

          <div className="grid lg:grid-cols-12 gap-y-8 gap-x-8">
            <motion.p {...inView} variants={fadeUp}
              className="lg:col-span-6 lg:col-start-7 text-[17px] sm:text-xl text-[#4e5968] leading-[1.75]">
              요구사항을 정리하는 기획 단계부터 설계와 개발, 배포와 운영까지 프로젝트의 전 과정을 한 팀이 책임집니다.
              요청받은 기능을 만들어 넘기고 끝나는 외주가 아니라, 만들기 전에 방향을 함께 검증하고
              배포 이후의 개선까지 이어가는 파트너로 일합니다.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ━━ (03) Capabilities — 헤어라인 3열 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="03" label="Capabilities" title="전문 역량"
            desc="유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다." />

          <div className="grid grid-cols-1 md:grid-cols-3">
            {teamCapabilities.capabilities.map((capability, index) => (
              <div key={capability.id}
                className={[
                  'border-[#e5e8eb]',
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
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="04" label="Organization" title="조직 구성"
            desc="개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다." />

          <OrgChart />
        </div>
      </section>

      {/* ━━ (05) Awards & Exhibitions ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="05" label={'Awards & Exhibitions'} title="수상 및 전시 경력" />

          <div className="max-w-5xl space-y-16 sm:space-y-20">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={stagger}>
                <span className="index-num-lg mb-6">{year}</span>
                <div className="mt-6">
                  {awards.filter(a => a.year === year).map((award) => {
                    const Icon = getAwardIcon(award);
                    return (
                      <motion.div key={award.id} variants={fadeUp}
                        className="flex items-start gap-4 py-5 border-t border-[#e5e8eb] last:border-b">
                        <Icon size={17} className="flex-shrink-0 mt-1 text-[#adb5bd]" />
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-8">
                          <div className="min-w-0">
                            <p className="text-[17px] font-bold text-[#191f28] leading-snug">{award.title}</p>
                            <p className="text-[15px] text-[#4e5968] mt-1">{award.organization}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 mt-3 sm:mt-0 flex-shrink-0">
                            <span className="text-[13px] text-[#adb5bd]">
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
      <section className="py-32 sm:py-48 bg-white border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num mb-10">(06) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.96] mb-10 sm:mb-12"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">함께 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">시작해볼까요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp}
            className="text-[17px] text-[#4e5968] leading-[1.75] mb-12 sm:mb-14">
            무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
              문의하기
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-[#4e5968] hover:text-[#191f28] border-b border-[#d1d6db] hover:border-[#191f28] pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
