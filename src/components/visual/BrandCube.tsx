'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, type MotionValue,
} from 'framer-motion';

/**
 * 첫 화면 가운데에서 천천히 도는 큐브. 커서로 잡아 돌릴 수 있다.
 *
 * 옆면 순서: 웹 · 앱 → 게임 · XR → 교육 · 브랜딩 → MATE 로고. 윗면과 밑면은 수평선 빛.
 * 면마다 그 영역의 실제 작업 화면을 담는다. 홈 아래쪽(영역 슬래브, 최근 작업)에 이미 쓰인
 * 그림은 고르지 않는다 - 한 화면에 같은 그림이 두 번 나오지 않게 한다.
 * 작업 화면이라 파랗게 누르지 않고 원래 색 그대로 둔다. 장식이라 스크린리더에는 숨긴다.
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
};

const SIDES: Face[] = [
  // 세종호이스트크레인 홈페이지 - 고객사가 게재를 허락했다 (2026-10-16)
  { side: 'front', no: '01', label: '웹 · 앱', en: 'Web & App', tone: 'blue',
    img: '/images/projects/세종호이스트크레인.webp', focus: '50% 30%' },
  // VR 중고차 구매 가이드 - 포스터의 VR 장면 칸이 보이도록 아래쪽을 잡는다
  { side: 'right', no: '02', label: '게임 · XR', en: 'Game & XR', tone: 'dark',
    img: '/images/projects/VR 중고차 구매 가이드.webp', focus: '50% 54%' },
  // ITLand - 저소득층 아동을 위한 VR 코딩 교육 프로그램
  { side: 'back', no: '03', label: '교육 · 브랜딩', en: 'Education & Branding', tone: 'light',
    img: '/images/projects/햄부기.webp', focus: '50% 62%' },
];

export default function BrandCube({ spin }: { spin?: MotionValue<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const visible = useInView(wrapRef);
  const rotY = useMotionValue(0);
  const rotX = useMotionValue(TILT);
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
      {/* 잡을 수 있는 자리 - 큐브가 돌면 그림자가 한 변보다 넓어지므로 둘레까지 넓혀 둔다 */}
      <span className="cube-hit" />
      <div className="cube-stage">
        <motion.div className="cube-tilt" style={{ rotateX: rotX }}>
          <motion.div className="cube-scroll" style={spin ? { rotateY: spin } : undefined}>
            <motion.div className="cube-spin" style={{ rotateY: rotY }}>
              {SIDES.map((f, i) => (
                <div key={f.side} className={`cube-face cube-face--${f.side} cube-tone--${f.tone}`}>
                  <span className="cube-meta">
                    <span>{f.no}</span>
                    <span className="cube-dot" />
                  </span>
                  <span className="cube-media">
                    <Image src={f.img} alt="" fill priority={i === 0} sizes="440px" draggable={false}
                      className="object-cover" style={{ objectPosition: f.focus }} />
                  </span>
                  <span className="cube-caption">
                    <span className="cube-label">{f.label}</span>
                    <span className="cube-meta">{f.en}</span>
                  </span>
                </div>
              ))}

              {/* 넷째 옆면 - 수평선 빛 위의 로고 */}
              <div className="cube-face cube-face--left cube-tone--dark">
                <span className="cube-meta"><span>04</span><span className="cube-dot" /></span>
                <span className="cube-media cube-media--glow">
                  <Image src="/images/logo.png" alt="" width={1991} height={493} draggable={false}
                    className="relative h-auto w-[62%] brightness-0 invert" />
                </span>
                <span className="cube-caption">
                  <span className="cube-label">MATE</span>
                  <span className="cube-meta">devteammate.co.kr</span>
                </span>
              </div>

              {/* 윗면 · 밑면 - 수평선 빛 */}
              <div className="cube-face cube-face--top cube-tone--glow" />
              <div className="cube-face cube-face--bottom cube-tone--glow" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {/* 바닥의 파란 그림자 - 큐브가 떠오를 때 작아지고 내려앉을 때 커진다 */}
      <div className="cube-shadow" />
    </div>
  );
}
