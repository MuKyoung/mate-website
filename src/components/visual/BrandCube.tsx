'use client';

import { Fragment, useRef } from 'react';
import Image from 'next/image';
import {
  motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useTransform,
  type MotionStyle, type MotionValue,
} from 'framer-motion';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { games } from '@/data/games';
import { ongoing, type OngoingWork } from '@/data/ongoing';

/**
 * 첫 화면 가운데에서 천천히 도는 큐브. 커서로 잡아 돌릴 수 있다.
 *
 * 옆면 넷은 MATE 가 하는 네 가지 일이다 (사용자가 정한 묶음, 2026-10-19):
 *   01 웹 · 앱 · 브랜딩 / 02 게임 · XR / 03 교육 · 강의 / 04 검증된 자체 제작 · 퍼블리싱
 * 윗면과 밑면은 MATE 로고.
 *
 * 그림은 각 영역의 실제 작업 화면이고 면을 꽉 채운다 (원래 색 그대로).
 * 게임 · XR 은 사용자가 ITLand 를 골랐다. 교육 · 강의는 사용자가 '강의하고 있는 이미지'를
 * 골랐는데, 공개할 수 있는 강의 사진은 그 한 장뿐이라 아래 교육 슬래브 배경과 같은 사진이다.
 * 자체 게임은 두 타이틀 다 제작 중이라 공개할 화면이 없다. 영역 슬래브의 Original Games 처럼
 * 블록 모자이크 위에 타이틀 이름만 적는다 - 외주 작업 그림을 자체 제작처럼 보이게 하지 않는다.
 * 장식이라 스크린리더에는 숨긴다.
 *
 * 유리 연출 - 두 겹으로 만든다.
 *   안쪽은 그림 큐브(.cube-face), 바깥은 두께(--d)만큼 떠 있는 유리 껍데기(.cube-shell).
 *   번호 칩과 이름판은 유리 위에 있어, 큐브가 돌면 그림과 다른 깊이에서 어긋나며 움직인다.
 *   유리 모서리는 두께 있는 유리처럼 가장자리가 빛나고, 비스듬히 볼수록 더 많이 비추며(프레넬),
 *   반사광 한 줄이 회전을 따라 미끄러진다. 안쪽 그림은 정면에서 돌아설수록 어두워진다.
 *   (globals.css .cube-shell / .shell-fresnel / .cube-glare / .cube-light, --ry · --fa)
 *
 * 움직임
 * - 가만히 두면 28초에 한 바퀴 돈다. 커서를 올리면 천천히 멈춘다
 * - 가로로 끌면 돌고, 세로로 끌면 기운다. 기울기는 놓으면 원래 자리로 돌아온다
 * - 세게 던지면 그 속도로 이어 돌다가 차츰 원래 속도로 돌아온다
 * - 터치 화면에서는 가로로 밀어 돌린다. 세로로 밀면 페이지가 그대로 내려간다 (touch-action: pan-y)
 *
 * 회전은 세 겹으로 나눈다. 바깥 - 기울기(rotX), 가운데 - 스크롤이 더하는 회전(spin),
 * 안쪽 - 저절로 도는 회전과 끌어서 돌린 회전(rotY). 기울기를 바깥에 두어야 화면 기준으로
 * 기울어, 큐브가 어느 쪽을 보고 있든 위아래로 끄는 방향과 기우는 방향이 맞는다.
 * 크기와 모양은 globals.css 의 .cube-* 에 있다.
 */

const TILT = -18;            // 기본 기울기 - 위에서 살짝 내려다본다
const AUTO = -360 / 28;      // 저절로 도는 속도 (도/초) - 28초에 한 바퀴
const DRAG_Y = 0.42;         // 가로로 1px 끌 때 도는 각도
const DRAG_X = 0.32;         // 세로로 1px 끌 때 기우는 각도
const TILT_MIN = -78;        // 거의 위에서 내려다볼 때까지
const TILT_MAX = 28;         // 밑면이 살짝 보일 때까지
const MAX_FLICK = 900;       // 던졌을 때 이어지는 회전 속도의 상한 (도/초)

