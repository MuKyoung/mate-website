'use client';

import { useEffect, useRef, useState } from 'react';
import type { Member } from './types';
import { MemberAvatar, Modal, tmBtn, tmBtnPrimary, tmGhostBtn, tmGhostDanger } from './ui';

/*
 * 프로필 사진 - 고르기 · 자르기 · 줄이기는 모두 브라우저에서 한다.
 *
 * 요금을 거의 쓰지 않게:
 *   · 256px 정사각 WebP(못 만드는 브라우저는 JPEG)로 줄여 올린다 - 사진 한 장 10~20KB.
 *     아바타는 화면에서 가장 커도 72px 라 3배 화면(216px)에도 넉넉하다.
 *   · Supabase 이미지 변환(유료)도, Vercel 이미지 최적화(next/image)도 거치지 않는다.
 *     올리기는 브라우저 → Supabase 저장소로 바로 가고 Vercel 서버를 지나지 않는다.
 *   · 파일 이름이 늘 새것이라 1년 캐시를 건다 - 한 번 받은 사진은 다시 받지 않는다(team.ts setAvatar).
 */

const OUT = 256;
/** 자르기 틀의 한 변(px) */
const VIEW = 256;
const ZOOM_MAX = 4;
/** 고를 수 있는 원본 크기 - 휴대폰 사진은 10MB 안팎 */
const PICK_MAX = 30 * 1024 * 1024;

