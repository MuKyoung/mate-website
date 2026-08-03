'use client';

import { motion } from 'framer-motion';
import { departments, totalHeadcount } from '@/data/organization';
import { fadeUp, fadeLeft, fadeRight, stagger, inView, easeEnter } from '@/lib/motion';

/* 부서 세그먼트 컬러 — 화이트 / 블루 / 뉴트럴 */
const segmentColors = ['#ffffff', '#3182f6', 'rgba(255,255,255,0.25)'];

export default function OrgChart() {
  return (
    <div>
      {/* ── 상단 요약 행 ── */}
      <motion.div {...inView} variants={fadeLeft}
        className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pb-10 border-b border-white/10">
        <p className="font-en text-5xl sm:text-6xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.03em]">
          {totalHeadcount}<span className="text-2xl sm:text-3xl ml-0.5">명</span>
        </p>
        <p className="text-[15px] text-white/45">하나의 팀, 세 개의 축</p>
      </motion.div>

      {/* ── 부서 3열 — 헤어라인 칼럼 ── */}
      <motion.div {...inView} variants={stagger} className="grid grid-cols-1 md:grid-cols-3">
        {departments.map((dept, i) => (
          <motion.div key={dept.id} variants={[fadeLeft, fadeUp, fadeRight][i % 3]}
            className={[
              'py-12 border-white/10',
              i > 0 ? 'border-t md:border-t-0 md:border-l md:pl-10' : '',
              i < departments.length - 1 ? 'md:pr-10' : '',
            ].join(' ')}>
            <p className="index-num font-en mb-8">{dept.label}</p>
            <p className="font-en text-5xl sm:text-6xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.03em] mb-6">
              {dept.headcount}
              <span className="text-xl sm:text-2xl font-bold text-white/30 ml-1">명</span>
            </p>
            <h3 className="text-[20px] font-bold text-white tracking-[-0.02em] mb-3">{dept.name}</h3>
            <p className="text-[15px] text-white/55 leading-[1.75] mb-8">{dept.description}</p>

            {/* 담당 영역 — 헤어라인 리스트 */}
            <ul>
              {dept.focus.map((f) => (
                <li key={f} className="py-2.5 text-[13px] text-white/45 border-t border-white/10 last:border-b">
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* ── 인원 구성 비율 바 ── */}
      <motion.div {...inView} variants={fadeUp}
        className="pt-10 border-t border-white/10"
      >
        <div className="flex h-2">
          {departments.map((d, i) => (
            <motion.div key={d.id}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.9, ease: easeEnter }}
              style={{
                width: `${(d.headcount / totalHeadcount) * 100}%`,
                transformOrigin: 'left',
                background: segmentColors[i] ?? 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-5">
          {departments.map((d, i) => (
            <p key={d.id} className="index-num">
              <span className="w-2 h-2 inline-block flex-shrink-0"
                style={{ background: segmentColors[i] ?? 'rgba(255,255,255,0.25)' }} />
              {d.name} {d.headcount}명
            </p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