type Face = {
  side: 'front' | 'right' | 'back';
  no: string;
  label: string;
  en: string;
  tone: 'blue' | 'dark' | 'light';
  img: string;
  /** 그림에서 보여 줄 부분 (object-position) */
  focus: string;
  /** 이름판 위에 적는 진행 중인 일 (src/data/ongoing.ts) */
  work: OngoingWork[];
};

const SIDES: Face[] = [
  // 세종호이스트크레인 홈페이지 - 고객사가 게재를 허락했다 (2026-10-16). 첫 화면 문구와 걸린 보가 들어오게
  { side: 'front', no: '01', label: '웹 · 앱 · 브랜딩', en: 'Web, App & Branding', tone: 'blue',
    img: '/images/projects/세종호이스트크레인.webp', focus: '25% 50%', work: ongoing.web },
  // ITLand - 저소득층 아동을 위한 VR 코딩 교육 프로그램 (사용자 지정, 2026-10-19)
  { side: 'right', no: '02', label: '게임 · XR', en: 'Game & XR', tone: 'dark',
    img: '/images/projects/햄부기.webp', focus: '50% 50%', work: ongoing.game },
  // 미래산업과학고 정규 수업 - 화면과 그 앞에서 설명하는 강사가 들어오게
  { side: 'back', no: '03', label: '교육 · 강의', en: 'Education & Lectures', tone: 'light',
    img: '/images/projects/미래산업과학고.webp', focus: '73% 50%', work: ongoing.edu },
];

