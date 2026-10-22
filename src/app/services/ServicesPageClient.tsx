'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import { domains } from '@/data/domains';
import { heroSlides } from '@/data/home';
import { games } from '@/data/games';
import { serviceTabs } from '@/data/navigation';
import { processSteps } from '@/data/process';
import { fadeLeft, fadeRight, fadeUp, stagger, staggerTight, inView } from '@/lib/motion';
import { arrowHover, btnPoint, btnSm, container, radiusCard } from '@/lib/styles';

/* 영역마다 한 장 - 사진 한 장은 이 페이지에서 한 자리만 쓴다 */
const ROW_IMAGE: Record<string, { src: string; alt: string; position?: string }> = {
  web: { src: '/images/projects/세종호이스트크레인-메인.webp', alt: '(주)세종호이스트크레인 홈페이지에 쓴 갠트리 크레인 사진', position: 'center 62%' },
  game: { src: '/images/projects/꼬꼬지생.webp', alt: '꼬꼬지생 타이틀 화면' },
  edu: { src: '/images/projects/미래산업과학고.webp', alt: '미래산업과학고등학교 수업 현장', position: '50% 42%' },
};

const pad = (n: number) => String(n).padStart(2, '0');

export default function ServicesPageClient() {
  return (
    <>
      <PageHeader eyebrow="Services" title="사업영역" tabs={serviceTabs} active="/services"
        desc="웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다." />

      {/* ━━ 개요 ━━ */}
      <section data-header="light" className="bg-white pt-24 sm:pt-32 xl:pt-[160px]">
        <div className={container}>
          <SectionHead align="center" eyebrow="Overview"
            title={<>세 영역을<br /><b>따로 맡습니다</b></>}
            desc="웹 · 앱, 게임 · XR, 교육은 필요한 사람도 판단 기준도 다릅니다. 그래서 영역별로 다루는 범위와 진행 방식을 따로 정리했습니다." />
        </div>
      </section>

      {/* ━━ 영역 셋 - 사진과 글이 번갈아 선다 ━━ */}
      <section data-header="light" className="bg-white py-20 sm:py-28 xl:pb-[160px] xl:pt-[120px]">
        <div className={`${container} space-y-20 sm:space-y-28`}>
          {domains.map((d, i) => {
            const img = ROW_IMAGE[d.key];
            const title = heroSlides.find((s) => s.key === d.key)?.title ?? [d.lead, ''];
            const flip = i % 2 === 1;
            return (
              <div key={d.key} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
                <motion.div {...inView} variants={flip ? fadeRight : fadeLeft} className={flip ? 'lg:order-2' : ''}>
                  <Link href={`/${d.slug}`} className={`group relative block aspect-[742/500] overflow-hidden bg-gray-100 shadow-float ${radiusCard}`}>
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ objectPosition: img.position ?? 'center' }} />
                  </Link>
                </motion.div>
                <motion.div {...inView} variants={stagger}>
                  <motion.p variants={fadeUp} className="type-b4 text-point-200">{pad(i + 1)} · {d.en}</motion.p>
                  <motion.h2 variants={fadeUp} className="type-h1 mt-3 text-ink">
                    {title[0]}<br /><b>{title[1]}</b>
                  </motion.h2>
                  <motion.p variants={fadeUp} className="type-b3 mt-6 max-w-[34em] text-ink-2">{d.summary}</motion.p>
                  <motion.dl variants={fadeUp} className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
                    {d.stats.map((s) => (
                      <div key={s.label} className="flex flex-col-reverse">
                        <dt className="mt-2 text-[13px] text-gray-500">{s.label}</dt>
                        <dd className="text-[30px] font-bold leading-none text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </motion.dl>
                  <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Link href={`/${d.slug}`} className={`${btnPoint} ${btnSm}`}>
                      {d.kr} 자세히 보기
                      <FiArrowUpRight size={15} className={arrowHover} />
                    </Link>
                    <span className="flex flex-wrap gap-1.5">
                      {d.tags.map((t) => (
                        <span key={t} className="rounded-pill bg-gray-100 px-3 py-1.5 text-[13px] font-bold text-gray-500">{t}</span>
                      ))}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━ 자체 게임 - 외주와 나란한 독립 사업 ━━ */}
      <section id="originals" data-header="light" className="bg-white pb-24 sm:pb-32 xl:pb-[160px]">
        <div className={container}>
          <motion.div {...inView} variants={fadeUp}
            className={`night-grid relative grid gap-10 overflow-hidden px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-12 lg:items-end lg:gap-8 xl:px-16 xl:py-20 ${radiusCard}`}>
            <div className="lg:col-span-7">
              <p className="eyebrow on-night mb-3">Original Games</p>
              <h2 className="type-h1 text-white">자체 게임<br /><b>제작 · 퍼블리싱</b></h2>
              <p className="type-b3 mt-6 max-w-[32em] text-gray-200">
                MATE 이름으로 내는 게임입니다. 기획과 아트, 개발, 퍼블리싱까지 팀 안에서 끝냅니다.
                판권도 저희가 쥡니다. 지금 두 타이틀을 만들고 있습니다.
              </p>
            </div>
            <ul className="space-y-3 lg:col-span-5">
              {games.map((g) => (
                <li key={g.id}
                  className="flex items-center justify-between gap-4 rounded-card-sm border border-white/15 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
                  <span className="text-[18px] font-bold text-white">{g.title}</span>
                  <span className="rounded-pill bg-point-200 px-3 py-1 text-[13px] font-bold text-white">{g.status}</span>
                </li>
              ))}
              <li className="pt-1 text-[13px] text-gray-300">자체 IP · 공개할 수 있는 단계가 되면 여기에 올립니다</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ━━ 공통 진행 단계 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <SectionHead align="center" eyebrow="Process"
            title={<>영역이 달라도<br /><b>진행 방식은 같습니다</b></>}
            desc="무엇을 만들든 진행 방식은 같습니다. 단계마다 진행 상황을 공유합니다." />
          <motion.ol {...inView} variants={staggerTight}
            className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {processSteps.map((s) => (
              <motion.li key={s.id} variants={fadeUp}
                className={`flex min-h-[260px] flex-col border border-line bg-white p-6 ${radiusCard}`}>
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-pill border border-[#d1d7de] text-[17px] font-bold text-gray-500">
                  {pad(s.order)}
                </span>
                <h3 className="type-b1 mt-8 text-ink">{s.title}</h3>
                <p className="mt-1 text-[13px] font-bold text-point-200">{s.keywords}</p>
                <p className="type-b3 mt-3 text-ink-2">{s.description}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>
    </>
  );
}
