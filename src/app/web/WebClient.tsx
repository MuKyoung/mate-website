'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import BrowserFrame from '@/components/visual/BrowserFrame';
import { projects } from '@/data/projects';
import { serviceTabs } from '@/data/navigation';
import { webScope, webStack, webDeliverables, domainByKey } from '@/data/domains';
import { fadeUp, rowIn, staggerTight, staggerRows, inView } from '@/lib/motion';
import { arrowCircle, container, numTile, radiusCard } from '@/lib/styles';

const d = domainByKey.web;
/* 화면을 공개할 수 있는 웹 사례 - 고객사 허락을 받았다 (2026-10-16). 첫 칸 브라우저 틀에 크게 싣는다 */
const showcase = projects.find((p) => p.id === '13');
/* 아래 목록에는 첫 칸에서 본 사례를 다시 넣지 않는다 - 한 화면에 같은 그림을 두 번 두지 않는다 */
const work = projects.filter((p) => (p.category === 'Web Application' || p.category === 'Website') && p.id !== showcase?.id);

const pad = (n: number) => String(n).padStart(2, '0');

export default function WebClient() {
  return (
    <div data-domain="web">
      {/* 머리에 크레인 사진을 깔지 않는다 - 바로 아래 세종 화면 캡처에 같은 사진이 크게 들어 있다 */}
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/web" />

      <DomainIntro
        eyebrow="Web & App"
        title={<>기획서 한 장에서<br /><b>배포된 서비스까지</b></>}
        desc={d.summary}
        stats={d.stats}
        tags={d.tags}
        media={showcase && (
          <Link href={`/projects/${showcase.id}`} className="group block">
            <BrowserFrame src={showcase.thumbnail} alt={`${showcase.title} 화면`}
              url={(showcase.liveUrl ?? '').replace(/^https?:\/\//, '')} />
            <p className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[16px] font-bold text-ink transition-colors group-hover:text-point-200 sm:text-[18px]">{showcase.title}</span>
              <span className={arrowCircle}><FiArrowUpRight size={16} /></span>
            </p>
          </Link>
        )}
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
