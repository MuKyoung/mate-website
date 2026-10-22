'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiGitBranch, FiCalendar, FiPackage, FiActivity, FiMapPin, FiPhone, FiMail, FiMessageCircle, FiArrowUpRight,
} from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import { teamCapabilities, awards, counts } from '@/data/teamCapabilities';
import { departments } from '@/data/organization';
import { business } from '@/data/business';
import { projects } from '@/data/projects';
import { navItems } from '@/data/navigation';
import { fadeLeft, fadeRight, fadeUp, stagger, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, container, radiusCard, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/* 머리 탭 = 상단 메뉴 '회사소개' 의 하위 메뉴. 같은 페이지 안의 칸으로 간다 */
const TABS = (navItems.find((n) => n.href === '/team')?.children ?? []).map((c) => ({
  href: c.href.replace('/team', ''),
  label: c.label,
}));
const SPY_IDS = TABS.map((t) => t.href.slice(1));

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

/* 홈의 '일하는 방식' 과 같은 근거(faq.ts, process.ts)에서만 가져온다 */
const ways: { title: string; desc: string; icon: IconType }[] = [
  { title: '열린 저장소', desc: 'GitHub로 관리합니다. 프로젝트 기간 동안 진행 상황을 실시간으로 보실 수 있습니다.', icon: FiGitBranch },
  { title: '주간 공유', desc: '개발 단계에서는 주 단위로 공유하고, 코드 리뷰를 거쳐 올립니다.', icon: FiCalendar },
  { title: '소스 · 문서 인계', desc: '프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다.', icon: FiPackage },
  { title: '배포 후 모니터링', desc: '배포한 뒤에도 모니터링으로 안정성을 확인합니다.', icon: FiActivity },
];

const years = Array.from(new Set(awards.map((a) => a.year))).sort((a, b) => b - a);

/* 카카오맵 검색 - 건물 번지까지만 넘긴다 */
const mapQuery = `${business.addressParts.region} ${business.addressParts.locality} ${business.addressParts.street.split(',')[0]}`;
const MAP_URL = `https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`;

/** 지금 읽고 있는 칸 - 머리 탭에 표시한다 */
function useSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const update = () => {
      let cur = ids[0];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) cur = id;
      });
      setActive(cur);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [ids]);
  return active;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function TeamPageClient() {
  const active = useSpy(SPY_IDS);

  return (
    <>
      <PageHeader eyebrow="Company" title="회사소개" tabs={TABS} active={`#${active}`}
        desc="개발 · 디자인 · 운영이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역을 각각 전담합니다." />

      {/* ━━ 소개 - 왼쪽 로고 판, 오른쪽 글과 회사 정보 (Figma 2-4. greeting) ━━ */}
      <section id="about" data-header="light" className="bg-white py-24 sm:py-32 xl:py-[160px]">
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

      {/* ━━ 일하는 방식 - 남색 면 위로 계단처럼 오르는 판 (Figma 4-2. technology) ━━ */}
      <section id="how" data-header="dark" className="night-grid relative overflow-hidden py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <SectionHead dark eyebrow="How we work"
            title={<>MATE가 <b>일하는 방식</b>을<br /><b>네 가지</b>로 정리했습니다</>} />
          <motion.ul {...inView} variants={staggerTight}
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:items-end">
            {ways.map((w, i) => {
              const Icon = w.icon;
              return (
                <motion.li key={w.title} variants={fadeUp}
                  className={`flex min-h-[260px] flex-col border border-[rgba(125,149,255,0.35)] bg-[rgba(14,21,50,0.78)] p-6 shadow-[0_0_40px_rgba(38,68,203,0.22)] backdrop-blur-sm sm:p-7 ${radiusCard} ${
                    ['lg:mb-0', 'lg:mb-10', 'lg:mb-20', 'lg:mb-[120px]'][i]
                  }`}>
                  <span className="text-[13px] font-bold tabular-nums text-gray-400">{pad(i + 1)}</span>
                  <span aria-hidden className="mt-6 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[rgba(38,68,203,0.25)] text-point-light">
                    <Icon size={24} />
                  </span>
                  <h3 className="type-b1 mt-auto pt-8 text-white">{w.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-gray-300">{w.desc}</p>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 역량 - 세 칸 목록 (Figma 4-3. certified) ━━ */}
      <section id="capabilities" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <SectionHead align="center" eyebrow="Capabilities"
            title={<>유니티 외주 개발과 강의로 쌓은<br /><b>전문 역량</b></>}
            desc={teamCapabilities.capabilities.map((c) => `${c.title} ${c.projects}+`).join(' · ')} />
          <motion.div {...inView} variants={staggerTight} className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-20">
            {teamCapabilities.capabilities.map((c) => (
              <motion.div key={c.id} variants={fadeUp}>
                <h3 className="type-h2 text-ink">{c.title}</h3>
                <p className="mt-2 text-[14px] font-bold text-point-200">
                  경력 {c.experience} · {c.id === 'education' ? '진행 강의' : '납품 프로젝트'} {c.projects}+
                </p>
                <p className="type-b3 mt-4 text-ink-2">{c.description}</p>
                <ul className="mt-6 border-t border-gray-300">
                  {c.skills.map((s) => (
                    <li key={s} className="flex items-center justify-between gap-4 border-b border-gray-300 py-3.5 text-[15px] text-ink-2">
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
      <section id="organization" data-header="light" className="bg-white py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <SectionHead eyebrow="Organization" title={<><b>조직 구성</b></>}
            desc="개발 · 디자인 · 운영 세 축이 하나의 팀으로 움직입니다." />
          <motion.ul {...inView} variants={staggerTight} className="mt-12 grid gap-3 md:grid-cols-3 lg:gap-4">
            {departments.map((d) => (
              <motion.li key={d.id} variants={fadeUp} className={`flex flex-col bg-gray-100 p-6 sm:p-8 ${radiusCard}`}>
                <p className="text-[14px] font-bold text-point-200">{d.label}</p>
                <h3 className="type-h2 mt-2 text-ink">{d.name}</h3>
                <p className="type-b3 mt-4 text-ink-2">{d.description}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-gray-200 pt-5">
                  {d.focus.map((f) => (
                    <li key={f} className="rounded-pill bg-white px-3 py-1.5 text-[13px] font-bold text-gray-500">{f}</li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 수상 · 전시 - 해마다 묶은 연혁 (Figma 3-2. history) ━━ */}
      <section id="awards" data-header="light" className="border-t border-line bg-white py-24 sm:py-32 xl:py-[160px]">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHead eyebrow="Awards & Exhibitions" title={<>수상 및<br /><b>전시 경력</b></>}
                desc={`상과 선정, 참가한 전시 ${awards.length}건을 해마다 묶었습니다.`} />
            </div>
          </div>
          <ol className="relative ml-1 border-l border-[rgba(38,68,203,0.5)] pl-8 sm:pl-12 lg:col-span-7">
            {years.map((y) => (
              <motion.li key={y} {...inView} variants={staggerRows} className="relative pb-14 last:pb-0">
                <span aria-hidden className="absolute -left-[37px] top-[12px] h-2.5 w-2.5 rounded-pill bg-point-200 ring-4 ring-white sm:-left-[53px] sm:top-[15px]" />
                <motion.p variants={rowIn} className="text-[32px] font-bold leading-none tabular-nums text-ink sm:text-[40px]">{y}</motion.p>
                <ul className="mt-5 space-y-3">
                  {awards.filter((a) => a.year === y).map((a) => (
                    <motion.li key={a.id} variants={rowIn} className="grid grid-cols-[44px_1fr] gap-x-3 text-[15px] leading-[1.6]">
                      <span className="pt-0.5 text-[13px] font-bold text-gray-400">{a.type === 'exhibition' ? '전시' : '수상'}</span>
                      <span>
                        <span className="font-bold text-ink">{a.title}</span>
                        <span className="text-gray-500"> · {a.organization}</span>
                        {a.rank && <span className="ml-2 whitespace-nowrap font-bold text-point-200">{a.rank}</span>}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ━━ 오시는 길 (Figma 5-2. map) ━━ */}
      <section id="access" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <SectionHead align="center" eyebrow="Access" title={<b>오시는 길</b>} />
          <div className="mt-12 grid gap-3 lg:mt-14 lg:grid-cols-[minmax(0,868fr)_minmax(0,616fr)] lg:gap-2">
            <motion.div {...inView} variants={fadeLeft}
              className={`night-grid relative flex min-h-[300px] flex-col justify-end overflow-hidden p-7 text-white sm:min-h-[400px] sm:p-10 ${radiusCard}`}>
              <span aria-hidden className="absolute left-1/2 top-[40%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-point-200 text-white shadow-[0_0_0_10px_rgba(38,68,203,0.25),0_0_0_22px_rgba(38,68,203,0.12)]">
                <FiMapPin size={24} />
              </span>
              <p className="text-[14px] font-bold text-point-light">{business.addressParts.region} {business.addressParts.locality}</p>
              <p className="mt-2 text-[20px] font-bold leading-[1.45] sm:text-[24px]">{business.address}</p>
            </motion.div>

            <motion.div {...inView} variants={fadeRight} className="flex flex-col gap-2">
              <ul className={`flex-1 space-y-6 border border-gray-300 bg-white p-7 sm:p-8 ${radiusCard}`}>
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
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-[6px] bg-point-200 text-[15px] font-bold text-white transition-colors hover:bg-point-300">
                <FiMapPin size={17} />
                카카오맵에서 보기
                <FiArrowUpRight size={15} className={arrowHover} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
