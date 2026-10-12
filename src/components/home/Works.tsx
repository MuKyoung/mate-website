'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { projects } from '@/data/projects';
import type { Project } from '@/types';
import { ArrowSwap, Label } from '@/components/home/parts';
import { clipUp, fadeUp, maskUp, rowIn, stagger, staggerRows, inView } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 만든 것 - 보는 면이라 검은 바탕을 쓴다.
 *
 * 그림 넉 장을 같은 크기 칸에 넣지 않는다. 크기도, 시작하는 높이도, 움직이는 속도도
 * 서로 다르게 둔다. 첫 그림은 위 섹션(종이 면)에 걸쳐 올라가 있다.
 *
 * 적는 것은 제목과 분류, 기간, 기술뿐이다. 전부 포트폴리오 데이터에 있는 값이다.
 * 웹 · 앱 작업은 올릴 화면이 없어 목록으로 둔다.
 */

/** 그림으로 보여 줄 작업. 원본 크기를 같이 적어 불러오기 전에 자리부터 잡는다. */
const PICKS = [
  { id: '9', w: 887, h: 887 },     // 꼬꼬지생
  { id: '2', w: 1600, h: 900 },    // VR 키오스크 시뮬레이션
  { id: '11', w: 891, h: 1090 },   // VR 중고차 구매 가이드
  { id: '3', w: 727, h: 426 },     // 영창하세요 마법사님
];

const KIND: Record<string, string> = {
  'Game Application': '게임',
  'VR Application': 'VR',
  'Web Application': '웹 · 앱',
  'Education Content': '교육',
};

/** 어느 프로젝트에나 붙는 기본기는 빼고 보여 준다 */
const COMMON = ['HTML', 'CSS', 'JavaScript', 'Github'];

interface Shot { project: Project; src: string; w: number; h: number }

const shot = (id: string): Shot | null => {
  const pick = PICKS.find((p) => p.id === id);
  const project = projects.find((p) => p.id === id);
  return pick && project?.thumbnail ? { project, src: project.thumbnail, w: pick.w, h: pick.h } : null;
};

const meta = (p: Project) => `${KIND[p.category] ?? p.category} · ${p.durationMonths}개월`;
const tools = (p: Project, n: number) => p.techStack.filter((t) => !COMMON.includes(t)).slice(0, n).join(' · ');

const webWorks = projects.filter((p) => /Web|Mobile/.test(p.category));
/** 웹 · 앱 작업이 함께 쓴 기술. 건마다 같은 목록을 되풀이해 적지 않으려고 한 번만 보여 준다. */
const webStack = webWorks.length
  ? webWorks[0].techStack.filter((t) => !COMMON.includes(t) && webWorks.every((p) => p.techStack.includes(t)))
  : [];

/** 넓은 화면인지. 그림마다 따로 묻지 않게 섹션에서 한 번만 잰다. */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const read = () => setWide(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);
  return wide;
}

/**
 * 스크롤에 따라 조금씩 다른 속도로 흐르는 래퍼.
 * 좁은 화면과 '움직임 줄이기' 에서는 가만히 둔다.
 */
function Drift({ children, range, on, className = '' }: {
  children: ReactNode;
  /** 화면 아래에서 들어올 때와 위로 나갈 때의 세로 위치(px) */
  range: [number, number];
  on: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], range);
  return (
    <motion.div ref={ref} style={on ? { y } : undefined} className={className}>
      {children}
    </motion.div>
  );
}

/** 그림 한 장. 아래에서 위로 열리고, 올리면 안에서 조금 커진다. */
function Frame({ item }: { item: Shot }) {
  return (
    // 관측 대상은 잘리지 않은 바깥 요소다. 닫힌 클립은 면적이 0이라 교차가 잡히지 않는다.
    <motion.div {...inView} className="relative">
      <motion.div variants={maskUp} className="overflow-hidden bg-[var(--surface)]">
        <Image src={item.src} alt={item.project.title} width={item.w} height={item.h}
          className="h-auto w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]" />
      </motion.div>
    </motion.div>
  );
}

