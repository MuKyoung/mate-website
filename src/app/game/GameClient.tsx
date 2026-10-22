'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FiLayers, FiBox, FiZap, FiRepeat, FiMonitor, FiSmartphone } from 'react-icons/fi';
import { TbAugmentedReality, TbCardboards } from 'react-icons/tb';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import ProductGrid from '@/components/domain/ProductGrid';
import CaseRail from '@/components/domain/CaseRail';
import SectionHead from '@/components/ui/SectionHead';
import { projects } from '@/data/projects';
import { serviceTabs } from '@/data/navigation';
import {
  gameCapabilities, gamePlatforms, gamePipeline, gameCredentials, domainByKey,
} from '@/data/domains';
import { fadeUp, rowIn, staggerTight, staggerRows, inView } from '@/lib/motion';
import { chipLine, container, radiusCard } from '@/lib/styles';

const d = domainByKey.game;
const work = projects.filter((p) => p.category === 'Game Application' || p.category === 'VR Application');

/* 제작 유형마다 아이콘 - 순서는 gameCapabilities 와 같다 */
const capIcon: Record<string, IconType> = {
  '2d': FiLayers, '3d': FiBox, vr: TbCardboards, ar: TbAugmentedReality, proto: FiZap, port: FiRepeat,
};
const platformIcon: IconType[] = [FiMonitor, FiSmartphone, TbCardboards];

/** 첫 칸 그림 자리 - 빌드가 올라가는 곳 셋을 남색 판에 */
function PlatformPanel() {
  return (
    <div className={`night-grid on-night relative flex min-h-[340px] flex-col justify-between overflow-hidden p-6 sm:min-h-[420px] sm:p-9 ${radiusCard}`}>
      <p className="eyebrow">Platforms</p>
      <ul className="mt-10 border-t border-white/15">
        {gamePlatforms.map((p, i) => {
          const Icon = platformIcon[i % platformIcon.length];
          return (
            <li key={p.name} className="flex items-center justify-between gap-6 border-b border-white/15 py-5">
              <span className="flex items-center gap-4">
                <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[rgba(38,68,203,0.35)] text-point-light">
                  <Icon size={20} />
                </span>
                <span className="text-[24px] font-bold text-white sm:text-[28px]">{p.name}</span>
              </span>
              <span className="text-right text-[14px] text-gray-300">{p.detail}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-[14px] font-bold text-gray-300">빌드가 올라가는 곳</p>
    </div>
  );
}

export default function GameClient() {
  return (
    <div data-domain="game">
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/game" />

      <DomainIntro
        eyebrow="Game & XR"
        title={<>Unity로 만드는<br /><b>게임과 몰입형 콘텐츠</b></>}
        desc={d.summary}
        stats={d.stats}
        tags={d.tags}
        media={<PlatformPanel />}
      />

      <ProductGrid
        eyebrow="What We Make"
        title={<>게임 · XR에서<br /><b>만드는 것들</b></>}
        items={gameCapabilities.map((c) => ({ title: c.kr, en: c.en, desc: c.desc, tags: c.tags, icon: capIcon[c.id] ?? FiLayers }))}
      />

      {/* ━━ 만드는 순서 - 두 번째 칸에서 이미 플레이 가능한 빌드 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Pipeline" title={<><b>만드는 순서</b></>}
            desc="게임은 문서로 재미를 증명할 수 없습니다. 그래서 두 번째 단계에서 이미 플레이 가능한 빌드를 만들고, 거기서부터 판단합니다." />

          <motion.ol {...inView} variants={staggerTight} className="relative mt-14 grid gap-8 sm:mt-16 lg:grid-cols-5 lg:gap-5">
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
                  {i === 1 && <span className={`${chipLine} mt-3`}>플레이 가능한 빌드</span>}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {work.length > 0 && (
        <CaseRail tone="gray" eyebrow="Work"
          title={<>게임 · XR 영역에서<br /><b>만든 작업</b></>}
          items={work}
          more={{ href: '/projects', label: '전체 포트폴리오' }} />
      )}

      {/* ━━ 밖에서 받은 평가 ━━ */}
      {gameCredentials.length > 0 && (
        <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
            <div className="lg:col-span-4">
              <SectionHead eyebrow="Credentials" title={<>밖에서 받은<br /><b>평가</b></>} />
            </div>
            <motion.ul {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
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
