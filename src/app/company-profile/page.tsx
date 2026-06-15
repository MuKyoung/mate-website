'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { awards } from '@/data/teamCapabilities';

const HIGHLIGHT_AWARDS = [
  { year: 2025, title: 'G-STAR', org: '한국게임산업협회', rank: '전시 참가' },
  { year: 2025, title: '학생창업유망팀300', org: '교육부', rank: '교육부장관 인증서' },
  { year: 2024, title: '국방 AI 컨퍼런스', org: '국방부', rank: '최우수상' },
  { year: 2024, title: '글로벌게임챌린지(GGC) 2024', org: '한국게임학회', rank: '우수논문상' },
  { year: 2024, title: '농림축산식품부 공공데이터 창업경진대회', org: '농림축산식품부', rank: '우수상' },
  { year: 2024, title: 'SDGs 소셜벤처 챔피언십', org: 'SDGs', rank: '은상' },
  { year: 2023, title: '디자인씽킹', org: '영남이공대학교 공학기술교육혁신센터', rank: '대상' },
  { year: 2021, title: '공학페스티벌 창의적 종합설계 경진대회', org: '산업통상자원부·KIAT', rank: '한국산업진흥원장상' },
];

const SERVICES = [
  {
    no: '01',
    title: 'Unity 게임 · AR/VR 개발',
    desc: '2D/3D 게임, AR·VR 콘텐츠, 시뮬레이션, 모바일 게임 등 Unity 기반 모든 형태의 인터랙티브 콘텐츠를 외주 개발합니다.',
    stack: ['Unity', 'C#', 'AR Foundation', 'VR SDK', '2D/3D Physics'],
  },
  {
    no: '02',
    title: '웹 · 앱 개발',
    desc: '반응형 웹사이트, 관리자 대시보드, iOS/Android 앱 등 정적·동적 웹/앱 서비스를 기획부터 배포까지 풀사이클로 개발합니다.',
    stack: ['React', 'Next.js', 'Flutter', 'Python', 'AWS', 'Vercel'],
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
  { step: '02', title: '기획', desc: '상세 기획서 · 기술 스택 · 일정 수립' },
  { step: '03', title: '개발', desc: '주간 소통 · 코드 리뷰 · 진행 상황 공유' },
  { step: '04', title: '테스트', desc: '버그 수정 및 사용자 테스트 · UX 개선' },
  { step: '05', title: '배포', desc: '최종 검수 · 배포 · 모니터링' },
];

const TEAM = [
  { name: '박무경', role: 'Unity 클라이언트 개발', skills: 'AR/VR · 2D/3D · Unity · C#' },
  { name: '정성권', role: 'Unity 클라이언트 개발', skills: 'Unity · C# · 서버 연동 · Git' },
  { name: '전승원', role: 'UI/UX 디자인', skills: 'Figma · UI/UX · 디자인 시스템' },
  { name: '이도연', role: '웹 · 앱 개발', skills: 'React · Next.js · Flutter · Python · AWS' },
];

export default function CompanyProfilePage() {
  useEffect(() => {
    document.title = 'MATE 회사 소개서';
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Noto Sans KR', sans-serif; background: #f1f3f6; }

        .profile-root {
          max-width: 794px;
          margin: 0 auto;
          background: #fff;
        }

        /* ── 공통 ── */
        .accent   { color: #2563eb; }
        .tag-pill {
          display: inline-block;
          padding: 2px 10px;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          margin: 2px 3px 2px 0;
        }
        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 6px;
        }
        .divider { width: 100%; height: 1px; background: #e5e7eb; }

        /* ── 표지 ── */
        .cover {
          background: #0a0a0f;
          color: #fff;
          padding: 72px 56px 60px;
          min-height: 420px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .cover::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: rgba(59,130,246,0.07);
          pointer-events: none;
        }
        .cover-top { display: flex; align-items: center; justify-content: space-between; }
        .cover-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border: 1px solid rgba(59,130,246,0.35);
          border-radius: 20px;
          font-size: 11px;
          color: #93c5fd;
          background: rgba(59,130,246,0.08);
        }
        .cover-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
        }
        .cover-main { margin-top: 48px; }
        .cover-eyebrow {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin-bottom: 14px;
        }
        .cover-headline {
          font-size: 42px; font-weight: 800; line-height: 1.08;
          letter-spacing: -0.02em; margin-bottom: 16px;
        }
        .cover-headline .dim { color: rgba(255,255,255,0.22); }
        .cover-sub {
          font-size: 14px; color: rgba(255,255,255,0.42); line-height: 1.7;
          max-width: 480px;
        }
        .cover-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 48px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .cover-contact { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.8; }
        .cover-year { font-size: 11px; color: rgba(255,255,255,0.2); font-variant-numeric: tabular-nums; }

        /* ── 통계 바 ── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid #e5e7eb;
        }
        .stat-cell {
          padding: 20px 24px;
          border-right: 1px solid #e5e7eb;
          text-align: center;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-value { font-size: 26px; font-weight: 800; color: #111827; font-variant-numeric: tabular-nums; }
        .stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }

        /* ── 섹션 공통 ── */
        .section { padding: 44px 56px; border-bottom: 1px solid #e5e7eb; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 24px; letter-spacing: -0.01em; }

        /* ── 서비스 ── */
        .service-item {
          display: flex;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .service-item:last-child { border-bottom: none; padding-bottom: 0; }
        .service-no { font-size: 11px; font-weight: 700; color: #d1d5db; font-variant-numeric: tabular-nums; flex-shrink: 0; padding-top: 2px; }
        .service-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .service-desc { font-size: 12px; color: #6b7280; line-height: 1.7; margin-bottom: 10px; }

        /* ── 프로세스 ── */
        .process-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        .process-cell {
          padding: 18px 14px;
          border-right: 1px solid #e5e7eb;
          position: relative;
        }
        .process-cell:last-child { border-right: none; }
        .process-step-num {
          font-size: 10px; font-weight: 700; color: #2563eb;
          letter-spacing: 0.1em; margin-bottom: 6px;
        }
        .process-step-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 5px; }
        .process-step-desc { font-size: 11px; color: #9ca3af; line-height: 1.5; }
        .process-arrow {
          position: absolute;
          top: 18px; right: -7px;
          width: 13px; height: 13px;
          background: #fff;
          border-right: 1px solid #e5e7eb;
          border-top: 1px solid #e5e7eb;
          transform: rotate(45deg);
          z-index: 1;
        }
        .process-cell:last-child .process-arrow { display: none; }

        /* ── 팀 ── */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .team-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .team-avatar {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: #eff6ff;
          border: 2px solid #bfdbfe;
          margin: 0 auto 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #2563eb;
        }
        .team-name { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .team-role { font-size: 11px; color: #6b7280; margin-bottom: 8px; line-height: 1.4; }
        .team-skills { font-size: 10px; color: #9ca3af; line-height: 1.5; }

        /* ── 수상 ── */
        .award-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .award-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }
        .award-year {
          font-size: 10px; font-weight: 700; color: #2563eb;
          font-variant-numeric: tabular-nums; flex-shrink: 0; padding-top: 1px;
        }
        .award-title { font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px; }
        .award-org { font-size: 10px; color: #9ca3af; }
        .award-rank {
          display: inline-block;
          margin-left: 6px;
          padding: 1px 6px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
        }

        /* ── 연락처 ── */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .contact-item { display: flex; align-items: flex-start; gap: 10px; }
        .contact-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #eff6ff; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .contact-label { font-size: 10px; color: #9ca3af; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.1em; }
        .contact-value { font-size: 13px; font-weight: 600; color: #111827; }

        /* ── 인쇄 버튼 (화면 전용) ── */
        .print-bar {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 100;
        }
        .btn-print {
          display: flex; align-items: center; gap-: 8px;
          padding: 12px 28px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
          transition: background 0.15s;
          font-family: inherit;
        }
        .btn-print:hover { background: #1d4ed8; }

        @media screen {
          /* 고정 헤더(56px) 높이 보상 */
          .profile-root { margin-top: 56px; }
        }

        @media print {
          @page { size: A4; margin: 0; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* 사이트 헤더·푸터·플로팅 버튼 숨기기 */
          header, footer, .print-bar { display: none !important; }
          .profile-root { max-width: 100%; margin-top: 0 !important; }
          .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break-before { page-break-before: always; }
        }
      `}</style>

      {/* ── 인쇄 버튼 ── */}
      <div className="print-bar">
        <button className="btn-print" onClick={() => window.print()}>
          🖨️&nbsp;&nbsp;PDF로 저장
        </button>
      </div>

      <div className="profile-root">

        {/* ════ 표지 ════ */}
        <div className="cover">
          <div className="cover-top">
            <Image src="/images/logo.png" alt="MATE" width={100} height={32}
              style={{ height: 28, width: 'auto', mixBlendMode: 'screen' }} />
            <div className="cover-badge">
              <span className="cover-badge-dot" />
              상담 가능
            </div>
          </div>

          <div className="cover-main">
            <p className="cover-eyebrow">Company Profile · 2026</p>
            <h1 className="cover-headline">
              게임 · 웹 · 앱<br />
              <span className="dim">외주개발 전문팀</span>
            </h1>
            <p className="cover-sub">
              Unity 게임·AR/VR부터 웹/앱 개발, 개발 강의까지.<br />
              5년 경력, 30개 이상의 프로젝트로 검증된 풀스택 외주개발팀입니다.
            </p>
          </div>

          <div className="cover-footer">
            <div className="cover-contact">
              <div>team-mate@naver.com</div>
              <div>010-5457-9141</div>
              <div>devteammate.co.kr</div>
            </div>
            <div className="cover-year">2026</div>
          </div>
        </div>

        {/* ════ 핵심 지표 ════ */}
        <div className="stats-bar">
          {[
            { v: '30+', l: '완료 프로젝트' },
            { v: '5년', l: '개발 경력' },
            { v: '100%', l: '프로젝트 성공률' },
            { v: '4명', l: '전문 개발자' },
          ].map(s => (
            <div className="stat-cell" key={s.l}>
              <div className="stat-value">{s.v}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ════ 회사 소개 ════ */}
        <div className="section">
          <p className="section-label">About</p>
          <h2 className="section-title">MATE 소개</h2>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.85, maxWidth: 600 }}>
            MATE는 <strong>Unity 게임·AR/VR</strong>, <strong>웹/앱 개발</strong>, <strong>개발 강의</strong>에 특화된
            외주개발 전문팀입니다. 2020년부터 게임 개발을 시작으로 AR·VR 시뮬레이션, 웹·모바일 앱까지 영역을 넓혀
            총 30개 이상의 프로젝트를 완수했습니다.
          </p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.85, marginTop: 12, maxWidth: 600 }}>
            단순 기능 구현을 넘어 <strong>기획·디자인·개발·배포</strong> 전 과정을 함께하는 파트너십을 지향합니다.
            납기 준수와 품질 보증을 최우선 가치로 삼아 100% 프로젝트 성공률을 유지하고 있습니다.
          </p>
        </div>

        {/* ════ 서비스 ════ */}
        <div className="section">
          <p className="section-label">Services</p>
          <h2 className="section-title">제공 서비스</h2>
          {SERVICES.map(s => (
            <div className="service-item" key={s.no}>
              <div className="service-no">{s.no}</div>
              <div style={{ flex: 1 }}>
                <div className="service-title">{s.title}</div>
                <div className="service-desc">{s.desc}</div>
                <div>{s.stack.map(t => <span className="tag-pill" key={t}>{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ════ 개발 프로세스 ════ */}
        <div className="section">
          <p className="section-label">Process</p>
          <h2 className="section-title">개발 프로세스</h2>
          <div className="process-grid">
            {PROCESS.map(p => (
              <div className="process-cell" key={p.step}>
                <div className="process-arrow" />
                <div className="process-step-num">{p.step}</div>
                <div className="process-step-title">{p.title}</div>
                <div className="process-step-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ 팀 구성 ════ */}
        <div className="section page-break-before">
          <p className="section-label">Team</p>
          <h2 className="section-title">팀 구성</h2>
          <div className="team-grid">
            {TEAM.map(m => (
              <div className="team-card" key={m.name}>
                <div className="team-avatar">{m.name[0]}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-skills">{m.skills}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ 수상 및 전시 ════ */}
        <div className="section">
          <p className="section-label">Awards &amp; Exhibitions</p>
          <h2 className="section-title">수상 및 전시 경력</h2>
          <div className="award-grid">
            {HIGHLIGHT_AWARDS.map((a, i) => (
              <div className="award-item" key={i}>
                <div className="award-year">{a.year}</div>
                <div>
                  <div className="award-title">
                    {a.title}
                    <span className="award-rank">{a.rank}</span>
                  </div>
                  <div className="award-org">{a.org}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 14 }}>
            * G-STAR, GLC, 산학협력 EXPO, DiveXR 코엑스 등 다수 전시 참가 이력 포함
          </p>
        </div>

        {/* ════ 연락처 ════ */}
        <div className="section" style={{ background: '#f9fafb' }}>
          <p className="section-label">Contact</p>
          <h2 className="section-title">프로젝트 문의</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <div className="contact-label">이메일</div>
                <div className="contact-value">team-mate@naver.com</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <div className="contact-label">전화</div>
                <div className="contact-value">010-5457-9141</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🌐</div>
              <div>
                <div className="contact-label">웹사이트</div>
                <div className="contact-value">devteammate.co.kr</div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 28,
            padding: '14px 20px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💬</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 2 }}>카카오톡 오픈채팅으로 빠른 상담</div>
              <div style={{ fontSize: 11, color: '#3b82f6' }}>open.kakao.com/o/scVFEK3h &nbsp;·&nbsp; 평일 10:00 – 18:00 실시간 응대</div>
            </div>
          </div>

          {/* 하단 브랜딩 */}
          <div style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Image src="/images/logo.png" alt="MATE" width={80} height={24}
              style={{ height: 20, width: 'auto', filter: 'invert(1)', opacity: 0.25 }} />
            <span style={{ fontSize: 10, color: '#d1d5db' }}>© 2026 MATE. All rights reserved.</span>
          </div>
        </div>

      </div>
    </>
  );
}
