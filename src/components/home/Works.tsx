'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import type { Project } from '@/types';
import { Card, GroupLabel, Row, Section } from '@/components/home/kit';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { btnOutline } from '@/lib/styles';

/**
 * 최근 작업.
 *
 * 그림이 있는 작업은 그림으로, 공개할 화면이 없는 웹 · 앱 작업은 목록으로 보여 준다.
 * 적는 것은 제목과 분류, 기간뿐이다. 전부 포트폴리오 데이터에 있는 값이다.
 */

/** 그림으로 보여 줄 작업 */
const PICKS = ['9', '2', '3', '4'];

const KIND: Record<string, string> = {
  'Game Application': '게임',
  'VR Application': 'VR',
  'Web Application': '웹 · 앱',
  'Education Content': '교육',
};

const meta = (p: Project) => `${KIND[p.category] ?? p.category} · ${p.durationMonths}개월`;

const shots = PICKS
  .map((id) => projects.find((p) => p.id === id))
  .filter((p): p is Project & { thumbnail: string } => Boolean(p?.thumbnail));

const webWorks = projects.filter((p) => /Web|Mobile/.test(p.category));

export default function Works() {
  return (
    <Section id="works" title="최근 작업" summary={`공개한 작업 ${projects.length}건 가운데 일부입니다.`}>
      <motion.ul {...inView} variants={staggerTight} className="-mx-3 grid grid-cols-2 gap-3 medium:mx-0 medium:gap-4">
        {shots.map((p) => (
          <motion.li key={p.id} variants={fadeUp}>
            <Link href={`/projects/${p.id}`}
              className="group block rounded-block bg-surface p-3 transition-colors duration-150 ease-calm hover:bg-surface-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-thumb bg-surface-2">
                <Image src={p.thumbnail} alt="" fill sizes="(min-width: 960px) 30vw, 46vw"
                  className="object-cover transition-transform duration-500 ease-calm group-hover:scale-[1.03]" />
              </div>
              <div className="px-2 pb-2 pt-3.5 medium:px-3">
                <h3 className="truncate text-lst font-medium text-[var(--text-1)]">{p.title}</h3>
                <p className="mt-1 text-sub text-[var(--text-3)]">{meta(p)}</p>
              </div>
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      {webWorks.length > 0 && (
        <>
          <GroupLabel>웹 · 앱</GroupLabel>
          <Card>
            <ul>
              {webWorks.map((p) => (
                <Row key={p.id} main={p.title} trail={`${p.durationMonths}개월`} href={`/projects/${p.id}`} />
              ))}
            </ul>
          </Card>
        </>
      )}

      <motion.div {...inView} variants={fadeUp} className="pt-1">
        <Link href="/projects" className={`${btnOutline} w-full medium:w-auto`}>전체 포트폴리오 {projects.length}건</Link>
      </motion.div>
    </Section>
  );
}