export default function Works() {
  const zone = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const wide = useWide();
  const drift = wide && !reduce;

  /* 커서를 따라다니는 '보기' 꼬리표 - 마우스로 그림 위에 올렸을 때만 나온다 */
  const [tag, setTag] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const follow = { stiffness: 380, damping: 32, mass: 0.4 };
  const tx = useSpring(mx, follow);
  const ty = useSpring(my, follow);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !zone.current) return;
    const r = zone.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const hover = {
    onPointerEnter: (e: PointerEvent) => { if (e.pointerType === 'mouse') setTag(true); },
    onPointerLeave: () => setTag(false),
  };

  const big = shot('9');
  const kiosk = shot('2');
  const poster = shot('11');
  const wizard = shot('3');

  return (
    <section className="relative bg-[var(--canvas)] text-[var(--paper)]">
      {/* 뒤에 깔리는 큰 숫자 - 공개한 작업 수. 오른쪽으로 삐져나가 잘린다. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <p className="font-display absolute -right-[3vw] top-[22rem] hidden leading-none text-transparent lg:block"
          style={{ fontSize: 'clamp(16rem, 31vw, 30rem)', WebkitTextStroke: '1.5px rgba(247, 243, 234, 0.13)' }}>
          {projects.length}
        </p>
      </div>

      <div ref={zone} onPointerMove={onMove} className={`relative ${container} pb-40 pt-20 sm:pb-52 lg:pt-0`}>
        <div className="grid gap-x-gutter lg:grid-cols-12">

          {/* 제목 - 좁은 화면에서는 맨 위, 넓은 화면에서는 오른쪽 단의 머리 */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:pt-28">
            <motion.div {...inView} variants={fadeUp}>
              <Label className="text-[var(--primary-200)]">만든 것</Label>
            </motion.div>
            <motion.h2 {...inView} variants={stagger} className="font-display display-l mt-7">
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">말보다</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">만든 것부터</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">보여 드립니다.</motion.span>
              </span>
            </motion.h2>
            <motion.div {...inView} variants={fadeUp} className="mt-9">
              <Link href="/projects" className="group inline-flex items-center gap-2 text-[15px] font-semibold">
                <span className="link-draw">공개한 작업 {projects.length}건 모두 보기</span>
                <ArrowSwap size={15} />
              </Link>
            </motion.div>
          </div>

          {/* 왼쪽 단 - 큰 그림이 위 섹션에 걸쳐 올라간다 */}
          <div className="mt-16 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0">
            {big && (
              <Drift on={drift} range={[40, -40]} className="lg:-mt-44">
                <Link href={`/projects/${big.project.id}`} className="group relative block" {...hover}>
                  <Frame item={big} />
                  {/* 그림 모서리에 걸친 쪽지 */}
                  <div className="absolute -bottom-8 right-3 bg-[var(--paper)] px-5 py-4 text-[var(--ink)]
                                  transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                  group-hover:-translate-y-2 sm:right-6"
                    style={{ boxShadow: '4px 5px 0 rgba(0, 0, 0, 0.4)' }}>
                    <h3 className="font-display display-s">{big.project.title}</h3>
                    <p className="mt-1 text-[13px] text-[rgba(22,21,15,0.72)]">
                      {meta(big.project)} · {tools(big.project, 3)}
                    </p>
                  </div>
                </Link>
              </Drift>
            )}

            {poster && (
              <Drift on={drift} range={[90, -40]} className="ml-auto mt-28 w-[70%] lg:ml-[16%] lg:mt-44 lg:w-[46%]">
                <Link href={`/projects/${poster.project.id}`} className="group block" {...hover}>
                  <Frame item={poster} />
                  <Caption project={poster.project} />
                </Link>
              </Drift>
            )}
          </div>

          {/* 오른쪽 단 */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2">
            {kiosk && (
              <Drift on={drift} range={[70, -70]} className="mt-20 lg:mt-24">
                <Link href={`/projects/${kiosk.project.id}`} className="group block" {...hover}>
                  <Frame item={kiosk} />
                  <Caption project={kiosk.project} />
                </Link>
              </Drift>
            )}

            {wizard && (
              <Drift on={drift} range={[30, -100]} className="mt-20 w-[84%] lg:mt-28 lg:w-full">
                <Link href={`/projects/${wizard.project.id}`} className="group block" {...hover}>
                  <Frame item={wizard} />
                  <Caption project={wizard.project} />
                </Link>
              </Drift>
            )}
          </div>
        </div>

        {/* 웹 · 앱 - 화면 없이 목록으로 */}
        {webWorks.length > 0 && (
          <div className="mt-28 grid gap-x-gutter gap-y-6 border-t border-white/20 pt-10 lg:mt-40 lg:grid-cols-12">
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
              <h3 className="font-display display-s">웹 · 앱 작업</h3>
              {webStack.length > 0 && (
                <p className="mt-2.5 text-[14px] leading-[1.7] text-white/60">{webStack.join(' · ')}</p>
              )}
            </motion.div>
            <motion.ul {...inView} variants={staggerRows} className="lg:col-span-8">
              {webWorks.map((p) => (
                <motion.li key={p.id} variants={rowIn}>
                  <Link href={`/projects/${p.id}`}
                    className="group flex items-baseline gap-x-6 border-b border-white/15 py-5">
                    <span className="font-display display-s flex-1 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                      {p.title}
                    </span>
                    <span className="text-[14px] text-white/60">{p.durationMonths}개월</span>
                    <span className="text-[var(--primary-200)]"><ArrowSwap size={16} /></span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}

        {/* 커서 꼬리표 */}
        <motion.span aria-hidden style={{ x: tx, y: ty }}
          animate={{ scale: tag ? 1 : 0.3, opacity: tag ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute left-4 top-4 z-30 hidden h-[84px] w-[84px] items-center justify-center
                     rounded-full bg-[var(--brand-fill)] text-[14px] font-bold text-white lg:flex">
          보기
        </motion.span>
      </div>
    </section>
  );
}

/** 그림 아래 한 줄 - 제목과 분류 · 기간 */
function Caption({ project }: { project: Project }) {
  return (
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h3 className="font-display display-s"><span className="link-draw">{project.title}</span></h3>
      <p className="text-[13px] text-white/60">{meta(project)}</p>
    </div>
  );
}
