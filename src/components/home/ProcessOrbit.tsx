'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FiMessageSquare, FiFileText, FiCode, FiCheckSquare, FiUploadCloud } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { processSteps } from '@/data/process';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container } from '@/lib/styles';

const ICONS: IconType[] = [FiMessageSquare, FiFileText, FiCode, FiCheckSquare, FiUploadCloud];

/* 원 위의 자리 (0° = 오른쪽, 시계 방향) 와 이름이 붙는 쪽. Figma 1-3. process 배치를 그대로 옮겼다 */
const SPOTS: { deg: number; side: 'left' | 'right' }[] = [
  { deg: 186, side: 'left' },
  { deg: 264, side: 'left' },
  { deg: 320, side: 'right' },
  { deg: 42, side: 'right' },
  { deg: 119, side: 'left' },
];

/* 원의 비율 - 바깥 708 / 안쪽 540 / 가운데 판 420 (Figma px) */
const RING = 540 / 708;
const CORE = 420 / 708;

const pad = (n: number) => String(n).padStart(2, '0');

/** 바탕에 비스듬히 지나가는 궤도선과 점 몇 개 */
function OrbitLines() {
  return (
    <svg aria-hidden className="orbit-lines" viewBox="0 0 1920 1150" preserveAspectRatio="xMidYMid slice" fill="none">
      <ellipse cx="960" cy="700" rx="980" ry="250" transform="rotate(-10 960 700)" stroke="currentColor" />
      <ellipse cx="960" cy="700" rx="820" ry="430" transform="rotate(16 960 700)" stroke="currentColor" />
      <ellipse cx="960" cy="700" rx="1150" ry="560" transform="rotate(-3 960 700)" stroke="currentColor" strokeDasharray="2 10" />
      {[[312, 402], [1588, 318], [1702, 860], [214, 930], [1366, 1040], [536, 156], [1820, 560]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#d7dce4" />
      ))}
    </svg>
  );
}

/**
 * 진행 단계 - 원 위에 다섯 단계, 가운데 판에 고른 단계의 설명 (Figma 1-3. process).
 * 화면에 들어오면 한 단계씩 저절로 넘어가고, 단계를 누르거나 올리면 멈춘다.
 * 넓은 화면에서만 원으로 놓고, 그보다 좁으면 세로 목록으로 편다.
 */
export default function ProcessOrbit() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { margin: '-20% 0px' });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!seen || hold || reduce) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % processSteps.length), 3200);
    return () => window.clearInterval(t);
  }, [seen, hold, reduce]);

  const step = processSteps[active];
  const ActiveIcon = ICONS[active];

  return (
    <section id="process" data-header="light" className="relative overflow-hidden bg-white py-24 sm:py-32 xl:py-[154px]">
      <OrbitLines />
      <div className={`${container} relative`}>
        <SectionHead align="center" eyebrow="Process"
          title={<>상담부터 배포까지,<br /><b>한 팀이 끝까지</b> 맡습니다</>} />

        {/* ── 원 (xl 이상) ── */}
        <div ref={ref} className="relative mx-auto mt-10 hidden aspect-square w-[min(708px,55vw)] xl:block"
          onMouseLeave={() => setHold(false)}>
          <div aria-hidden className="absolute inset-0 rounded-pill border-2 border-gray-100" />
          <div aria-hidden className="absolute rounded-pill border-2 border-[#d1d7de]"
            style={{ inset: `${((1 - RING) / 2) * 100}%` }} />

          {/* 가운데 판 */}
          <div className="absolute flex items-center justify-center rounded-pill border border-[#ebeef1] bg-gray-100 px-[7%] text-center"
            style={{ inset: `${((1 - CORE) / 2) * 100}%` }}>
            <AnimatePresence mode="wait">
              <motion.div key={active} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <span className="rounded-pill border-2 border-point-200 px-6 py-1 text-[16px] font-bold leading-[1.6] text-point-200 xl:text-[18px]">
                  Step {pad(active + 1)}
                </span>
                <span aria-hidden
                  className="mt-6 flex h-[104px] w-[104px] items-center justify-center rounded-[28px] bg-[linear-gradient(145deg,#ffffff_0%,#e2e7fc_100%)] text-point-200 shadow-[0_14px_32px_rgba(38,68,203,0.18),inset_0_1px_0_#ffffff]">
                  <ActiveIcon size={42} strokeWidth={1.6} />
                </span>
                <p className="type-b1 mt-6 text-ink">{step.title}</p>
                <p className="type-b3 mt-2 max-w-[17em] text-ink-2">{step.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 다섯 단계 */}
          {processSteps.map((s, i) => {
            const { deg, side } = SPOTS[i];
            const rad = (deg * Math.PI) / 180;
            const on = i === active;
            const Icon = ICONS[i];
            return (
              <div key={s.id} className="absolute h-0 w-0"
                style={{ left: `${50 + (RING / 2) * 100 * Math.cos(rad)}%`, top: `${50 + (RING / 2) * 100 * Math.sin(rad)}%` }}>
                <button type="button" aria-pressed={on} aria-label={`${pad(i + 1)} ${s.title}`}
                  onClick={() => { setActive(i); setHold(true); }}
                  onMouseEnter={() => { setActive(i); setHold(true); }}
                  className={`absolute left-0 top-0 flex h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border text-[18px] font-bold transition-colors duration-300 ${
                    on ? 'border-point-200 bg-point-200 text-white' : 'border-[#d1d7de] bg-white text-gray-400 hover:text-ink'
                  }`}>
                  {pad(i + 1)}
                </button>
                <div className={`pointer-events-none absolute top-0 flex w-[200px] -translate-y-1/2 flex-col gap-[7px] ${
                  side === 'left' ? 'right-[53px] items-end text-right' : 'left-[53px] items-start text-left'
                }`}>
                  <span aria-hidden className={`flex h-12 w-12 items-center justify-center rounded-[14px] transition-colors duration-300 ${
                    on ? 'bg-point-200 text-white' : 'bg-point-100 text-point-200'
                  }`}>
                    <Icon size={22} />
                  </span>
                  <span className="type-b1 text-ink-2">{s.title}</span>
                  <span className="type-b3 text-ink-2">{s.keywords}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 세로 목록 (xl 미만) ── */}
        <motion.ol {...inView} variants={staggerTight} className="relative mx-auto mt-12 max-w-[560px] xl:hidden">
          <span aria-hidden className="absolute bottom-7 left-[27px] top-7 w-px bg-[#d1d7de]" />
          {processSteps.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <motion.li key={s.id} variants={fadeUp} className="relative flex gap-5 pb-8 last:pb-0">
                <span className={`relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-pill border text-[17px] font-bold ${
                  i === 0 ? 'border-point-200 bg-point-200 text-white' : 'border-[#d1d7de] bg-white text-gray-400'
                }`}>
                  {pad(i + 1)}
                </span>
                <div className="pt-1">
                  <p className="flex items-center gap-2 type-b1 text-ink">
                    <Icon size={18} className="text-point-200" aria-hidden />
                    {s.title}
                    <span className="text-[14px] font-normal text-gray-500">{s.keywords}</span>
                  </p>
                  <p className="type-b3 mt-1.5 text-ink-2">{s.description}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
