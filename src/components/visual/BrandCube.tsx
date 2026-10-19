'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, type MotionValue,
} from 'framer-motion';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { games } from '@/data/games';

/**
 * 첫 화면 가운데에서 천천히 도는 큐브. 커서로 잡아 돌릴 수 있다.
 *
 * 옆면 넷은 MATE 가 하는 네 가지 일이다 (사용자가 정한 묶음, 2026-10-19):
 *   01 웹 · 앱 · 브랜딩 / 02 게임 · XR / 03 교육 · 강의 / 04 검증된 자체 제작 · 퍼블리싱
 * 윗면과 밑면은 MATE 로고.
 *
 * 그림은 각 영역의 실제 작업 화면이다. 게임 · XR 과 교육 · 강의는 아래 영역 슬래브와 같은
 * 그림을 쓴다 (교육은 사용자가 '강의하고 있는 이미지'를 골랐고, 공개할 수 있는 강의 사진은
 * 그 한 장뿐이다). 슬래브에서는 파랗게 눌러 배경으로 깔고, 큐브에서는 원래 색 그대로 보여 준다.
 * 자체 게임은 두 타이틀 다 제작 중이라 공개할 화면이 없다. 영역 슬래브의 Original Games 처럼
 * 블록 모자이크 위에 타이틀 이름만 적는다 - 외주 작업 그림을 자체 제작처럼 보이게 하지 않는다.
 * 장식이라 스크린리더에는 숨긴다.
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
  { side: 'front', no: '01', label: '웹 · 앱 · 브랜딩', en: 'Web, App & Branding', tone: 'blue',
    img: '/images/projects/세종호이스트크레인.webp', focus: '50% 30%' },
  // 꼬꼬지생 - 타이틀 글자가 들어오도록 아래쪽을 잡는다
  { side: 'right', no: '02', label: '게임 · XR', en: 'Game & XR', tone: 'dark',
    img: '/images/projects/꼬꼬지생.webp', focus: '50% 80%' },
  // 미래산업과학고 정규 수업 - 강사가 화면 앞에서 설명하는 장면
  { side: 'back', no: '03', label: '교육 · 강의', en: 'Education & Lectures', tone: 'light',
    img: '/images/projects/미래산업과학고.webp', focus: '50% 58%' },
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
      {/* 잡을 수 있는 자리 - 큐브가 돌면 한 변보다 넓게 보이므로 둘레까지 넓혀 둔다 */}
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

              {/* 넷째 옆면 - 자체 제작 · 퍼블리싱. 공개할 화면이 아직 없어 타이틀 이름만 적는다 */}
              <div className="cube-face cube-face--left cube-tone--dark">
                <span className="cube-meta"><span>04</span><span className="cube-dot" /></span>
                <span className="cube-media">
                  <BlockMosaic seed={17} rows={8} className="absolute inset-0" />
                  <span className="cube-originals">
                    {games.map((g) => (
                      <span key={g.id} className="cube-originals-row">
                        <span>{g.title}</span>
                        <span>{g.status}</span>
                      </span>
                    ))}
                  </span>
                </span>
                <span className="cube-caption">
                  <span className="cube-label">검증된<br />자체 제작 · 퍼블리싱</span>
                  <span className="cube-meta">Originals &amp; Publishing</span>
                </span>
              </div>

              {/* 윗면 · 밑면 - MATE 로고 */}
              {(['top', 'bottom'] as const).map((side) => (
                <div key={side} className={`cube-face cube-face--${side} cube-face--cap cube-tone--glow`}>
                  <Image src="/images/logo.png" alt="" width={1991} height={493} draggable={false}
                    className="relative h-auto w-[64%] brightness-0 invert" />
                </div>
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
