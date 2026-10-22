/**
 * 썸네일이 없을 때의 대체 표시.
 *
 * 공개할 수 있는 화면이 없는 사례가 있다. 깨진 그림 대신 의도된 면으로 보이도록
 * 옅은 회색 면에 점 격자를 깔고 분류만 한 줄 얹는다.
 */
export default function ThumbFallback({ label }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: 'radial-gradient(rgba(38,68,203,0.14) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }}
    >
      {label && (
        <span className="rounded-pill bg-white px-3.5 py-1.5 text-center text-[12px] font-bold text-gray-500 shadow-float">
          {label}
        </span>
      )}
    </div>
  );
}
