'use client';

import { motion } from 'framer-motion';
import { FiCode, FiPenTool, FiCompass } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { departments, totalHeadcount } from '@/data/organization';
import type { Department } from '@/types';
import { fadeUp, revealUp, stagger, inView, easeEnter } from '@/lib/motion';

const iconByDept: Record<Department, IconType> = {
  development: FiCode,
  design: FiPenTool,
  operations: FiCompass,
};

/* 부서별 커넥터 세그먼트 — gap-6(24px)의 절반인 12px만큼 좌우로 뻗어 이어진다 */
function ConnectorRow() {
  const seg = ['left-1/2 -right-3', '-left-3 -right-3', '-left-3 right-1/2'];
  return (
    <div className="hidden md:grid grid-cols-3 gap-6 h-16" aria-hidden="true">
      {seg.map((cls, i) => (
        <div key={i} className="relative">
          <div className={`absolute top-0 h-px bg-[#d1d6db] ${cls}`} />
          <div className="absolute top-0 left-1/2 w-px h-full bg-[#d1d6db]" />
        </div>
      ))}
    </div>
  );
}

export default function OrgChart() {
  return (
    <div>
      {/* ── 루트 노드 ── */}
      <motion.div {...inView} variants={revealUp} className="flex justify-center">
        <div className="relative rounded-[28px] bg-[#191f28] px-10 sm:px-14 py-8 sm:py-10 text-center min-w-[240px]">
          <p className="text-[13px] font-semibold text-[#5a9cf8] mb-2">Dev Team MATE</p>
          <p className="text-4xl sm:text-5xl font-extrabold text-white font-mono-stat tracking-[-0.03em]">
            {totalHeadcount}<span className="text-2xl sm:text-3xl ml-1">명</span>
          </p>
          <p className="text-[14px] text-white/55 mt-2">하나의 팀, 세 개의 축</p>
        </div>
      </motion.div>

      {/* 루트에서 내려오는 수직선 */}
      <div className="hidden md:flex justify-center" aria-hidden="true">
        <div className="w-px h-14 bg-[#d1d6db]" />
      </div>

      <ConnectorRow />

      {/* ── 부서 노드 ── */}
      <motion.div {...inView} variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 md:mt-0">
        {departments.map((dept) => {
          const Icon = iconByDept[dept.id];
          return (
            <motion.div key={dept.id} variants={fadeUp}
              className="rounded-[28px] border border-[#e5e8eb] bg-white p-8 sm:p-10 shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex items-start justify-between mb-8">
                <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6]">
                  <Icon size={26} />
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]">
                  {dept.headcount}
                  <span className="text-base font-bold text-[#adb5bd] ml-1">명</span>
                </span>
              </div>

              <p className="text-[13px] font-semibold text-[#3182f6] mb-2">{dept.label}</p>
              <h3 className="text-[26px] sm:text-[30px] font-extrabold text-[#191f28] tracking-[-0.025em] mb-4">
                {dept.name}
              </h3>
              <p className="text-[16px] text-[#4e5968] leading-[1.75] mb-8">{dept.description}</p>

              {/* 담당 영역 */}
              <div className="pt-6 border-t border-[#e5e8eb]">
                <p className="text-[12px] font-semibold text-[#adb5bd] mb-3">담당 영역</p>
                <ul className="flex flex-wrap gap-2">
                  {dept.focus.map((f) => (
                    <li key={f} className="tag">{f}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── 인원 구성 요약 바 ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.05, ease: easeEnter }}
        className="mt-14"
      >
        <div className="flex h-3 rounded-full overflow-hidden bg-[#eaedf1]">
          {departments.map((d, i) => (
            <motion.div key={d.id}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.9, ease: easeEnter }}
              style={{
                width: `${(d.headcount / totalHeadcount) * 100}%`,
                transformOrigin: 'left',
                background: i === 0 ? '#3182f6' : i === 1 ? '#5a9cf8' : '#191f28',
              }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-5">
          {departments.map((d, i) => (
            <div key={d.id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full"
                style={{ background: i === 0 ? '#3182f6' : i === 1 ? '#5a9cf8' : '#191f28' }} />
              <span className="text-[14px] font-semibold text-[#191f28]">{d.name}</span>
              <span className="text-[14px] text-[#6b7684]">{d.headcount}명</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
