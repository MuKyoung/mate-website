'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiGitBranch, FiCalendar, FiPackage, FiActivity, FiMapPin, FiPhone, FiMail, FiMessageCircle, FiArrowUpRight,
} from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import AwardsShowcase from '@/components/team/AwardsShowcase';
import { teamCapabilities, counts } from '@/data/teamCapabilities';
import { departments } from '@/data/organization';
import { business } from '@/data/business';
import { projects } from '@/data/projects';
import { navItems } from '@/data/navigation';
import { promises, type WorkPromise } from '@/data/promises';
import { fadeLeft, fadeRight, fadeUp, stagger, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, chipLine, container, iconTile, radiusCard, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/* 머리 탭 = 상단 메뉴 '회사소개' 의 하위 메뉴. 같은 페이지 안의 칸으로 간다 */
const TABS = (navItems.find((n) => n.href === '/team')?.children ?? []).map((c) => ({
  href: c.href.replace('/team', ''),
  label: c.label,
}));

/* 개발 납품과 강의는 따로 센다. 둘을 더해 '누적 프로젝트' 라고 쓰면 틀린 말이 된다.
   회사 인원은 적지 않는다 (사용자 요청, 2026-10-16). */
const facts: [string, string][] = [
  ['상호', `${business.name} (${business.brand})`],
  ['대표', business.owner],
  ['시작한 해', `${teamCapabilities.stats.since}`],
  ['개발 프로젝트 납품', `${counts.devProjects}+`],
  ['진행 강의', `${counts.lectures}+`],
  ['포트폴리오 공개', `${projects.length}건`],
];

const ICON: Record<WorkPromise['id'], IconType> = {
  repo: FiGitBranch,
  weekly: FiCalendar,
  handover: FiPackage,
  monitor: FiActivity,
};

/* 카카오맵 검색 - 건물 번지까지만 넘긴다 */
const mapQuery = `${business.addressParts.region} ${business.addressParts.locality} ${business.addressParts.street.split(',')[0]}`;
const MAP_URL = `https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`;

const pad = (n: number) => String(n).padStart(2, '0');

export default function TeamPageClient() {
  return (
    <>
      <PageHeader eyebrow="Company" title="회사소개" tabs={TABS} active="#about"
        desc="개발 · 디자인 · 운영이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역을 각각 전담합니다." />

      {/* ━━ 소개 - 왼쪽 로고 판, 오른쪽 글과 회사 정보 ━━ */}
      <section id="about" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid items-center gap-12 lg:grid-cols-12 lg:gap-8`}>
          <motion.div {...inView} variants={fadeLeft}
            className={`relative flex aspect-[4/5] max-h-[620px] w-full flex-col items-center justify-center gap-5 overflow-hidden bg-point-200 text-white lg:col-span-5 ${radiusCard}`}
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}>
            <span aria-hidden className="absolute left-5 top-5 h-6 w-6 border-l-2 border-t-2 border-white/80" />
            <span aria-hidden className="absolute bottom-5 right-5 h-6 w-6 border-b-2 border-r-2 border-white/80" />
            <span className="text-[11px] font-bold tracking-[0.22em] text-white/80 sm:text-[12px]">WEB · APP · GAME · XR · EDUCATION</span>
            <Image src="/images/logo.png" alt="MATE" width={1991} height={493} className="h-10 w-auto brightness-0 invert sm:h-14" />
            <span className="text-[13px] text-white/75">Since {teamCapabilities.stats.since}</span>
          </motion.div>

          <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
            <motion.p variants={fadeUp} className="eyebrow mb-3">About</motion.p>
            <motion.h2 variants={fadeUp} className="type-h1 text-ink">
              Unity · 웹 · 앱까지<br /><b>한 팀에서</b>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-8 text-[18px] font-bold leading-[1.6] text-ink sm:text-[20px]">
              MATE는 웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다.
            </motion.p>
            <motion.p variants={fadeUp} className="type-b3 mt-5 text-ink-2">
              {teamCapabilities.stats.since}년부터 쌓은 외주 경험을 바탕으로, 개발 · 디자인 · 운영이 하나의 팀으로 움직입니다.
              여러 회사에 나눠 맡기지 않아도, 필요한 개발을 한 팀에서 해결할 수 있습니다.
            </motion.p>
            <motion.p variants={fadeUp} className="type-b3 mt-4 text-ink-2">
              단순 기능 구현을 넘어 기획 · 디자인 · 개발 · 배포 전 과정을 함께하는 파트너십을 지향합니다.
              배포한 뒤에도 모니터링으로 안정성을 확인하고, 유지보수를 이어서 맡습니다.
            </motion.p>
            <motion.dl variants={fadeUp} className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-6 border-b border-line py-4">
                  <dt className="text-[14px] text-gray-500">{k}</dt>
                  <dd className="text-right text-[15px] font-bold text-ink">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>
        </div>
      </section>

      {/* ━━ 일하는 방식 - 윗선과 번호가 달린 네 단 ━━ */}
      <section id="how" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="How We Work" title={<>MATE가 <b>일하는 방식</b></>} />
          <motion.ol {...inView} variants={staggerTight} className="mt-12 grid gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p, i) => {
              const Icon = ICON[p.id];
              return (
                <motion.li key={p.id} variants={fadeUp} className="border-t-2 border-ink pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold tabular-nums text-point-200">{pad(i + 1)}</span>
                    <span aria-hidden className={iconTile}><Icon size={22} /></span>
                  </div>
                  <h3 className="type-b1 mt-8 text-ink">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.7] text-ink-2">{p.desc}</p>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </section>

      {/* ━━ 역량 - 세 단의 목록 ━━ */}
      <section id="capabilities" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Capabilities"
            title={<>유니티 외주 개발과 강의로 쌓은<br /><b>전문 역량</b></>} />
          <motion.div {...inView} variants={staggerTight} className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-20">
            {teamCapabilities.capabilities.map((c) => (
              <motion.div key={c.id} variants={fadeUp}>
                <p className="text-[14px] font-bold text-point-200">
                  {c.id === 'education' ? '진행 강의' : '납품 프로젝트'} {c.projects}+ · 경력 {c.experience}
                </p>
                <h3 className="type-h2 mt-3 text-ink">{c.title}</h3>
                <p className="type-b3 mt-3 text-ink-2">{c.description}</p>
                <ul className="mt-6 border-t border-line">
                  {c.skills.map((s) => (
                    <li key={s} className="flex items-center justify-between gap-4 border-b border-line py-3.5 text-[15px] text-ink-2">
                      {s}
                      <span aria-hidden className="h-1.5 w-1.5 rounded-pill bg-point-200" />
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ 조직 ━━ */}
      <section id="organization" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Organization" title={<><b>조직 구성</b></>}
            desc="개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다." />
          <motion.ul {...inView} variants={staggerTight} className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
            {departments.map((d) => (
              <motion.li key={d.id} variants={fadeUp} className={`flex flex-col border border-line bg-white p-6 sm:p-8 ${radiusCard}`}>
                <p className="text-[14px] font-bold text-point-200">{d.label}</p>
                <h3 className="type-h2 mt-2 text-ink">{d.name}</h3>
                <p className="type-b3 mt-4 text-ink-2">{d.description}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                  {d.focus.map((f) => <li key={f} className={chipLine}>{f}</li>)}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 수상 · 전시 - 갈래 탭과 증서 카드 ━━ */}
      <AwardsShowcase />

      {/* ━━ 오시는 길 ━━ */}
      <section id="access" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Access" title={<><b>오시는 길</b></>} />
          <div className="mt-12 grid gap-3 lg:mt-14 lg:grid-cols-[minmax(0,868fr)_minmax(0,616fr)] lg:gap-2">
            <motion.div {...inView} variants={fadeLeft}
              className={`night-grid on-night relative flex min-h-[300px] flex-col justify-end overflow-hidden p-7 text-white sm:min-h-[400px] sm:p-10 ${radiusCard}`}>
              <span aria-hidden className="absolute left-1/2 top-[40%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-point-200 text-white shadow-[0_0_0_10px_rgba(38,68,203,0.25),0_0_0_22px_rgba(38,68,203,0.12)]">
                <FiMapPin size={24} />
              </span>
              <p className="text-[14px] font-bold text-point-light">{business.addressParts.region} {business.addressParts.locality}</p>
              <p className="mt-2 text-[20px] font-bold leading-[1.45] sm:text-[24px]">{business.address}</p>
            </motion.div>

            <motion.div {...inView} variants={fadeRight} className="flex flex-col gap-2">
              <ul className={`flex-1 space-y-6 border border-line bg-white p-7 sm:p-8 ${radiusCard}`}>
                {[
                  { icon: FiMapPin, label: '주소', value: business.address },
                  { icon: FiPhone, label: '대표 전화', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
                  { icon: FiMail, label: '이메일', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                  { icon: FiMessageCircle, label: '카카오톡', value: '1:1 오픈채팅', href: KAKAO_OPEN_CHAT_URL },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <li key={r.label}>
                      <p className="flex items-center gap-2 text-[15px] font-bold text-point-200"><Icon size={17} />{r.label}</p>
                      {r.href ? (
                        <a href={r.href} className="mt-1.5 block break-all text-[15px] text-ink-2 hover:text-point-200"
                          {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          {r.value}
                        </a>
                      ) : (
                        <p className="mt-1.5 text-[15px] text-ink-2">{r.value}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <motion.a variants={fadeUp} href={MAP_URL} target="_blank" rel="noopener noreferrer"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-pill bg-point-200 text-[15px] font-bold text-white transition-colors hover:bg-point-300">
                <FiMapPin size={17} />
                카카오맵에서 보기
                <FiArrowUpRight size={15} className={arrowHover} />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
