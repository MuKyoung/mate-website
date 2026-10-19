'use client';

import { Fragment, isValidElement, type ReactNode, type ReactElement } from 'react';
import { motion, type Variants } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

/**
 * 제목을 낱말(또는 글자) 단위로 잘라, 하나씩 아래에서 밀려 올라오게 한다.
 *
 * 스스로 재생하지 않고 조상 motion 요소의 hidden → show 를 물려받는다
 * (SectionHead 의 h2 처럼 inView 나 onMount 를 단 요소 안에 둔다).
 * 낱말 사이는 보통 공백으로 남겨 두어 줄바꿈이 낱말 경계에서만 일어난다.
 */
export function SplitText({
  text,
  by = 'word',
  stagger,
  delay = 0,
  className = '',
}: {
  text: string;
  by?: 'word' | 'char';
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const parts = by === 'word' ? text.split(' ') : Array.from(text);
  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger ?? (by === 'word' ? 0.07 : 0.045), delayChildren: delay } },
  };
  const piece: Variants = {
    hidden: { y: '108%' },
    show: { y: '0%', transition: { duration: 0.95, ease: easeEnter } },
  };
  return (
    <motion.span variants={group} className={className}>
      {parts.map((p, i) => (
        <Fragment key={i}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
            <motion.span variants={piece} className="inline-block">{p}</motion.span>
          </span>
          {by === 'word' && i < parts.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </motion.span>
  );
}

/** <>최근 작업</> 처럼 글자만 든 노드에서 글자를 꺼낸다. 다른 요소가 섞여 있으면 null */
export function plainText(node: ReactNode): string | null {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    const parts = node.map(plainText);
    return parts.every((p) => p !== null) ? parts.join('') : null;
  }
  if (isValidElement(node) && (node as ReactElement).type === Fragment) {
    return plainText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return null;
}
