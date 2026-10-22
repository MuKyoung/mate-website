'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import PillTabs from '@/components/ui/PillTabs';
import type { NavLink } from '@/data/navigation';
import { fadeUp, onMount, stagger } from '@/lib/motion';
import { container } from '@/lib/styles';

interface PageHeaderProps {
  /** 제목 위 작은 이름 - 영역 페이지에서 '사업영역' */
  eyebrow?: string;
  title: React.ReactNode;
  desc?: string;
  /** 머리 아래 알약 탭 - 같은 갈래의 다른 페이지나 이 페이지의 칸으로 간다 */
  tabs?: NavLink[];
  /** 지금 페이지에 해당하는 탭의 href */
  active?: string;
  /** 깔 사진. 없으면 남색 격자 면 */
  image?: { src: string; position?: string };
}

/**
 * 하위 페이지 머리 - 사진 위에 남색을 80% 깔고 가운데 제목, 아래에 알약 탭.
 * Figma 사업영역 · 회사소개 머리와 같은 구성이다. 헤더는 이 위에서 흰 글자가 된다.
 */
export default function PageHeader({ eyebrow, title, desc, tabs, active, image }: PageHeaderProps) {
  return (
    <section data-header="dark"
      className={`relative isolate flex min-h-[440px] items-center overflow-hidden pb-14 pt-32 sm:min-h-[520px] lg:min-h-[600px] ${image ? 'bg-night' : 'night-grid'}`}>
      {image && (
        <>
          <motion.div aria-hidden className="absolute inset-0 -z-10"
            initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}>
            <Image src={image.src} alt="" fill priority sizes="100vw" className="object-cover"
              style={{ objectPosition: image.position ?? 'center' }} />
          </motion.div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-[rgba(7,11,29,0.8)]" />
        </>
      )}

      <motion.div {...onMount} variants={stagger} className={`${container} relative text-center`}>
        {eyebrow && <motion.p variants={fadeUp} className="eyebrow on-night mb-3">{eyebrow}</motion.p>}
        <motion.h1 variants={fadeUp} className="type-h1 font-bold text-white">{title}</motion.h1>
        {desc && (
          <motion.p variants={fadeUp} className="type-b3 mx-auto mt-5 max-w-xl text-gray-200">{desc}</motion.p>
        )}
        {tabs && tabs.length > 0 && (
          <motion.div variants={fadeUp} className="mt-10 sm:mt-14">
            <PillTabs tabs={tabs.map((t) => ({ key: t.href, label: t.label, href: t.href }))} active={active ?? ''} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
