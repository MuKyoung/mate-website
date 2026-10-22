'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import CaseRail from '@/components/domain/CaseRail';
import { projects } from '@/data/projects';
import { serviceTabs } from '@/data/navigation';
import { webScope, webStack, webDeliverables, domainByKey } from '@/data/domains';
import { fadeUp, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, container, radiusCard } from '@/lib/styles';

const d = domainByKey.web;
const work = projects.filter((p) => p.category === 'Web Application' || p.category === 'Website');
/* 화면을 공개할 수 있는 웹 사례 - 고객사 허락을 받았다 (2026-10-16) */
const showcase = projects.find((p) => p.id === '13');

const pad = (n: number) => String(n).padStart(2, '0');

export default function WebClient() {
  return (
    <div data-domain="web">
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/web"
        image={{ src: '/images/projects/세종호이스트크레인-메인.webp', position: 'center 62%' }} />

      <DomainIntro
        eyebrow="웹 · 앱"
        title={<>기획서 한 장에서<br /><b>배포된 서비스까지</b></>}
        desc={d.summary}
        media={showcase?.thumbnail && (
          <Link href={`/projects/${showcase.id}`} className="group absolute inset-0 block">
            <Image src={showcase.thumbnail} alt={`${showcase.title} 화면`} fill sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-4 py-2 text-[13px] font-bold text-ink shadow-float">
              {showcase.title}
              <FiArrowUpRight size={14} className={arrowHover} />
            </span>
          </Link>
        )}>
        <div className="flex flex-wrap gap-1.5">
          {d.tags.map((t) => (
            <span key={t} className="rounded-pill border border-line bg-white px-3 py-1.5 text-[13px] font-bold text-gray-500">{t}</span>
          ))}
        </div>
      </DomainIntro>

      {/* ━━ 작업 범위 - 단계 셋을 세 칸으로 (Figma 기술인증 목록 칸) ━━ */}
      <section data-header="light" className="bg-white pb-24 pt-4 sm:pb-32 xl:pb-[160px]">
        <div className={container}>
          <motion.h2 {...inView} variants={fadeUp} className="type-h2 font-normal text-ink">
            <b>웹 · 앱</b> 작업 범위
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="type-b3 mt-4 max-w-2xl text-ink-2">
            맡기는 범위는 프로젝트마다 다릅니다. 설계만, 구현만, 혹은 전부. 어느 지점에서 들어와도 이어받을 수 있도록 단계를 나눠 두었습니다.
          </motion.p>
          <motion.div {...inView} variants={staggerTight} className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-3 lg:gap-8">
            {webScope.map((s) => (
              <motion.div key={s.id} variants={fadeUp}>
                <p className="text-[14px] font-bold text-point-200">{s.step} · {s.en}</p>
                <h3 className="type-h2 mt-2 text-ink">{s.kr}</h3>
                <p className="type-b3 mt-4 text-ink-2">{s.desc}</p>
                <ul className="mt-6 border-t-2 border-ink">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 border-b border-line py-3.5 text-[15px] text-ink-2">
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-pill bg-point-200" />
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ 넘겨드리는 것 - 회색 면 위 네 칸 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
            <p className="eyebrow mb-3">Deliverables</p>
            <h2 className="type-h1 text-ink">끝나면<br /><b>넘겨드리는 네 가지</b></h2>
            <p className="type-b3 mt-5 max-w-sm text-ink-2">프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다.</p>
          </motion.div>
          <motion.ul {...inView} variants={staggerTight} className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:gap-4">
            {webDeliverables.map((it, i) => (
              <motion.li key={it.title} variants={fadeUp}
                className={`flex min-h-[200px] flex-col border border-line bg-white p-6 sm:p-8 ${radiusCard}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-point-200 text-[14px] font-bold text-white">{pad(i + 1)}</span>
                <h3 className="type-b1 mt-8 text-ink">{it.title}</h3>
                <p className="type-b3 mt-2 text-ink-2">{it.desc}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 다루는 기술 - 층마다 한 줄 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-[160px]">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
            <p className="eyebrow mb-3">Stack</p>
            <h2 className="type-h1 text-ink"><b>다루는 기술</b></h2>
            <p className="type-b3 mt-5 max-w-sm text-ink-2">프로젝트 요구사항에 맞는 기술을 고릅니다.</p>
          </motion.div>
          <motion.dl {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-8">
            {webStack.map((row) => (
              <motion.div key={row.layer} variants={rowIn}
                className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr] sm:items-center">
                <dt className="type-b1 text-ink">{row.layer}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {row.items.map((it) => (
                    <span key={it} className="rounded-pill bg-gray-100 px-3.5 py-1.5 text-[14px] text-ink-2">{it}</span>
                  ))}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>

      {work.length > 0 && (
        <CaseRail
          title={<><b>웹 · 앱</b> 영역에서<br /><b>MATE가 만든 작업</b>입니다</>}
          items={work}
          more={{ href: '/projects', label: '전체 포트폴리오 보기' }}
        />
      )}
    </div>
  );
}
