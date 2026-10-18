import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';

/**
 * 웹사이트 화면 캡처를 담는 브라우저 틀. 주소줄에 실제 주소를 적는다.
 * 캡처는 원래 색 그대로 둔다 - 작업 결과물이다.
 */
export default function BrowserFrame({
  src,
  alt,
  url,
  className = '',
}: {
  src: string | undefined;
  alt: string;
  url: string;
  className?: string;
}) {
  return (
    <div className={`border border-white/15 bg-[#0b0c0f] ${className}`}>
      <div className="flex h-9 items-center gap-3 border-b border-white/10 px-3.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 bg-white/20" />
          <span className="h-2 w-2 bg-white/20" />
          <span className="h-2 w-2 bg-white/20" />
        </span>
        <span className="truncate font-mono text-[11px] tracking-[0.02em] text-white/50">{url}</span>
      </div>
      <div className="relative aspect-[16/10]">
        <SafeImage src={src} alt={alt} fill className="absolute inset-0" placeholder={<ThumbFallback />} />
      </div>
    </div>
  );
}
