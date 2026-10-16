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
            <p className="index-num font-en mb-8">{dept.label}</p>
            <h3 className="text-[20px] font-bold text-white tracking-[-0.02em] mb-3">{dept.name}</h3>
            <p className="text-[15px] text-white/55 leading-[1.75] mb-8">{dept.description}</p>

            {/* 담당 영역 - 헤어라인 리스트 */}
            <ul>
              {dept.focus.map((f) => (
                <li key={f} className="py-2.5 text-[13px] text-white/55 border-t border-white/10 last:border-b">
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
