/**
 * 썸네일이 없을 때의 대체 표시.
 *
 * 깨진 이미지 아이콘 대신 의도된 면으로 보이도록, 표면 위에 아주 옅은
 * 사선 해치를 깔고 분류만 한 줄 얹는다. 그리드 안에서 빈칸처럼 읽히지 않는다.
 */
export default function ThumbFallback({ label }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 10px)',
      }}
    >
      {label && (
        <span className="px-4 text-center type-c2 font-en uppercase tracking-[0.2em] text-white/60">
          {label}
        </span>
      )}
    </div>
  );
}