export function PhotoField({ member, size = 72, onSave }: {
  member: Member;
  size?: number;
  /** null = 지운다. 실패하면 화면에 보일 문구 */
  onSave(photo: Blob | null): Promise<string | null>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<{ busy?: 'save' | 'remove'; ok?: string; err?: string }>({});

  const pick = (f: File | undefined) => {
    if (input.current) input.current.value = '';
    if (!f) return;
    if (f.type && !f.type.startsWith('image/')) return setState({ err: '그림 파일을 골라 주세요.' });
    if (f.size > PICK_MAX) return setState({ err: '30MB 넘는 파일은 열 수 없습니다.' });
    setState({});
    setFile(f);
  };

  const save = async (photo: Blob | null) => {
    setState({ busy: photo ? 'save' : 'remove' });
    const err = await onSave(photo);
    setState(err ? { err } : { ok: photo ? '사진을 바꿨습니다.' : '사진을 지웠습니다.' });
    return err;
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <MemberAvatar id={member.id} initial={member.initial} photo={member.avatar} size={size} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" className={tmGhostBtn} disabled={!!state.busy} onClick={() => input.current?.click()}>
            {state.busy === 'save' ? '올리는 중…' : member.avatar ? '사진 바꾸기' : '사진 올리기'}
          </button>
          {member.avatar && (
            <button type="button" className={tmGhostDanger} disabled={!!state.busy} onClick={() => void save(null)}>
              {state.busy === 'remove' ? '지우는 중…' : '사진 지우기'}
            </button>
          )}
        </div>
        {state.err ? (
          <p role="alert" className="text-[13.5px] font-semibold text-tm-red-deep">{state.err}</p>
        ) : state.ok ? (
          <p className="text-[13.5px] font-semibold text-tm-ok-deep">{state.ok}</p>
        ) : (
          <p className="text-[13px] text-tm-sub">JPG · PNG · WebP. 정사각형으로 잘라 작게 줄여 올립니다.</p>
        )}
      </div>
      {file && (
        <CropDialog
          file={file}
          onCancel={() => setFile(null)}
          onError={(err) => { setFile(null); setState({ err }); }}
          onDone={async (blob) => {
            const err = await save(blob);
            if (!err) setFile(null);
            return err;
          }}
        />
      )}
    </div>
  );
}

/* ── 자르기 창 ─────────────────────────────────────────── */

type View = { zoom: number; x: number; y: number };

function CropDialog({ file, onCancel, onError, onDone }: {
  file: File;
  onCancel(): void;
  onError(err: string): void;
  /** 실패하면 문구 - 창은 열어 둔다 */
  onDone(photo: Blob): Promise<string | null>;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const img = useRef<HTMLImageElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  /** 휠 · 끌기 리스너가 읽는 원본 크기 */
  const natRef = useRef(nat);
  natRef.current = nat;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /** 화면 1px 에 원본 몇 px 이 드는지의 역수 - zoom 1 이면 짧은 변이 틀을 꽉 채운다 */
  const scaleOf = (n: { w: number; h: number }, zoom: number) => (VIEW / Math.min(n.w, n.h)) * zoom;

  /** 그림이 늘 틀을 덮게 자리를 묶는다 */
  const clamp = (v: View, n: { w: number; h: number }): View => {
    const zoom = Math.min(ZOOM_MAX, Math.max(1, v.zoom));
    const k = scaleOf(n, zoom);
    return {
      zoom,
      x: Math.min(0, Math.max(VIEW - n.w * k, v.x)),
      y: Math.min(0, Math.max(VIEW - n.h * k, v.y)),
    };
  };

  const onLoad = () => {
    const el = img.current;
    if (!el?.naturalWidth || !el.naturalHeight) return onError('이 사진은 열 수 없습니다. JPG · PNG 로 올려 주세요.');
    const n = { w: el.naturalWidth, h: el.naturalHeight };
    const k = scaleOf(n, 1);
    setNat(n);
    // 가운데를 맞춰 연다
    setView({ zoom: 1, x: (VIEW - n.w * k) / 2, y: (VIEW - n.h * k) / 2 });
  };

  // 빠르게 끌면 한 번 그리는 사이에 여러 번 불린다 - 늘 직전 값에서 잇는다
  const move = (dx: number, dy: number) => {
    const n = natRef.current;
    if (n) setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }, n));
  };

  /** 틀의 (cx, cy) 를 그 자리에 둔 채 확대한다. next 는 지금 배율 → 새 배율 */
  const zoomWith = (next: (zoom: number) => number, cx = VIEW / 2, cy = VIEW / 2) => {
    const n = natRef.current;
    if (!n) return;
    setView((v) => {
      const z = Math.min(ZOOM_MAX, Math.max(1, next(v.zoom)));
      const r = z / v.zoom;
      return clamp({ zoom: z, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }, n);
    });
  };

  // 휠은 기본 동작(창 스크롤)을 막아야 해서 passive 가 아닌 리스너로 단다
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      const f = Math.exp(-e.deltaY / 400);
      zoomWith((z) => z * f, e.clientX - box.left, e.clientY - box.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // zoomWith 는 natRef 와 setView 만 쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ps = pointers.current;
    const prev = ps.get(e.pointerId);
    if (!prev) return;
    if (ps.size === 1) {
      move(e.clientX - prev.x, e.clientY - prev.y);
    } else if (ps.size === 2) {
      // 두 손가락 - 벌린 만큼 확대, 두 손가락 가운데를 기준으로
      const other = [...ps.entries()].find(([id]) => id !== e.pointerId)?.[1];
      if (other) {
        const before = Math.hypot(prev.x - other.x, prev.y - other.y);
        const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        const box = e.currentTarget.getBoundingClientRect();
        if (before > 0) {
          zoomWith((z) => z * (after / before), (e.clientX + other.x) / 2 - box.left, (e.clientY + other.y) / 2 - box.top);
        }
      }
    }
    ps.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 32 : 8;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(step, 0),
      ArrowRight: () => move(-step, 0),
      ArrowUp: () => move(0, step),
      ArrowDown: () => move(0, -step),
      '+': () => zoomWith((z) => z * 1.1),
      '=': () => zoomWith((z) => z * 1.1),
      '-': () => zoomWith((z) => z / 1.1),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  const apply = async () => {
    const el = img.current;
    if (!el || !nat) return;
    setBusy(true);
    setErr(null);
    try {
      const k = scaleOf(nat, view.zoom);
      const blob = await cropToBlob(el, -view.x / k, -view.y / k, VIEW / k);
      const e = await onDone(blob);
      if (e) setErr(e);
    } catch {
      setErr('사진을 줄이지 못했습니다. 다른 사진으로 해 주세요.');
    }
    setBusy(false);
  };

  const k = nat ? scaleOf(nat, view.zoom) : 0;

  return (
    <Modal
      title="사진 자르기"
      sub="끌어서 자리를, 휠 · 두 손가락 · 막대로 크기를 맞춥니다"
      size="sm"
      busy={busy}
      onClose={onCancel}
      foot={
        <>
          {err && <p role="alert" className="w-full text-[13.5px] font-semibold text-tm-red-deep">{err}</p>}
          <span className="flex-1" />
          <button type="button" className={tmBtn} disabled={busy} onClick={onCancel}>취소</button>
          <button type="button" className={tmBtnPrimary} disabled={busy || !nat} onClick={() => void apply()}>
            {busy ? '올리는 중…' : '이대로 쓰기'}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div
          ref={frame}
          role="group"
          aria-label="사진 자리 - 화살표 키로 옮기고 + · - 로 크기를 바꿉니다"
          tabIndex={0}
          className="relative cursor-grab touch-none select-none overflow-hidden rounded-tm-sm bg-tm-bg outline-none
            focus-visible:shadow-[0_0_0_3px_rgba(38,68,203,0.35)] active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={img}
              src={src}
              alt=""
              draggable={false}
              onLoad={onLoad}
              onError={() => onError('이 사진은 열 수 없습니다. JPG · PNG 로 올려 주세요.')}
              className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
              style={nat
                ? { width: nat.w * k, height: nat.h * k, transform: `translate(${view.x}px, ${view.y}px)` }
                : { visibility: 'hidden' }}
            />
          )}
          {/* 아바타로 보일 동그라미 - 바깥은 어둡게 */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_200px_rgba(15,26,41,0.5)]" />
        </div>
        <label className="flex w-full max-w-[256px] items-center gap-3 text-[13.5px] font-semibold text-tm-sub">
          <span className="flex-none">크기</span>
          <input
            type="range" min={1} max={ZOOM_MAX} step={0.01} value={view.zoom} disabled={!nat}
            onChange={(e) => { const z = Number(e.target.value); zoomWith(() => z); }}
            className="h-11 min-w-0 flex-1 accent-tm-blue"
          />
        </label>
      </div>
    </Modal>
  );
}

