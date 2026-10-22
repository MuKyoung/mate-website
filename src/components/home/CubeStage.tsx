'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BrandCube from '@/components/visual/BrandCube';
import HorizonGlow from '@/components/visual/HorizonGlow';
import ScrollCue from '@/components/motion/ScrollCue';
import { easeEnter } from '@/lib/motion';

/**
 * 홈 첫 화면 - 위에서 휘어 내려오는 빛, 한가운데 잡아 돌리는 큐브, 맨 아래 스크롤 유도.
 *
 * 2026-10-19 에 만든 첫 화면을 세종 Figma 체계 위에 되살렸다 (2026-10-22, 사용자 요청 "큐브 같은건 살려줘").
 * 스크롤 유도는 하는 일(#what)로 내려보낸다.
 * 로고와 소개 줄은 10/19 에 사용자가 뺐다 - 다시 넣지 않는다.
 */
export default function CubeStage() {
  // 스크롤하면 큐브와 스크롤 유도가 빛보다 빠르게 위로 빠지며 옅어진다
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // 큐브는 스크롤을 내리면 더 빨리 위로 빠지면서 반 바퀴 남짓 더 돈다
  const cubeY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const cubeSpin = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section id="top" ref={ref} data-header="dark"
      className="relative flex flex-col overflow-hidden bg-night" style={{ minHeight: '100svh' }}>
      <HorizonGlow side="top" rim="min(31vh, 15vw + 140px)" radius="max(96vw, 760px)" />

      {/* 큐브 - 헤더와 스크롤 유도 사이 남는 높이의 한가운데 */}
      <motion.div style={{ y: cubeY, opacity: fade }}
        className="relative flex flex-1 items-center justify-center pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.3, ease: easeEnter }}>
          <BrandCube spin={cubeSpin} />
        </motion.div>
      </motion.div>

      {/* 스크롤 유도 - 첫 화면 맨 아래 가운데 */}
      <motion.div style={{ opacity: fade }} className="relative flex justify-center pb-6 pt-4 sm:pb-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.5, ease: easeEnter }}>
          <ScrollCue target="what" />
        </motion.div>
      </motion.div>
    </section>
  );
}
