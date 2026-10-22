'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FiArrowUpRight, FiLayers, FiBox, FiSmartphone, FiZap, FiRepeat, FiMonitor } from 'react-icons/fi';
import { TbAugmentedReality, TbCardboards } from 'react-icons/tb';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import ProductGrid from '@/components/domain/ProductGrid';
import CaseRail from '@/components/domain/CaseRail';
import { projects } from '@/data/projects';
import { serviceTabs } from '@/data/navigation';
import {
  gameCapabilities, gamePlatforms, gamePipeline, gameCredentials, domainByKey,
} from '@/data/domains';
import { fadeUp, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, container, radiusCard } from '@/lib/styles';

const d = domainByKey.game;
const work = projects.filter((p) => p.category === 'Game Application' || p.category === 'VR Application');
const intro = projects.find((p) => p.id === '3');

/* 제작 유형마다 아이콘 - 순서는 gameCapabilities 와 같다 */
const capIcon: Record<string, IconType> = {
  '2d': FiLayers, '3d': FiBox, vr: TbCardboards, ar: TbAugmentedReality, proto: FiZap, port: FiRepeat,
};
const platformIcon: IconType[] = [FiMonitor, FiSmartphone, TbCardboards];

export default function GameClient() {
  return (
    <div data-domain="game">
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/game"
        image={{ src: '/images/projects/VR 키오스크 시뮬레이션.webp', position: 'center 40%' }} />

      <DomainIntro
        eyebrow="게임 · XR"
        title={<>Unity로 만드는<br /><b>게임과 몰입형 콘텐츠</b></>}
        desc={d.summary}
        media={intro?.thumbnail && (
          <Link href={`/projects/${intro.id}`} className="group absolute inset-0 block">
            <Image src={intro.thumbnail} alt={`${intro.title} 타이틀 화면`} fill sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-4 py-2 text-[13px] font-bold text-ink shadow-float">
              {intro.title}
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

      <ProductGrid
        title={<><b>게임 · XR</b> 만드는 것들</>}
        items={gameCapabilities.map((c) => ({ title: c.kr, en: c.en, desc: c.desc, icon: capIcon[c.id] ?? FiLayers }))}
      />

      {/* ━━ 만드는 순서 + 빌드가 올라가는 곳 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <motion.div {...inView} variants={fadeUp} className="max-w-2xl">
            <p className="eyebrow mb-3">Pipeline</p>
            <h2 className="type-h1 text-ink"><b>만드는 순서</b></h2>
            <p className="type-b3 mt-5 text-ink-2">
              게임은 문서로 재미를 증명할 수 없습니다. 그래서 두 번째 단계에서 이미
              플레이 가능한 빌드를 만들고, 거기서부터 판단합니다.
            </p>
          </motion.div>

          <motion.ol {...inView} variants={staggerTight} className="relative mt-12 grid gap-4 sm:mt-16 lg:grid-cols-5 lg:gap-5">
            {/* 첫 번호 원에서 마지막 번호 원까지만 잇는다 (칸 다섯, 사이 20px) */}
            <span aria-hidden className="absolute left-[27px] top-[27px] hidden h-0.5 bg-[#d1d7de] lg:block"
              style={{ right: 'calc((100% - 80px) / 5 - 27px)' }} />
            {gamePipeline.map((s, i) => (
              <motion.li key={s.no} variants={fadeUp} className="relative flex gap-5 lg:block">
                <span className={`relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-pill border text-[17px] font-bold ${
                  i === 1 ? 'border-point-200 bg-point-200 text-white' : 'border-[#d1d7de] bg-white text-gray-500'
                }`}>
                  {s.no}
                </span>
                <div className="lg:mt-6">
                  <h3 className="type-b1 text-ink">{s.title}</h3>
                  <p className="type-b3 mt-2 text-ink-2">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>

          <motion.div {...inView} variants={fadeUp} className="mt-20 sm:mt-24">
            <h3 className="type-h2 font-normal text-ink"><b>빌드가 올라가는 곳</b></h3>
          </motion.div>
          <motion.ul {...inView} variants={staggerTight} className="mt-8 grid gap-3 sm:grid-cols-3 lg:gap-4">
            {gamePlatforms.map((p, i) => {
              const Icon = platformIcon[i % platformIcon.length];
              return (
                <motion.li key={p.name} variants={fadeUp}
                  className={`flex items-center gap-5 border border-line bg-white p-6 sm:p-7 ${radiusCard}`}>
                  <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-point-100 text-point-200">
                    <Icon size={24} />
                  </span>
                  <div>
                    <p className="text-[24px] font-bold leading-none text-ink">{p.name}</p>
                    <p className="mt-2 text-[14px] text-gray-500">{p.detail}</p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </section>

      {work.length > 0 && (
        <CaseRail
          title={<><b>게임 · XR</b> 영역에서<br /><b>MATE가 만든 작업</b>입니다</>}
          items={work}
          more={{ href: '/projects', label: '전체 포트폴리오 보기' }}
        />
      )}

      {/* ━━ 밖에서 받은 평가 ━━ */}
      {gameCredentials.length > 0 && (
        <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-[160px]">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
              <p className="eyebrow mb-3">Credentials</p>
              <h2 className="type-h1 text-ink">밖에서 받은<br /><b>평가</b></h2>
            </motion.div>
            <motion.ul {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-8">
              {gameCredentials.map((a) => (
                <motion.li key={a.id} variants={rowIn}
                  className="grid grid-cols-[64px_1fr] gap-x-4 gap-y-1 border-b border-line py-5 sm:grid-cols-[80px_1fr_auto] sm:items-baseline">
                  <span className="text-[15px] font-bold tabular-nums text-gray-500">{a.year}</span>
                  <span>
                    <span className="block text-[16px] font-bold text-ink sm:text-[17px]">{a.title}</span>
                    <span className="mt-1 block text-[14px] text-gray-500">{a.organization}</span>
                  </span>
                  <span className="col-start-2 text-[14px] font-bold text-point-200 sm:col-start-auto sm:text-right">{a.rank}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>
      )}
    </div>
  );
}
