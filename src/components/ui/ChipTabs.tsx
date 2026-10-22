'use client';

export interface ChipTab {
  key: string;
  label: string;
  count?: number;
}

interface ChipTabsProps {
  tabs: ChipTab[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

/**
 * 분류 칩 줄 - 고른 칩만 로고 파랑으로 찬다. 칩 끝에 건수를 등폭 숫자로 붙인다.
 * 좁은 화면에서는 가로로 밀린다.
 */
export default function ChipTabs({ tabs, active, onSelect, className = '' }: ChipTabsProps) {
  return (
    <div className={`no-scrollbar flex gap-1.5 overflow-x-auto ${className}`}>
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button key={t.key} type="button" aria-pressed={on} onClick={() => onSelect(t.key)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] border px-4 text-[14px] transition-colors duration-200 ${
              on
                ? 'border-point-200 bg-point-200 font-semibold text-white'
                : 'border-line bg-white text-ink-2 hover:border-point-200 hover:text-point-200'
            }`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`font-mono text-[11px] tabular-nums ${on ? 'text-white/75' : 'text-ink-3'}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
