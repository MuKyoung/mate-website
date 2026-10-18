import type { CSSProperties } from 'react';

/**
 * 수평선처럼 휘는 파란 빛.
 *
 * 아주 큰 원의 가장자리만 부모 안에 걸리게 둔다. 부모는 position 이 있고
 * overflow-hidden 이어야 한다. 색 단계와 입자는 globals.css `.glow-horizon` 에 있다.
 *
 * - side 'top'    : 원이 위에 있고, 흰빛 가장자리가 아래로 휘어 내려온다 (첫 화면)
 * - side 'bottom' : 원이 아래에서 떠오른다. 안쪽으로 갈수록 밝다 (페이지 마무리)
 * - radius        : 원의 반지름. 클수록 띠가 평평해진다
 * - rim           : 가장자리 가운데가 지나는 높이 (부모 기준)
 */
export default function HorizonGlow({
  side = 'top',
  radius = 'max(96vw, 760px)',
  rim = '30%',
  className = '',
}: {
  side?: 'top' | 'bottom';
  radius?: string;
  rim?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`glow-horizon glow-horizon--${side} ${className}`}
      style={{ '--glow-r': radius, '--glow-rim': rim } as CSSProperties}
    />
  );
}
