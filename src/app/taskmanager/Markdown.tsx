'use client';

import React from 'react';

/**
 * 문서 본문 렌더러.
 *
 * 외부 마크다운 라이브러리를 쓰지 않는다. 결과를 HTML 문자열로 만들지 않고
 * React 엘리먼트로 바로 세우므로 dangerouslySetInnerHTML 이 아예 없고,
 * 따라서 본문에 스크립트가 섞여도 실행되지 않는다.
 *
 * 지원 범위 — 제목, 목록, 체크박스, 인용(패널), 표, 코드 블록, 구분선,
 * 인라인 굵게/기울임/코드/링크.
 */

export interface Heading {
  level: number;
  text: string;
  id: string;
}

/** 제목 텍스트를 앵커 id 로 — 한글을 그대로 쓰되 공백만 정리한다 */
export function slug(text: string, i: number): string {
  const base = text.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '');
  return `h-${i}-${base.slice(0, 40) || 'section'}`;
}

export function extractHeadings(src: string): Heading[] {
  const out: Heading[] = [];
  let fence = false;
  src.split('\n').forEach((line, i) => {
    if (line.trimStart().startsWith('```')) { fence = !fence; return; }
    if (fence) return;
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) out.push({ level: m[1].length, text: m[2].trim(), id: slug(m[2], i) });
  });
  return out;
}

/* ── 인라인 ───────────────────────────────────────── */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    const k = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={k} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={k} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.88em] text-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={k} className="italic">{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = link[2];
      // javascript: 같은 스킴은 링크로 만들지 않는다
      const safe = /^(https?:|mailto:|#|\/)/i.test(href);
      return safe ? (
        <a key={k} href={href} className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {link[1]}
        </a>
      ) : <span key={k}>{link[1]}</span>;
    }
    return <React.Fragment key={k}>{part}</React.Fragment>;
  });
}

/* ── 블록 ─────────────────────────────────────────── */

export default function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;

  const H = ['', 'text-[22px] mt-8 mb-3', 'text-[17px] mt-7 mb-2.5', 'text-[15px] mt-6 mb-2', 'text-[13.5px] mt-5 mb-1.5'];

  while (i < lines.length) {
    const line = lines[i];

    // 코드 블록
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) { buf.push(lines[i]); i += 1; }
      i += 1;
      out.push(
        <pre key={`c${i}`} className="my-4 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3.5">
          {lang && <span className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">{lang}</span>}
          <code className="font-mono text-[12.5px] leading-[1.7] text-slate-700">{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // 제목
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const Tag = (`h${Math.min(level + 1, 6)}`) as keyof JSX.IntrinsicElements;
      out.push(
        <Tag key={`h${i}`} id={slug(h[2], i)}
          className={`scroll-mt-20 font-semibold tracking-tight text-slate-900 ${H[level]} ${
            level === 1 ? 'border-b border-slate-200 pb-2' : ''}`}>
          {inline(h[2].trim(), `h${i}`)}
        </Tag>,
      );
      i += 1;
      continue;
    }

    // 구분선
    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={`r${i}`} className="my-6 border-slate-200" />);
      i += 1;
      continue;
    }

    // 표 — 헤더 + 구분행이 있어야 표로 본다
    if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { body.push(cells(lines[i])); i += 1; }
      out.push(
        <div key={`t${i}`} className="my-4 overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50">
                {head.map((c, n) => (
                  <th key={n} className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                    {inline(c, `th${i}-${n}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="border-b border-slate-100 last:border-0">
                  {head.map((_, n) => (
                    <td key={n} className="px-3 py-2 align-top text-slate-700">
                      {inline(row[n] ?? '', `td${i}-${r}-${n}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // 인용 — Confluence 의 정보 패널처럼 세운다
    if (line.trimStart().startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      out.push(
        <blockquote key={`q${i}`}
          className="my-4 rounded-r-md border-l-[3px] border-blue-400 bg-blue-50/60 px-4 py-3 text-[13.5px] leading-[1.75] text-slate-700">
          {buf.map((b, n) => <p key={n} className={n ? 'mt-1.5' : ''}>{inline(b, `q${i}-${n}`)}</p>)}
        </blockquote>,
      );
      continue;
    }

    // 목록 (체크박스 포함)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i += 1;
      }
      const Tag = ordered ? 'ol' : 'ul';
      out.push(
        <Tag key={`l${i}`} className={`my-3 space-y-1.5 pl-5 text-[13.5px] leading-[1.75] text-slate-700 ${
          ordered ? 'list-decimal' : 'list-disc'} marker:text-slate-400`}>
          {items.map((it, n) => {
            const box = /^\[([ xX])\]\s*(.*)$/.exec(it);
            if (box) {
              const checked = box[1].toLowerCase() === 'x';
              return (
                <li key={n} className="list-none -ml-5 flex items-start gap-2">
                  <span className={`mt-[3px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] border ${
                    checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                    {checked && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={checked ? 'text-slate-400 line-through' : ''}>{inline(box[2], `li${i}-${n}`)}</span>
                </li>
              );
            }
            return <li key={n}>{inline(it, `li${i}-${n}`)}</li>;
          })}
        </Tag>,
      );
      continue;
    }

    // 빈 줄
    if (!line.trim()) { i += 1; continue; }

    // 문단 — 다음 빈 줄까지 묶는다
    const buf: string[] = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^(#{1,4}\s|\s*>|\s*([-*]|\d+\.)\s|---+$)/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('```') && !lines[i].trim().startsWith('|')
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    if (buf.length) {
      out.push(
        <p key={`p${i}`} className="my-3 text-[13.5px] leading-[1.8] text-slate-700">
          {inline(buf.join(' '), `p${i}`)}
        </p>,
      );
    }
  }

  if (out.length === 0) {
    return <p className="py-10 text-center text-[13px] text-slate-400">내용이 비어 있습니다. 편집을 눌러 작성하세요.</p>;
  }
  return <>{out}</>;
}
