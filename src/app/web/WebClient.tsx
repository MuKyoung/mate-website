'use client';

import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import { projects } from '@/data/projects';
import { ongoing } from '@/data/ongoing';
import { serviceTabs } from '@/data/navigation';
import { webScope, webStack, webDeliverables, domainByKey } from '@/data/domains';
import { fadeUp, rowIn, staggerTight, staggerRows, inView } from '@/lib/motion';
import { container, numTile, radiusCard } from '@/lib/styles';

const d = domainByKey.web;
const work = projects.filter((p) => p.category === 'Web Application' || p.category === 'Website');

const pad = (n: number) => String(n).padStart(2, '0');

/* 첫 칸 그림 자리 - 공개할 수 있는 웹 화면이 없어(2026-11-03 세종호이스트크레인을 포트폴리오에서 뺌)
   지금 만들고 있는 웹 작업(ongoing.ts)을 적는다. 게임 페이지의 플랫폼 판과 같은 모양 */
function NowPanel() {
  return (
    <div className={`night-grid on-night relative flex min-h-[340px] flex-col justify-between overflow-hidden p-6 sm:min-h-[420px] sm:p-9 ${radiusCard}`}>
      <p className="eyebrow">Now</p>
      <ul className="mt-10 border-t border-white/15">
        {ongoing.web.map((w) => (
          <li key={w.title} className="flex items-center justify-between gap-6 border-b border-white/15 py-5">
            <span className="text-[18px] font-bold text-white sm:text-[22px]">{w.title}</span>
            <span className="flex-none text-right text-[14px] text-gray-300">{w.status}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[14px] font-bold text-gray-300">지금 만들고 있는 것</p>
    </div>
  );
}

export default function WebClient() {
  return (
    <div data-domain="web">
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/web" />

      <DomainIntro
        eyebrow="Web & App"
        title={<>기획서 한 장에서<br /><b>배포된 서비스까지</b></>}
        desc={d.summary}
        stats={d.stats}
        tags={d.tags}
        media={<NowPanel />}
      />

      {/* ━━ 작업 범위 - 세 단계를 세 칸으로 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Scope" title={<>어디서부터<br /><b>어디까지</b></>}
            desc="맡기는 범위는 프로젝트마다 다릅니다. 설계만, 구현만, 혹은 전부. 어느 지점에서 들어와도 이어받을 수 있도록 단계를 나눠 두었습니다." />
          <motion.div {...inView} variants={staggerTight} className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:gap-5">
            {webScope.map((s) => (
              <motion.div key={s.id} variants={fadeUp} className={`flex flex-col border border-line bg-white p-6 sm:p-8 ${radiusCard}`}>
                <p className="text-[14px] font-bold text-point-200">{s.step} · {s.en}</p>
                <h3 className="type-h3 mt-3 text-ink">{s.kr}</h3>
                <p className="type-b3 mt-4 text-ink-2">{s.desc}</p>
                <ul className="mt-auto border-t border-line pt-5">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 py-1.5 text-[15px] text-ink-2">
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

      {/* ━━ 넘겨드리는 것 - 번호 줄 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHead eyebrow="Deliverables" title={<>끝나면<br /><b>넘겨드리는 네 가지</b></>}
              desc="프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다." />
          </div>
          <motion.ol {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
            {webDeliverables.map((it, i) => (
              <motion.li key={it.title} variants={rowIn}
                className="grid gap-x-6 gap-y-2 border-b border-line py-6 sm:grid-cols-[auto_200px_1fr] sm:items-baseline">
                <span className={numTile}>{pad(i + 1)}</span>
                <h3 className="type-b1 text-ink">{it.title}</h3>
                <p className="type-b3 text-ink-2">{it.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ━━ 다루는 기술 - 층마다 한 줄 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHead eyebrow="Stack" title={<><b>다루는 기술</b></>} desc="프로젝트 요구사항에 맞는 기술을 고릅니다." />
          </div>
          <motion.dl {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
            {webStack.map((row) => (
              <motion.div key={row.layer} variants={rowIn}
                className="grid gap-3 border-b border-gray-200 py-6 sm:grid-cols-[180px_1fr] sm:items-center">
                <dt className="type-b1 text-ink">{row.layer}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {row.items.map((it) => (
                    <span key={it} className="rounded-pill bg-white px-3.5 py-1.5 text-[14px] text-ink-2">{it}</span>
                  ))}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ━━ 웹 사례 ━━ */}
      {work.length > 0 && (
        <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
          <div className={container}>
            <SectionHead eyebrow="More Work" title={<>웹 · 앱 영역에서<br /><b>만든 작업</b></>}
              desc="납품이 끝난 건만 올립니다. 공개되지 않은 화면은 싣지 않고, 무엇을 만들었는지만 적습니다."
              more={{ href: '/projects', label: '전체 포트폴리오' }} />
            <motion.div {...inView} variants={staggerTight} className="mt-12 grid gap-x-5 gap-y-14 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
              {work.map((p) => <ProjectCard key={p.id} project={p} />)}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
