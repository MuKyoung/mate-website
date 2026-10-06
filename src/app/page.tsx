'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import CtaSection from '@/components/ui/CtaSection';
import { domains, homeCredentials } from '@/data/domains';
import { affiliations } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import {
  fadeUp, fadeLeft, fadeRight, riseTilt, clipUp, clipLeft, rowIn, stagger, staggerRows, inView,
} from '@/lib/motion';
import { arrowHover, container, sectionPad } from '@/lib/styles';


/* 가치 나열 대신, 계약서에 적을 수 있는 규칙만 남긴다 */
const values = [
  {
    kr: '저장소를 열어 둡니다',
    desc: '개발 중에도 GitHub 접근 권한을 드립니다. 진행률을 물어보실 필요가 없습니다.',
  },
  {
    kr: '담당자가 바뀌지 않습니다',
    desc: '계약 때 만난 사람이 배포까지 갑니다. 인력이 빠지면 일정이 밀리는 것부터 알려드립니다.',
  },
  {
    kr: '끝나면 전부 넘겨드립니다',
    desc: '소스 코드와 문서, 인프라 계정 소유권까지. 저희 없이도 굴러가야 정상입니다.',
  },
];

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <Hero />

      {/* ━━ (01) Domains — 세 영역으로 갈라지는 진입점 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="01" label="Domains" href="/services" more="서비스 전체"
            title={<>어느 쪽이 필요하신가요</>} kr="영역마다 다루는 범위도 진행 방식도 다릅니다" />

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 border-t border-white/10">
            {domains.map((d, i) => (
              <motion.div key={d.key} data-domain={d.key}
                variants={[fadeUp, riseTilt, fadeRight][i % 3]}
                className={[
                  'group relative border-b border-white/10',
                  i > 0 ? 'lg:border-l lg:border-white/10' : '',
                ].join(' ')}>
                <Link href={`/${d.slug}`} className="block h-full p-8 sm:p-10 lg:p-11 lg:pt-14">
                  {/* 호버 시 도메인 액센트가 위에서 그어진다 */}
                  <span className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 origin-left
                                   group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ background: 'var(--accent)' }} />

                  <h3 className="font-en font-extrabold text-[var(--text-1)] tracking-[-0.035em] leading-[1.0] mb-3
                                 transition-colors duration-300 group-hover:text-[var(--accent)]"
                    style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.375rem)' }}>
                    {d.en}
                  </h3>
                  <p className="type-b3 text-white/45 mb-7">{d.kr}</p>

                  <p className="type-h3 text-[var(--text-1)] leading-[1.45] mb-9">{d.trigger}</p>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {d.tags.map((t) => (
                      <span key={t} className="type-c2 px-3 py-1.5 rounded-[6px] bg-white/[0.05] text-white/55 font-en">
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 type-b4 text-white/70 group-hover:text-[var(--accent)] transition-colors">
                    자세히 보기
                    <FiArrowUpRight size={15} className={arrowHover} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (02) Work — 비대칭 2열 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="02" label="Selected Work" href="/projects" more="전체 포트폴리오"
            title={<>최근 작업</>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
            {featured.map((p, i) => (
              <div key={p.id} className={i % 2 === 1 ? 'md:mt-28' : ''}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (03) 매니페스토 ━━ */}
      <section className="pt-16 sm:pt-28 pb-10 sm:pb-14">
        <div className={container}>
          <motion.p {...inView} variants={fadeUp}
            className="index-num font-en pb-6 border-b border-white/10 mb-14 sm:mb-20">Why MATE</motion.p>

          {/* 라인마다 다른 방향으로 열리는 스테이트먼트 */}
          <motion.p {...inView} variants={stagger}
            className="font-extrabold text-[var(--text-1)] tracking-[-0.035em] leading-[1.22] max-w-5xl"
            style={{ fontSize: 'clamp(1.625rem, 3.6vw, 3rem)' }}>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipUp} className="block">넘기고 나면 연락이 끊기는 외주를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipLeft} className="block">
저희도 <span className="text-[var(--point)]">발주처로서 겪었습니다</span>.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={fadeRight} className="block text-white/30">
                그래서 배포 다음 달에 뭘 할지까지 계약서에 적습니다.
              </motion.span>
            </span>
          </motion.p>

        </div>
      </section>

      {/* ━━ (04) Rules — EN 키워드 + KR 부연 (레퍼런스 Vision 방식) ━━ */}
      <section className="pt-20 sm:pt-28 pb-24 sm:pb-32">
        <div className={container}>
          <SectionHead num="04" title={<>계약서에 적는 것</>} />
          <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
            {values.map((v) => (
              <motion.div key={v.kr} variants={rowIn}
                className="grid grid-cols-1 items-baseline gap-x-gutter gap-y-3 border-b border-white/10
                           py-8 sm:py-10 lg:grid-cols-12">
                <h3 className="type-h2 text-[var(--text-1)] lg:col-span-4">{v.kr}</h3>
                <p className="type-b3 leading-[1.85] text-white/50 lg:col-span-7 lg:col-start-6">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (05) 밖에서 받은 평가 — 익명 후기 하나 + 확인 가능한 심사 이력 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="05" title={<>밖에서 받은 평가</>} />

          <motion.div {...inView} variants={staggerRows}
            className="mb-16 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
            {affiliations.map((a) => (
              <motion.div key={a.id} variants={rowIn} className="bg-[var(--canvas)] p-7 sm:p-9">
                <p className="type-c1 text-[var(--point)] mb-3">{a.role}</p>
                <h3 className="type-h2 text-[var(--text-1)] mb-3">{a.name}</h3>
                <p className="type-b3 text-white/50 leading-[1.8]">{a.note}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
            {homeCredentials.map((a) => (
              <motion.div key={a.id} variants={rowIn}
                className="grid grid-cols-12 gap-x-gutter gap-y-1 py-6 sm:py-7 border-b border-white/10 items-baseline">
                <p className="col-span-3 sm:col-span-2 font-en type-b2 text-white/35 font-mono-stat">{a.year}</p>
                <h3 className="col-span-9 sm:col-span-5 type-b1 text-[var(--text-1)]">{a.title}</h3>
                <p className="col-span-7 sm:col-span-3 type-b3 text-white/45">{a.organization}</p>
                <p className="col-span-5 sm:col-span-2 type-b4 text-[var(--point)] sm:text-right">{a.rank}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p {...inView} variants={fadeUp} className="mt-8 type-c1 text-white/30">
            전시 참가 이력을 포함한 전체 목록은 팀 페이지에 있습니다.
          </motion.p>
        </div>
      </section>

      {/* ━━ (06) CTA ━━ */}
      <CtaSection num="06" line1="아직 정리가" line2="안 되셨어도"
        kr="첫 통화에서 만들려는 것과 예산 범위부터 듣습니다" />
    </>
  );
}
