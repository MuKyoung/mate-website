'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { counts, teamCapabilities } from '@/data/teamCapabilities';
import { departments, totalHeadcount } from '@/data/organization';
import { ArrowSwap, Label } from '@/components/home/parts';
import { clipUp, fadeUp, stagger, inView } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 소개 - 하는 일을 늘어놓기 전에 어떤 팀인지부터 말한다.
 *
 * 문장은 사람이 말하듯 짧게 끊되, 적는 내용은 회사가 밝힌 사실과 데이터에서
 * 계산되는 값뿐이다. 인원과 건수는 숫자를 직접 적지 않고 데이터에서 가져온다.
 */

const { since } = teamCapabilities.stats;

/** 캐치프레이즈를 받치는 두 축. 문장은 진행 절차와 FAQ 에 회사가 밝혀 둔 내용이다. */
const proofs = [
  {
    name: '개발 전문성',
    body: `${since}년부터 웹 · 앱과 게임 · XR ${counts.devProjects}건을 납품하고, 강의 ${counts.lectures}건을 진행했습니다.`,
  },
  {
    name: '배포 안정성',
    body: '배포한 뒤에도 모니터링으로 안정성을 확인합니다. 끝난 뒤의 버그 수정과 업데이트도 이어서 맡습니다.',
  },
];

const roster = departments.map((d) => `${d.name} ${d.headcount}명`).join(', ');

export default function Story() {
  return (
    <section data-surface="paper" className="surface-paper relative">
      {/* 위 여백: 좁은 화면에서는 걸쳐 내려온 작업 띠만큼, 넓은 화면에서는 창이 걸친 만큼 더 띄운다 */}
      <div className={`${container} pb-24 pt-36 sm:pb-32 lg:pt-44`}>

        <motion.div {...inView} variants={fadeUp}>
          <Label className="text-[var(--point)]">소개</Label>
        </motion.div>

        <motion.h2 {...inView} variants={stagger}
          className="font-display display-l mt-7 text-[var(--text-1)] lg:max-w-[58%]">
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">맡아서 만들고,</motion.span>
          </span>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">저희 이름으로도 냅니다.</motion.span>
          </span>
        </motion.h2>

        {/* 본문은 제목보다 한 칸 안으로 들이고, 두 축은 오른쪽에서 한 단 내려 시작한다 */}
        <div className="mt-14 grid gap-x-gutter gap-y-16 lg:mt-20 lg:grid-cols-12">
          <motion.div {...inView} variants={stagger} className="lg:col-span-5 lg:col-start-2">
            <motion.p variants={fadeUp}
              className="text-[19px] font-semibold leading-[1.65] text-[var(--text-1)] sm:text-[21px]">
              MATE는 두 가지 일을 합니다. 맡겨 주신 것을 만드는 SI 개발, 그리고 저희 게임을 만들어 직접 내는 퍼블리싱입니다.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-7 text-[16px] leading-[1.95] text-[var(--text-2)]">
              {since}년에 시작해 웹 · 앱, 게임 · XR, 교육으로 영역을 넓혀 왔습니다.
              지금은 {totalHeadcount}명이 한 팀으로 움직입니다. {roster}.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-5 text-[16px] leading-[1.95] text-[var(--text-2)]">
              두 사업의 기준은 같습니다. 만든 것이 멈추지 않아야 한다는 것.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9">
              <Link href="/team" className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-1)]">
                <span className="link-draw">팀 소개 보기</span>
                <ArrowSwap size={15} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.dl {...inView} variants={stagger} className="lg:col-span-5 lg:col-start-8 lg:mt-28">
            {proofs.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className="border-t border-[var(--border-2)] py-7 last:border-b">
                <dt className="font-display display-s text-[var(--point)]">{p.name}</dt>
                <dd className="mt-3 text-[16px] leading-[1.85] text-[var(--text-2)]">{p.body}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
