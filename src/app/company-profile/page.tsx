'use client';

import Image from 'next/image';
import { useEffect } from 'react';

/* ─────────────────────────────────────────── 데이터 */
const SERVICES = [
  {
    no: '01',
    title: 'Unity 게임 · AR/VR 개발',
    desc: '2D/3D 게임, AR·VR 콘텐츠, 시뮬레이션, 모바일 게임 등 Unity 기반 모든 형태의 인터랙티브 콘텐츠를 기획부터 배포까지 외주 개발합니다.',
    stack: ['Unity', 'C#', 'AR Foundation', 'VR SDK', '2D/3D Physics'],
  },
  {
    no: '02',
    title: '웹 · 앱 개발',
    desc: '반응형 웹사이트, 관리자 대시보드, iOS/Android 앱 등 정적·동적 웹/앱 서비스를 풀사이클로 개발합니다.',
    stack: ['React', 'Next.js', 'Flutter', 'Python', 'Supabase', 'AWS', 'Vercel'],
  },
  {
    no: '03',
    title: '개발 강의 · 교육',
    desc: 'Unity, 웹/앱, AI 활용 등 실무 중심 커리큘럼으로 팀·기관 대상 맞춤형 개발 강의를 제공합니다.',
    stack: ['Unity 개발', '웹/앱 개발', 'AI 활용', '실무 프로젝트 지도'],
  },
];

const PROCESS = [
  { step: '01', title: '상담', desc: '요구사항 파악 및 프로젝트 방향성 설정' },
  { step: '02', title: '기획', desc: '상세 기획서·기술 스택·일정 수립' },
  { step: '03', title: '개발', desc: '주간 소통·코드 리뷰·진행 공유' },
  { step: '04', title: '테스트', desc: '버그 수정 및 사용자 UX 개선' },
  { step: '05', title: '배포', desc: '최종 검수·배포·모니터링' },
];

const STATS = [
  { v: '30+', l: '완료 프로젝트' },
  { v: '5년', l: '개발 경력' },
  { v: '100%', l: '프로젝트 성공률' },
  { v: '5명', l: '전문 개발자' },
];