/* ── 줄이기 ──────────────────────────────────────────── */

function canvasOf(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return [c, ctx];
}

function toBlob(c: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((res) => c.toBlob(res, type, quality));
}

/**
 * 원본의 (sx, sy) 에서 한 변 ss 인 정사각형을 OUT px 로 줄인다.
 * 한 번에 크게 줄이면 계단이 지므로 반씩 여러 번 줄인다. 투명한 곳은 흰색으로 채운다.
 * WebP 를 못 만드는 브라우저(예전 Safari)는 JPEG 로.
 */
async function cropToBlob(src: HTMLImageElement, sx: number, sy: number, ss: number): Promise<Blob> {
  let from: CanvasImageSource = src;
  let x = sx;
  let y = sy;
  let s = ss;
  while (s / 2 >= OUT * 1.5) {
    const half = Math.round(s / 2);
    const [c, ctx] = canvasOf(half);
    ctx.drawImage(from, x, y, s, s, 0, 0, half, half);
    from = c;
    x = 0;
    y = 0;
    s = half;
  }
  const [out, ctx] = canvasOf(OUT);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, OUT, OUT);
  ctx.drawImage(from, x, y, s, s, 0, 0, OUT, OUT);
  const webp = await toBlob(out, 'image/webp', 0.82);
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await toBlob(out, 'image/jpeg', 0.86);
  if (!jpeg) throw new Error('encode');
  return jpeg;
}
