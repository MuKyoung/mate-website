'use client';

import { motion } from 'framer-motion';
import { departments } from '@/data/organization';
import { fadeUp, fadeLeft, fadeRight, stagger, inView } from '@/lib/motion';

/* 인원 수는 적지 않는다 (사용자 요청, 2026-10-16). 부서와 맡는 일만 보여 준다. */
export default function OrgChart() {
  return (
    <div>
      {/* ── 부서 3열 - 헤어라인 칼럼 ── */}
      <motion.div {...inView} variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 border-y border-white/10">
        {departments.map((dept, i) => (
          <motion.div key={dept.id} variants={[fadeLeft, fadeUp, fadeRight][i % 3]}
            className={[
              'py-12 border-white/10',
              i > 0 ? 'border-t md:border-t-0 md:border-l md:pl-10' : '',
              i < departments.length - 1 ? 'md:pr-10' : '',
            ].join(' ')}>
            <p className="mono-label mb-8">{dept.label}:</p>
            <h3 className="mb-3 text-[22px] font-medium tracking-[-0.03em] text-white">{dept.name}</h3>
            <p className="mb-8 text-[15px] leading-[1.75] text-white/60">{dept.description}</p>

            {/* 담당 영역 - 헤어라인 리스트 */}
            <ul>
              {dept.focus.map((f) => (
                <li key={f} className="border-t border-white/10 py-2.5 font-mono text-[12px] text-white/60 last:border-b">
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
