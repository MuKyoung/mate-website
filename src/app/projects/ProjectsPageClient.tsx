'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ProjectFilter from '@/components/ProjectFilter';
import { domainOf } from '@/data/projects';
import { Project } from '@/types';
import { fadeUp, onMount, stagger } from '@/lib/motion';
import { container } from '@/lib/styles';

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  // 머리 문구의 숫자가 목록과 어긋나지 않도록 실제 데이터에서 센다
  const count = (d: string) => projects.filter((p) => domainOf(p.category) === d).length;

  // 머리 바탕 - 작업 화면을 흐리게 깐 타일 (Figma 11-1. hero 의 흐린 현장 사진 격자)
  const shots = projects.filter((p) => p.thumbnail).map((p) => p.thumbnail as string);
  const tiles = Array.from({ length: 15 }, (_, i) => shots[i % shots.length]);

  return (
    <>
      <section data-header="light"
        className="relative isolate flex min-h-[460px] items-center overflow-hidden pb-16 pt-32 sm:min-h-[540px] lg:min-h-[640px]">
        <div aria-hidden className="absolute -inset-6 -z-10 grid scale-105 grid-cols-3 grid-rows-5 gap-3 blur-[7px] sm:grid-cols-4 sm:grid-rows-4 lg:grid-cols-5 lg:grid-rows-3">
          {tiles.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-[6px] bg-gray-100">
              <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-white/60" />
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[280px] bg-gradient-to-b from-[rgba(61,73,127,0.55)] to-transparent" />

        <motion.div {...onMount} variants={stagger} className={`${container} text-center`}>
          <motion.p variants={fadeUp} className="eyebrow mb-3">Portfolio</motion.p>
          <motion.h1 variants={fadeUp} className="type-h1 text-ink">
            게임 · VR <b>{count('game')}건</b>, 웹 · 앱 <b>{count('web')}건</b>, 강의 <b>{count('edu')}건</b>
            <br /><b>전부 납품이 끝난 것들</b>입니다
          </motion.h1>
        </motion.div>
      </section>

      <section data-header="light" className="bg-white py-24 sm:py-28 xl:pb-[160px] xl:pt-[120px]">
        <div className={container}>
          <motion.h2 {...onMount} variants={fadeUp} className="type-h1 mb-10 text-center font-bold text-ink sm:mb-12">
            프로젝트 포트폴리오
          </motion.h2>
          <ProjectFilter projects={projects} />
        </div>
      </section>
    </>
  );
}
