'use client';

import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import DomainStrips from '@/components/domain/DomainStrips';
import ProcessOrbit from '@/components/services/ProcessOrbit';
import { games } from '@/data/games';
import { serviceTabs } from '@/data/navigation';
import { fadeUp, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

export default function ServicesPageClient() {
  return (
    <>
      <PageHeader eyebrow="Services" title="사업영역" tabs={serviceTabs} active="/services"
        desc="웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다." />

      {/* ━━ 영역 넷 - 세로 판 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Overview" title={<>세 영역을<br /><b>따로 맡습니다</b></>}
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

      <ProcessOrbit />
    </>
  );
}
