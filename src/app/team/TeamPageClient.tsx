'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import TeamCapabilityCard from '@/components/TeamCapabilityCard';
import OrgChart from '@/components/OrgChart';
import { teamCapabilities, awards, type Award } from '@/data/teamCapabilities';
import {
  FiArrowRight, FiStar, FiFileText, FiBookmark, FiGrid,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { fadeUp, revealUp, clipUp, stagger, inView, easeEnter } from '@/lib/motion';

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

export default function TeamPageClient() {
  const yearGroups = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        eyebrow="About Team"
        title="MATE 팀 소개"
        description="Unity 게임 · AR/VR · 웹/앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다."
      />

      {/* ━━ 핵심 수치 스트립 ━━ */}
      <section className="bg-[#f4f6f8] border-b border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 64 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: i * 0.12, duration: 1.05, ease: easeEnter }}
                className={[
                  'py-10 sm:py-14 px-5 sm:px-8 border-[#d1d6db]',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'sm:border-l' : '',
                  i >= 2 ? 'sm:border-t-0' : '',
                ].join(' ')}>
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em] mb-3">{stat.value}</p>
                <p className="text-[14px] text-[#6b7684]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ About MATE — 좌 제목 / 우 본문 ━━ */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-y-16 gap-x-10">
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-5">
              <p className="index-num mb-6">About</p>
              <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
                style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                Unity · 웹 · 앱까지<br />한 팀에서
              </h2>
            </motion.div>

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
                    className="grid sm:grid-cols-[11rem_1fr] gap-x-8 gap-y-2 py-8 border-b border-[#e5e8eb] first:border-t first:border-[#e5e8eb]">
                    <p className="text-[17px] font-bold text-[#191f28]">{item.title}</p>
                    <p className="text-[16px] text-[#4e5968] leading-[1.75]">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ Vision ━━ */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num mb-6">Vision</motion.p>

          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06] mb-16"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">
                MATE <span className="text-[#3182f6]">=</span> 기획 + 개발 + 배포
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block text-[#adb5bd]">끝까지 함께하는 개발 파트너</motion.span>
            </span>
          </motion.h2>

          <div className="grid lg:grid-cols-12 gap-y-8 gap-x-10">
            <motion.p {...inView} variants={revealUp}
              className="lg:col-span-6 lg:col-start-7 text-[17px] sm:text-xl text-[#4e5968] leading-[1.75]">
              요구사항을 정리하는 기획 단계부터 설계와 개발, 배포와 운영까지 프로젝트의 전 과정을 한 팀이 책임집니다.
              요청받은 기능을 만들어 넘기고 끝나는 외주가 아니라, 만들기 전에 방향을 함께 검증하고
              배포 이후의 개선까지 이어가는 파트너로 일합니다.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ━━ 전문 역량 — 딥 잉크 프리미엄 패널 ━━ */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[32px] bg-[#191f28] px-6 py-20 sm:px-16 sm:py-28 overflow-hidden">
            <motion.div {...inView} variants={revealUp} className="mb-20 max-w-2xl">
              <p className="text-[14px] font-semibold text-[#5a9cf8] mb-6">Capabilities</p>
              <h2 className="text-white font-extrabold tracking-[-0.035em] leading-[1.06] mb-7"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
                전문 역량
              </h2>
              <p className="text-[17px] text-white/65 leading-[1.75]">
                유니티 외주 개발과 강의를 통해 쌓은 실전 경험입니다.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamCapabilities.capabilities.map((capability, index) => (
                <TeamCapabilityCard key={capability.id} capability={capability} index={index} onBlue />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 조직도 ━━ */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-8 mb-20">
            <div className="max-w-3xl">
              <p className="index-num mb-6">Organization</p>
              <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
                style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                조직 구성
              </h2>
            </div>
            <p className="text-[16px] text-[#4e5968] leading-[1.75] pb-3 max-w-sm">
              개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다.
            </p>
          </motion.div>

          <OrgChart />
        </div>
      </section>

      {/* ━━ 수상 및 전시 ━━ */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-20 max-w-3xl">
            <p className="index-num mb-6">Awards &amp; Exhibitions</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
              수상 및 전시 경력
            </h2>
          </motion.div>

          <div className="max-w-5xl space-y-20">
            {yearGroups.map((year) => (
              <motion.div key={year} {...inView} variants={stagger} className="border-t border-[#d1d6db] pt-8">
                <span className="index-num-lg mb-8">{year}</span>
                <div>
                  {awards.filter(a => a.year === year).map((award) => {
                    const Icon = getAwardIcon(award);
                    return (
                      <motion.div key={award.id} variants={fadeUp}
                        className="flex items-start gap-5 py-6 border-b border-[#d1d6db]">
                        <span className="flex-shrink-0 mt-0.5 w-12 h-12 rounded-2xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6]">
                          <Icon size={20} />
                        </span>
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-8">
                          <div className="min-w-0">
                            <p className="text-[17px] font-bold text-[#191f28] leading-snug">{award.title}</p>
                            <p className="text-[15px] text-[#4e5968] mt-1.5">{award.organization}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 flex-shrink-0">
                            <span className="tag-blue">
                              {award.type === 'exhibition' ? '전시회' : '수상'}
                            </span>
                            {award.rank && (
                              <span className="inline-flex items-center rounded-full border border-[#d1d6db] bg-white px-3 py-1 text-[13px] font-medium text-[#4e5968]">
                                {award.rank}
                              </span>
                            )}
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

      {/* ━━ 초대형 중앙 CTA ━━ */}
      <section className="py-40 sm:py-56 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-10 max-w-6xl mx-auto"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">함께 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">시작해볼까요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="text-[17px] sm:text-xl text-[#4e5968] leading-[1.75] mb-14">
            무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-3 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
              문의하기
              <FiArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