/* ─────────────────────────────────────────── 컴포넌트 */
export default function CompanyProfilePage() {
  useEffect(() => { document.title = 'MATE 회사 소개서'; }, []);

  return (
    <>
      {/* ══════════════ 스타일 ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap');

        /* 리셋 */
        .cp * { box-sizing: border-box; margin: 0; padding: 0; }

        /* 루트 래퍼 */
        .cp {
          font-family: 'Noto Sans KR', 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #fff;
          width: 297mm;
          margin: 0 auto;
        }

        /* ── 페이지 단위 ── */
        .cp-page {
          width: 297mm;
          height: 210mm;
          overflow: hidden;
          position: relative;
          break-after: page;
          page-break-after: always;
        }
        .cp-page:last-child {
          break-after: auto;
          page-break-after: auto;
        }

        /* ════ PAGE 1 ════ */

        /* 표지 — 좌/우 split */
        .p1-left {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 44%;
          background: #08080d;
          padding: 14mm 12mm 12mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .p1-left::before {
          content: '';
          position: absolute;
          top: -30mm; right: -30mm;
          width: 80mm; height: 80mm;
          border-radius: 50%;
          background: rgba(59,130,246,0.06);
          pointer-events: none;
        }
        .p1-left::after {
          content: '';
          position: absolute;
          bottom: -20mm; left: -20mm;
          width: 60mm; height: 60mm;
          border-radius: 50%;
          background: rgba(59,130,246,0.04);
          pointer-events: none;
        }
        .p1-right {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 56%;
          background: #fff;
          padding: 13mm 14mm 12mm;
          display: flex;
          flex-direction: column;
        }

        /* 표지 좌측 요소 */
        .p1-eyebrow {
          font-size: 7.5pt;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 4mm;
        }
        .p1-headline {
          font-size: 26pt;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 3mm;
        }
        .p1-headline-dim { color: rgba(255,255,255,0.2); }
        .p1-sub {
          font-size: 8.5pt;
          color: rgba(255,255,255,0.38);
          line-height: 1.75;
          margin-bottom: 6mm;
        }

        /* 통계 2×2 */
        .p1-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2mm;
          margin-bottom: 6mm;
        }
        .p1-stat {
          padding: 3mm 4mm;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 3mm;
          background: rgba(255,255,255,0.03);
        }
        .p1-stat-v {
          font-size: 16pt;
          font-weight: 800;
          color: #fff;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 1mm;
        }
        .p1-stat-l {
          font-size: 6.5pt;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        /* 표지 좌측 하단 연락처 */
        .p1-contact {
          padding-top: 4mm;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .p1-contact-row {
          display: flex;
          align-items: center;
          gap: 2mm;
          font-size: 7pt;
          color: rgba(255,255,255,0.3);
          margin-bottom: 1.5mm;
        }
        .p1-contact-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #3b82f6;
          flex-shrink: 0;
        }

        /* 표지 우측 — About */
        .p1-badge {
          display: inline-flex;
          align-items: center;
          gap: 2mm;
          padding: 1.5mm 4mm;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 20mm;
          font-size: 6.5pt;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 5mm;
          width: fit-content;
        }
        .p1-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #22c55e;
        }
        .p1-section-label {
          font-size: 6.5pt;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 2mm;
        }
        .p1-about-title {
          font-size: 16pt;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 4mm;
        }
        .p1-about-body {
          font-size: 8pt;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 5mm;
          flex: 1;
        }

        /* Why choose us — 2×2 체크리스트 */
        .p1-why {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2mm;
        }
        .p1-why-item {
          display: flex;
          align-items: flex-start;
          gap: 2mm;
          padding: 3mm;
          background: #f9fafb;
          border-radius: 2mm;
          border: 1px solid #f3f4f6;
        }
        .p1-why-check {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 6pt;
          color: #2563eb;
          margin-top: 0.5mm;
        }
        .p1-why-title { font-size: 7.5pt; font-weight: 700; color: #111827; margin-bottom: 0.5mm; }
        .p1-why-desc { font-size: 6.5pt; color: #9ca3af; line-height: 1.5; }

        /* ════ PAGE 2 ════ */
        .p2-inner {
          padding: 10mm 14mm 10mm;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 6mm;
        }

        /* 페이지 2 헤더 */
        .p2-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4mm;
          border-bottom: 1px solid #e5e7eb;
        }
        .p2-header-title {
          font-size: 9pt;
          font-weight: 700;
          color: #111827;
        }
        .p2-header-brand {
          display: flex;
          align-items: center;
          gap: 2mm;
          font-size: 6.5pt;
          color: #9ca3af;
        }

        /* 서비스 섹션 */
        .p2-section-label {
          font-size: 6.5pt;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 3mm;
        }
        .p2-services {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4mm;
        }
        .p2-service-card {
          padding: 4mm 5mm;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
          background: #fafafa;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .p2-svc-no {
          font-size: 7pt;
          font-weight: 700;
          color: #d1d5db;
          font-variant-numeric: tabular-nums;
          margin-bottom: 1.5mm;
        }
        .p2-svc-title {
          font-size: 9pt;
          font-weight: 800;
          color: #111827;
          margin-bottom: 2mm;
          line-height: 1.3;
        }
        .p2-svc-desc {
          font-size: 7pt;
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 3mm;
        }
        .p2-svc-tags { display: flex; flex-wrap: wrap; gap: 1.5mm; }
        .p2-svc-tag {
          padding: 0.8mm 2.5mm;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          border-radius: 1.5mm;
          font-size: 6pt;
          font-weight: 500;
        }

        /* 프로세스 섹션 */
        .p2-process {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          border: 1px solid #e5e7eb;
          border-radius: 3mm;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .p2-proc-cell {
          padding: 4mm 4.5mm;
          border-right: 1px solid #e5e7eb;
          position: relative;
          background: #fff;
        }
        .p2-proc-cell:nth-child(odd) { background: #fafafa; }
        .p2-proc-cell:last-child { border-right: none; }
        .p2-proc-num {
          font-size: 6.5pt;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 0.1em;
          margin-bottom: 1.5mm;
        }
        .p2-proc-title {
          font-size: 8.5pt;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1mm;
        }
        .p2-proc-desc {
          font-size: 6.5pt;
          color: #9ca3af;
          line-height: 1.5;
        }
        .p2-arrow {
          position: absolute;
          top: 4mm; right: -2mm;
          width: 4mm; height: 4mm;
          background: inherit;
          border-right: 1px solid #e5e7eb;
          border-top: 1px solid #e5e7eb;
          transform: rotate(45deg);
          z-index: 1;
        }
        .p2-proc-cell:last-child .p2-arrow { display: none; }

        /* 연락처 */
        .p2-contact {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1.6fr;
          gap: 4mm;
          padding: 4mm 5mm;
          background: #08080d;
          border-radius: 3mm;
          margin-top: auto;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .p2-contact-item { display: flex; align-items: flex-start; gap: 3mm; }
        .p2-contact-icon {
          width: 8mm; height: 8mm;
          border-radius: 2mm;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 10pt;
          flex-shrink: 0;
        }
        .p2-contact-label {
          font-size: 6pt;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1mm;
        }
        .p2-contact-value {
          font-size: 7.5pt;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
        }
        .p2-kakao-card {
          padding: 3mm 4mm;
          background: #FEE500;
          border-radius: 2mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .p2-kakao-title { font-size: 8pt; font-weight: 800; color: #3C1E1E; margin-bottom: 0.5mm; }
        .p2-kakao-sub { font-size: 6.5pt; color: rgba(60,30,30,0.6); }
        .p2-kakao-url { font-size: 6.5pt; font-weight: 600; color: #3C1E1E; }

        /* ── 인쇄 버튼 (화면 전용) ── */
        .cp-print-bar {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          display: flex;
          gap: 8px;
        }
        .cp-btn {
          padding: 11px 24px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .cp-btn-primary {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .cp-btn-primary:hover { background: #1d4ed8; }

        /* 화면 미리보기용 여백 */
        @media screen {
          body { background: #e5e7eb !important; }
          .cp {
            margin: 72px auto 100px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          }
          .cp-page {
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            margin-bottom: 8px;
          }
        }

        /* ── 인쇄 ── */
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cp-print-bar { display: none !important; }
          .cp { width: 100%; margin: 0; box-shadow: none; }
          .cp-page { width: 100%; box-shadow: none; }
          .p1-left,
          .p2-contact { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── 인쇄 버튼 ── */}
      <div className="cp-print-bar">
        <button className="cp-btn cp-btn-primary" onClick={() => window.print()}>
          🖨️&nbsp; PDF로 저장
        </button>
      </div>

      <div className="cp">

        {/* ══════════════════════════════ PAGE 1: 표지 + 소개 ══ */}
        <div className="cp-page">

          {/* 좌측 다크 패널 */}
          <div className="p1-left">
            {/* 로고 */}
            <div>
              <Image src="/images/logo.png" alt="MATE" width={90} height={28}
                style={{ height: 22, width: 'auto', mixBlendMode: 'screen', marginBottom: '6mm' }} />

              <p className="p1-eyebrow">Company Profile · 2026</p>
              <h1 className="p1-headline">
                게임 · 웹 · 앱<br />
                <span className="p1-headline-dim">외주개발<br />전문팀</span>
              </h1>
              <p className="p1-sub">
                Unity 게임·AR/VR부터 웹/앱까지.<br />
                5년 경력, 30개 이상 프로젝트로<br />
                검증된 풀스택 외주개발팀.
              </p>
            </div>

            {/* 통계 */}
            <div>
              <div className="p1-stats">
                {STATS.map(s => (
                  <div className="p1-stat" key={s.l}>
                    <div className="p1-stat-v">{s.v}</div>
                    <div className="p1-stat-l">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* 연락처 */}
              <div className="p1-contact">
                {[
                  { icon: '✉', text: 'hsib1212@naver.com' },
                  { icon: '📞', text: '0507-1339-9141' },
                  { icon: '🌐', text: 'devteammate.co.kr' },
                ].map(c => (
                  <div className="p1-contact-row" key={c.text}>
                    <span className="p1-contact-dot" />
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 About 패널 */}
          <div className="p1-right">
            <div className="p1-badge">
              <span className="p1-badge-dot" />
              현재 상담 가능
            </div>

            <p className="p1-section-label">About MATE</p>
            <h2 className="p1-about-title">
              아이디어를 완성도 높은<br />결과물로 만들어 드립니다
            </h2>
            <p className="p1-about-body">
              MATE는 <strong>Unity 게임·AR/VR</strong>, <strong>웹/앱 개발</strong>, <strong>개발 강의</strong>에 특화된
              외주개발 전문팀입니다. 2020년부터 시작해 AR·VR 시뮬레이션, 웹·모바일 앱까지
              영역을 넓혀 총 30개 이상의 프로젝트를 성공적으로 완수했습니다.<br /><br />
              단순 기능 구현을 넘어 <strong>기획·디자인·개발·배포</strong> 전 과정을 함께하는
              파트너십을 지향하며, 납기 준수와 품질 보증을 최우선 가치로 삼아
              100% 프로젝트 성공률을 유지하고 있습니다.
            </p>

            {/* Why choose us */}
            <p className="p1-section-label" style={{ marginTop: '4mm' }}>Why MATE</p>
            <div className="p1-why">
              {[
                { t: '검증된 실무 경험', d: '5년 이상, 30개+ 프로젝트 완수' },
                { t: '풀사이클 개발', d: '기획·개발·배포 전 과정 원스톱' },
                { t: '투명한 소통', d: '주간 진행 공유, 실시간 소통' },
                { t: '품질 보증', d: '철저한 테스트·코드 리뷰' },
              ].map(w => (
                <div className="p1-why-item" key={w.t}>
                  <div className="p1-why-check">✓</div>
                  <div>
                    <div className="p1-why-title">{w.t}</div>
                    <div className="p1-why-desc">{w.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════ PAGE 2: 서비스 + 프로세스 + 연락처 ══ */}
        <div className="cp-page">
          <div className="p2-inner">

            {/* 헤더 */}
            <div className="p2-header">
              <span className="p2-header-title">제공 서비스 &amp; 개발 프로세스</span>
              <div className="p2-header-brand">
                <Image src="/images/logo.png" alt="MATE" width={60} height={20}
                  style={{ height: 14, width: 'auto', filter: 'invert(1)', opacity: 0.3 }} />
                <span>devteammate.co.kr</span>
              </div>
            </div>

            {/* 서비스 3-컬럼 */}
            <div>
              <p className="p2-section-label">Services</p>
              <div className="p2-services">
                {SERVICES.map(s => (
                  <div className="p2-service-card" key={s.no}>
                    <div className="p2-svc-no">{s.no}</div>
                    <div className="p2-svc-title">{s.title}</div>
                    <div className="p2-svc-desc">{s.desc}</div>
                    <div className="p2-svc-tags">
                      {s.stack.map(t => <span className="p2-svc-tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 개발 프로세스 */}
            <div>
              <p className="p2-section-label">Development Process</p>
              <div className="p2-process">
                {PROCESS.map(p => (
                  <div className="p2-proc-cell" key={p.step}>
                    <div className="p2-arrow" />
                    <div className="p2-proc-num">{p.step}</div>
                    <div className="p2-proc-title">{p.title}</div>
                    <div className="p2-proc-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 연락처 */}
            <div className="p2-contact">
              {[
                { icon: '✉️', label: '이메일', value: 'hsib1212@naver.com' },
                { icon: '📞', label: '전화', value: '0507-1339-9141' },
                { icon: '🌐', label: '웹사이트', value: 'devteammate.co.kr' },
              ].map(c => (
                <div className="p2-contact-item" key={c.label}>
                  <div className="p2-contact-icon">{c.icon}</div>
                  <div>
                    <div className="p2-contact-label">{c.label}</div>
                    <div className="p2-contact-value">{c.value}</div>
                  </div>
                </div>
              ))}
              <div className="p2-kakao-card">
                <div>
                  <div className="p2-kakao-title">💬 카카오톡 오픈채팅</div>
                  <div className="p2-kakao-sub">평일 10:00 – 18:00 실시간 응대</div>
                  <div className="p2-kakao-url">open.kakao.com/o/scVFEK3h</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
