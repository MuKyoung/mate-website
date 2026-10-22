'use client';

import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import DomainStrips from '@/components/domain/DomainStrips';
import ProcessOrbit from '@/components/services/ProcessOrbit';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { games } from '@/data/games';
import { serviceTabs } from '@/data/navigation';
import { fadeUp, inView } from '@/lib/motion';
import { chip, container, radiusCard } from '@/lib/styles';

export default function ServicesPageClient() {
  return (
    <>
      <PageHeader crumb="Services" title="사업영역" tabs={serviceTabs} active="/services"
        desc="웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다." />

      {/* ━━ 영역 넷 - 세로 판 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Overview:" title={<>세 영역을<br /><b>따로 맡습니다</b></>}
            desc="웹 · 앱, 게임 · XR, 교육은 필요한 사람도 판단 기준도 다릅니다. 그래서 영역별로 다루는 범위와 진행 방식을 따로 정리했습니다." />
          <div className="mt-12 sm:mt-16">
            <DomainStrips />
          </div>
        </div>
      </section>

      {/* ━━ 자체 게임 - 외주와 나란한 독립 사업 ━━ */}
      <section id="originals" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <motion.div {...inView} variants={fadeUp}
            className={`on-night relative grid overflow-hidden bg-night lg:grid-cols-12 ${radiusCard}`}>
            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:col-span-7 xl:px-16 xl:py-20">
              <p className="eyebrow mb-5">Original Games:</p>
              <h2 className="type-h1 text-white">자체 게임<br /><b>제작 · 퍼블리싱</b></h2>
              <p className="type-b3 mt-6 max-w-[32em] text-gray-300">
                MATE 이름으로 내는 게임입니다. 기획과 아트, 개발, 퍼블리싱까지 팀 안에서 끝냅니다.
                판권도 저희가 쥡니다. 지금 두 타이틀을 만들고 있습니다.
              </p>
              <ul className="mt-10 border-t border-white/15">
                {games.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-4 border-b border-white/15 py-4">
                    <span className="text-[19px] font-medium tracking-[-0.01em] text-white">{g.title}</span>
                    <span className={chip}>{g.status}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[12px] text-white/50">자체 IP · 공개할 수 있는 단계가 되면 여기에 올립니다</p>
            </div>
            {/* 아직 공개할 화면이 없어 사진 대신 블록 모자이크를 둔다 */}
            <div aria-hidden className="relative min-h-[220px] lg:col-span-5">
              <BlockMosaic seed={11} rows={10} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-night to-transparent lg:w-1/2" />
            </div>
          </motion.div>
        </div>
      </section>

      <ProcessOrbit />
    </>
  );
}
