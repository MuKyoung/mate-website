'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import Ticker from '@/components/motion/Ticker';
import { heroSlides } from '@/data/home';
import { easeEnter } from '@/lib/motion';
import { arrowHover, container } from '@/lib/styles';

/** 한 장이 머무는 시간 */
const HOLD = 6500;

/**
 * 첫 화면 - 영역마다 한 장씩 넘어가는 사진, 왼쪽 아래 큰 제목, 진행 막대 (Figma 1-1. hero).
 * 맨 아래 흰 띠에는 수상 · 전시 이력이 흐른다 (Figma 는 협력사 로고 띠).
 *
 * 홈 첫 화면(큐브) 바로 아래에 있어, 화면에 들어온 뒤부터 글자가 올라오고 막대가 차기 시작한다.
 * 다음 장으로 넘기는 시점은 진행 막대의 CSS 애니메이션이 끝나는 순간이다.
 * 마우스를 올리면 막대가 멈추고, 그래서 넘어가지도 않는다.
 */
export default function HeroSlider({ ticker }: { ticker: string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const seen = useInView(sectionRef, { amount: 0.35, once: true });

  const go = (i: number) => {
    setIndex(i);
    setCycle((c) => c + 1);
  };
  const slide = heroSlides[index];

  return (
    <section id="hero" ref={sectionRef} data-header="dark" className="relative flex h-[100svh] min-h-[600px] flex-col bg-night">
      <div className="relative flex-1 overflow-hidden"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {/* 사진 - 모두 깔아 두고 투명도만 바꾼다. 들어온 장은 천천히 당겨진다 */}
        {heroSlides.map((s, i) => {
          const on = i === index;
          return (
            <motion.div key={s.key} aria-hidden={!on} className="absolute inset-0"
              initial={false} animate={{ opacity: on ? 1 : 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}>
              <motion.div className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: on ? 1 : 1.08 }}
                transition={on ? { duration: 8, ease: 'linear' } : { duration: 0, delay: 1.2 }}>
                <Image src={s.image} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
              </motion.div>
            </motion.div>
          );
        })}

        {/* 덮개 - 왼쪽과 아래는 남색으로, 위는 옅은 남빛 안개 (Figma overlay-left · overlay-bottom) */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,29,0.72)_0%,rgba(7,11,29,0.05)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(7,11,29,0)_0%,rgba(7,11,29,0.95)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-[214px] bg-[linear-gradient(180deg,rgba(61,73,127,0.8)_0%,rgba(61,73,127,0)_100%)]" />

        <div className={`${container} relative flex h-full flex-col justify-end pb-[clamp(44px,9vh,120px)]`}>
          <AnimatePresence mode="wait" initial={true}>
            <motion.div key={slide.key}
              initial={{ opacity: 0, y: 28 }}
              animate={seen ? { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeEnter, delay: 0.15 } } : undefined}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.35 } }}
              className="max-w-[960px] [text-shadow:0_0_12px_rgba(0,0,0,0.25)]">
              <h2 className="font-bold leading-[1.3] tracking-[-0.003em] text-white"
                style={{ fontSize: 'clamp(2rem, 1rem + 2.9vw, 3.5rem)' }}>
                {slide.title[0]}<br />{slide.title[1]}
              </h2>
              <p className="mt-5 max-w-[34em] text-[15px] leading-[1.65] text-white/90 sm:mt-6 sm:text-[16px]">
                {slide.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={seen ? { opacity: 1 } : undefined}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-14">
            {/* 진행 막대 - 누르면 그 장으로 */}
            <div className="flex items-center gap-3 sm:gap-4">
              {heroSlides.map((s, i) => (
                <button key={s.key} type="button" onClick={() => go(i)}
                  aria-label={`${i + 1}번째 화면: ${s.title.join(' ')}`} aria-current={i === index}
                  className="relative h-6 w-12 sm:w-[110px]">
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/40" />
                  {i === index && (
                    <span key={cycle}
                      className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 origin-left bg-point-light"
                      onAnimationEnd={() => go((index + 1) % heroSlides.length)}
                      style={reduce ? undefined : {
                        animation: `bar-fill ${HOLD}ms linear both`,
                        animationPlayState: paused || !seen ? 'paused' : 'running',
                      }} />
                  )}
                </button>
              ))}
            </div>
            <Link href={slide.href}
              className="group inline-flex items-center gap-1.5 text-[14px] font-bold text-white/85 transition-colors hover:text-white sm:text-[15px]">
              자세히 보기
              <FiArrowUpRight size={15} className={arrowHover} />
            </Link>
            <p className="ml-auto hidden text-[13px] text-white/55 md:block">
              <span className="tabular-nums text-white/80">{String(index + 1).padStart(2, '0')}</span>
              {' / '}{String(heroSlides.length).padStart(2, '0')}
              <span className="mx-2.5 text-white/30">|</span>
              {slide.credit}
            </p>
          </motion.div>
        </div>
      </div>

      {/* 흐르는 띠 - 수상 · 전시 이력 */}
      <div className="relative h-16 shrink-0 border-b border-line bg-white lg:h-[76px]">
        <Ticker items={ticker} className="h-full" />
      </div>
    </section>
  );
}
