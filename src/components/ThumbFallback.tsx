/**
 * 썸네일이 없을 때의 대체 표시.
 *
 * 공개할 수 있는 화면이 없는 사례가 있다. 깨진 그림 대신 의도된 면으로 보이도록
 * 어두운 면에 아주 옅은 점 격자를 깔고 분류만 등폭 글자로 한 줄 얹는다.
 */
export default function ThumbFallback({ label }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }}
    >
      {label && (
        <span className="bg-[var(--surface)] px-3 py-1 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-white/60">
          {label}
        </span>
      )}
    </div>
  );
}