export default function BrandCube({ spin }: { spin?: MotionValue<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const visible = useInView(wrapRef);
  const rotY = useMotionValue(0);
  const rotX = useMotionValue(TILT);
  // 반사광이 쓰는 전체 회전각 - 저절로 · 끌어서 돈 만큼과 스크롤이 더한 만큼을 합친다
  const noSpin = useMotionValue(0);
  const ry = useTransform([rotY, spin ?? noSpin], ([a, b]: number[]) => `${a + b}deg`);
  // 매 프레임 바뀌는 값이라 상태(state)가 아니라 ref 에 둔다 - 다시 그리지 않는다
  const st = useRef({
    dragging: false,
    hover: false,
    vel: AUTO,
    lastX: 0,
    lastY: 0,
    samples: [] as { t: number; y: number }[],
  });

  useAnimationFrame((_, delta) => {
    const s = st.current;
    if (!visible || s.dragging) return;
    const dt = Math.min(delta, 64) / 1000;
    // 커서가 올라와 있거나 '동작 줄이기' 설정이면 멈추는 쪽으로, 아니면 원래 속도로
    const target = s.hover || reduce ? 0 : AUTO;
    s.vel += (target - s.vel) * (1 - Math.exp(-dt * (reduce ? 6 : 1.8)));
    rotY.set(rotY.get() + s.vel * dt);
    const x = rotX.get();
    if (Math.abs(x - TILT) > 0.01) rotX.set(x + (TILT - x) * (1 - Math.exp(-dt * 3)));
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const s = st.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.samples = [{ t: performance.now(), y: rotY.get() }];
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.dragging = 'true';
    // 끄는 동안 글자가 선택되지 않게 한다 (터치는 막지 않는다 - 세로 스크롤이 살아 있어야 한다)
    if (e.pointerType === 'mouse') e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    rotY.set(rotY.get() + dx * DRAG_Y);
    // 터치는 세로 움직임을 스크롤에 넘기므로 기울이지 않는다
    if (e.pointerType !== 'touch') {
      rotX.set(Math.min(TILT_MAX, Math.max(TILT_MIN, rotX.get() - dy * DRAG_X)));
    }
    const now = performance.now();
    s.samples.push({ t: now, y: rotY.get() });
    while (s.samples.length > 2 && now - s.samples[0].t > 90) s.samples.shift();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    delete e.currentTarget.dataset.dragging;
    const first = s.samples[0];
    const last = s.samples[s.samples.length - 1];
    const span = (last.t - first.t) / 1000;
    const v = span > 0.008 ? (last.y - first.y) / span : 0;
    // 끌다가 멈춘 채로 놓았다면 던지지 않는다
    const held = performance.now() - last.t > 120;
    s.vel = held ? 0 : Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
  };

  const setHover = (on: boolean) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') st.current.hover = on;
  };

  return (
    <div ref={wrapRef} className="cube-wrap" aria-hidden
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={setHover(true)}
      onPointerLeave={setHover(false)}>
      {/* 잡을 수 있는 자리 - 큐브가 돌면 한 변보다 넓게 보이므로 둘레까지 넓혀 둔다 */}
      <span className="cube-hit" />
      <div className="cube-stage">
        <motion.div className="cube-tilt" style={{ rotateX: rotX }}>
          <motion.div className="cube-scroll" style={spin ? { rotateY: spin } : undefined}>
            <motion.div className="cube-spin" style={{ rotateY: rotY, '--ry': ry } as unknown as MotionStyle}>
              {SIDES.map((f, i) => (
                <Fragment key={f.side}>
                  {/* 안쪽 - 그림 */}
                  <div className={`cube-face cube-face--${f.side}`}>
                    <Image src={f.img} alt="" fill priority={i === 0} sizes="440px" draggable={false}
                      className="cube-bg object-cover" style={{ objectPosition: f.focus }} />
                    <span className="cube-shade" />
                    <span className="cube-light" />
                  </div>
                  {/* 바깥 - 유리와 그 위의 글자 */}
                  <div className={`cube-shell cube-shell--${f.side} cube-tone--${f.tone}`}>
                    <span className="shell-fresnel" />
                    <span className="cube-top">
                      <span className="cube-chip cube-glass">{f.no}</span>
                      <span className="cube-dot" />
                    </span>
                    <span className="cube-caption cube-glass">
                      {f.work.length > 0 && (
                        <span className="cube-list">
                          {f.work.map((w) => (
                            <span key={w.title} className="cube-list-row">
                              <span>{w.title}</span>
                              <span>{w.status}</span>
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="cube-label">{f.label}</span>
                      <span className="cube-meta">{f.en}</span>
                    </span>
                    <span className="cube-glare" />
                  </div>
                </Fragment>
              ))}

              {/* 넷째 옆면 - 자체 제작 · 퍼블리싱. 공개할 화면이 아직 없어 타이틀 이름만 적는다 */}
              <div className="cube-face cube-face--left">
                <span className="cube-bg"><BlockMosaic seed={17} rows={9} className="absolute inset-0" /></span>
                <span className="cube-shade" />
                <span className="cube-light" />
              </div>
              <div className="cube-shell cube-shell--left cube-tone--dark">
                <span className="shell-fresnel" />
                <span className="cube-top">
                  <span className="cube-chip cube-glass">04</span>
                  <span className="cube-dot" />
                </span>
                <span className="cube-caption cube-glass">
                  <span className="cube-list">
                    {games.map((g) => (
                      <span key={g.id} className="cube-list-row">
                        <span>{g.title}</span>
                        <span>{g.status}</span>
                      </span>
                    ))}
                  </span>
                  <span className="cube-label">검증된<br />자체 제작 · 퍼블리싱</span>
                  <span className="cube-meta">Originals &amp; Publishing</span>
                </span>
                <span className="cube-glare" />
              </div>

              {/* 윗면 · 밑면 - 안쪽은 MATE 로고, 바깥은 유리 */}
              {(['top', 'bottom'] as const).map((side) => (
                <Fragment key={side}>
                  <div className={`cube-face cube-face--${side} cube-face--cap cube-tone--glow`}>
                    <Image src="/images/logo.png" alt="" width={1991} height={493} draggable={false}
                      className="relative h-auto w-[64%] brightness-0 invert" />
                  </div>
                  <div className={`cube-shell cube-shell--${side} cube-shell--cap`} />
                </Fragment>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {/* 바닥의 파란 그림자 - 큐브가 떠오를 때 작아지고 내려앉을 때 커진다 */}
      <div className="cube-shadow" />
    </div>
  );
}
