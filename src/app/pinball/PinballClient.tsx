'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBomb, FaCheck, FaMap, FaMoon, FaPlay, FaShuffle, FaSun, FaTrophy, FaVideo } from 'react-icons/fa6';
import type { Roulette } from './engine/roulette';
import { parseName } from './engine/utils';

/**
 * 사내 내기용 핀볼. lazygyu/roulette (MIT) 의 index.html 설정 창과 그 스크립트를 React 로 옮겼다.
 * 엔진(./engine)은 캔버스를 직접 다루므로, 이 컴포넌트는 입력값을 읽어 엔진에 넘기는 일만 한다.
 */

type WinnerType = 'first' | 'last' | 'custom' | 'multi';
type MapItem = { index: number; title: string };

const NAMES_KEY = 'mate.pinball.names';
const MAP_KEY = 'mate.pinball.map';
const DEFAULT_NAMES = '수박*2,키위*2,귤*2';

function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 저장소를 막은 브라우저에서는 기억만 못 한다
  }
}

function getNames(value: string) {
  return value
    .trim()
    .split(/[,\r\n]/g)
    .map((v) => v.trim())
    .filter((v) => !!v);
}

/** 같은 이름(가중치까지 같은)을 하나로 묶어 '이름*개수' 로 적는다 */
function mergeNames(names: string[]) {
  const counts = new Map<string, number>();
  for (const source of names) {
    const parsed = parseName(source);
    if (!parsed) continue;
    const key = parsed.weight > 1 ? `${parsed.name}/${parsed.weight}` : parsed.name;
    counts.set(key, (counts.get(key) ?? 0) + parsed.count);
  }
  return Array.from(counts, ([key, count]) => (count > 1 ? `${key}*${count}` : key)).join(',');
}

const btn =
  'relative inline-flex items-center gap-1 rounded-[5px] bg-[#222] px-2.5 py-[5px] text-[13px] text-[#fefefe] active:brightness-50';
const icon = 'inline-block h-[25px] w-[25px] shrink-0 align-middle';
const rowIcon = `${icon} max-[750px]:h-[15px] max-[750px]:w-[15px]`;
const row =
  'flex h-[35px] items-center max-[750px]:block max-[750px]:h-auto max-[750px]:border-b max-[750px]:border-[#555] max-[750px]:py-2';
const rowLabel =
  'flex w-[150px] shrink-0 grow-0 items-center gap-1 pl-4 text-white max-[750px]:mb-2 max-[750px]:w-full max-[750px]:pl-0';
const group = 'flex min-w-0 flex-1 basis-0';
const groupItem =
  'flex h-[25px] min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden border-none p-0 text-[13px] text-[#fefefe] first:rounded-l-[10px] last:rounded-r-[10px]';

function Switch({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-block h-[25px] w-[50px] shrink-0 rounded-[25px] align-middle ${
        checked ? 'bg-[#00baff]' : 'bg-[#999]'
      }`}
    >
      <span
        className={`absolute left-0 top-0 h-[25px] w-[25px] rounded-[25px] transition-transform duration-200 ${
          checked ? 'translate-x-full bg-white' : 'bg-[#ccc]'
        }`}
      />
    </button>
  );
}

function GroupButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`${groupItem} ${active ? 'bg-[#333]' : 'bg-[#999]'}`}>
      {active && <FaCheck className="mr-0.5 h-[13px] w-[13px] shrink-0" />}
      {children}
    </button>
  );
}

export default function PinballClient() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Roulette | null>(null);
  const namesRef = useRef<HTMLTextAreaElement>(null);
  const rankRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  /** 구슬이 준비됐는지. 한 판이 끝나면 섞거나 이름을 고쳐야 다시 시작할 수 있다 (원본과 같다) */
  const readyRef = useRef(false);
  const winnerTypeRef = useRef<WinnerType>('first');

  const [loaded, setLoaded] = useState(false);
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [mapIndex, setMapIndex] = useState(0);
  const [winnerType, setWinnerType] = useState<WinnerType>('first');
  const [recording, setRecording] = useState(false);
  const [skills, setSkills] = useState(true);
  const [dark, setDark] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, msg }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 1200);
  }, []);

  // 구슬 수가 바뀔 때마다 다시 부른다. 범위는 엔진이 구슬 수에 맞춰 자르고, 잘린 값을 칸에 되돌려 쓴다.
  // edited 는 방금 고친 범위 칸
  const applyWinnerSetting = useCallback((edited?: 'start' | 'end') => {
    const game = gameRef.current;
    const rankInput = rankRef.current;
    const startInput = startRef.current;
    const endInput = endRef.current;
    if (!game || !rankInput || !startInput || !endInput) return;

    const type = winnerTypeRef.current;
    let start: number;
    let end: number;
    switch (type) {
      case 'first':
        start = end = 1;
        break;
      case 'last':
        start = end = game.getCount();
        break;
      case 'multi':
        start = parseInt(startInput.value, 10) || 1;
        end = parseInt(endInput.value, 10) || 1;
        // 뒤집힌 범위는 방금 고친 쪽을 존중하고 반대쪽을 따라오게 한다
        if (end < start) {
          if (edited === 'end') {
            start = end;
          } else {
            end = start;
          }
        }
        break;
      default:
        start = end = parseInt(rankInput.value, 10) || 1;
    }

    game.setWinnerRange(start - 1, end - 1);
    const clipped = game.getWinnerRange();
    // 범위 칸은 여러 명일 때만 고친다. 다른 방식이 덮어쓰면 넣어 둔 범위가 날아간다
    if (type === 'multi') {
      startInput.value = String(clipped.start + 1);
      endInput.value = String(clipped.end + 1);
    } else {
      rankInput.value = String(clipped.start + 1);
    }
  }, []);

  const selectWinnerType = useCallback(
    (type: WinnerType, edited?: 'start' | 'end') => {
      winnerTypeRef.current = type;
      setWinnerType(type);
      applyWinnerSetting(edited);
    },
    [applyWinnerSetting]
  );

  const getReady = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const names = getNames(namesRef.current?.value ?? '');
    game.setMarbles(names);
    readyRef.current = names.length > 0;
    save(NAMES_KEY, names.join(','));
    applyWinnerSetting();
  }, [applyWinnerSetting]);

  useEffect(() => {
    let disposed = false;
    let showTimer = 0;
    let game: Roulette | null = null;

    import('./engine/roulette').then(({ Roulette }) => {
      if (disposed || !hostRef.current) return;
      game = new Roulette(hostRef.current, {
        onGoal: () => {
          readyRef.current = false;
          showTimer = window.setTimeout(() => setHidden(false), 3000);
        },
        onMessage: toast,
      });
      gameRef.current = game;

      // ?names=가,나,다 로 연 주소가 저장해 둔 이름보다 먼저다
      const fromUrl = new URLSearchParams(window.location.search).get('names');
      const names = fromUrl ? fromUrl.replace(/,/g, '\n') : load(NAMES_KEY);
      if (names && namesRef.current) namesRef.current.value = names;

      const list = game.getMaps();
      const savedMap = Number(load(MAP_KEY));
      if (Number.isInteger(savedMap) && savedMap > 0 && savedMap < list.length) {
        game.setMap(savedMap);
        setMapIndex(savedMap);
      }
      setMaps(list);
      getReady();
      setLoaded(true);
    });

    return () => {
      disposed = true;
      window.clearTimeout(showTimer);
      game?.destroy();
      gameRef.current = null;
    };
  }, [getReady, toast]);

  useEffect(() => {
    gameRef.current?.setAutoRecording(recording);
  }, [recording, loaded]);

  useEffect(() => {
    gameRef.current?.setUseSkills(skills);
  }, [skills, loaded]);

  useEffect(() => {
    gameRef.current?.setTheme(dark ? 'dark' : 'light');
  }, [dark, loaded]);

  // 숫자 칸은 원본처럼 값이 확정될 때(change)만 반영한다. 입력할 때마다 반영하면 칸을 비울 수가 없다
  useEffect(() => {
    const bindings: [HTMLInputElement | null, () => void][] = [
      [rankRef.current, () => selectWinnerType('custom')],
      [startRef.current, () => selectWinnerType('multi', 'start')],
      [endRef.current, () => selectWinnerType('multi', 'end')],
    ];
    bindings.forEach(([input, handler]) => input?.addEventListener('change', handler));
    return () => bindings.forEach(([input, handler]) => input?.removeEventListener('change', handler));
  }, [selectWinnerType]);

  const onNamesBlur = () => {
    const input = namesRef.current;
    if (!input) return;
    const merged = mergeNames(getNames(input.value));
    if (input.value !== merged) {
      input.value = merged;
      getReady();
    }
  };

  const onStart = () => {
    const game = gameRef.current;
    if (!game || !readyRef.current) return;
    setHidden(true);
    game.start();
  };

  const onMapChange = (index: number) => {
    const game = gameRef.current;
    if (!game) return;
    game.setMap(index);
    setMapIndex(index);
    save(MAP_KEY, String(index));
    // 맵을 바꾸면 남은 구슬로 다시 만들어 골인한 구슬과 가중치가 빠지므로 이름 칸에서 다시 채운다
    getReady();
  };

  return (
    <div className={`fixed inset-0 overflow-hidden ${dark ? 'bg-black' : 'bg-[#eee]'}`}>
      <h1 className="sr-only">MATE 핀볼</h1>
      {/* 엔진이 캔버스를 붙이는 자리. React 가 그리는 요소와 섞이지 않게 비워 둔다 */}
      <div ref={hostRef} />

      <div
        className={`fixed bottom-4 left-4 z-[999] flex min-w-[50%] rounded-[10px] bg-[#666] p-2.5 transition-opacity duration-1000 ease-linear max-[750px]:bottom-[60px] max-[750px]:block max-[750px]:w-[calc(100%-2rem)] max-[750px]:min-w-0 max-[750px]:max-w-full max-[750px]:overflow-hidden ${
          hidden ? 'invisible opacity-0' : 'visible opacity-100'
        }`}
      >
        <div className="order-2 shrink-0 grow-0">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`${btn} mb-1.5 hidden w-full justify-center text-[11pt] max-[750px]:flex`}
          >
            설정
            <i className="not-italic">{collapsed ? '▲' : '▼'}</i>
          </button>

          <div className={collapsed ? 'max-[750px]:hidden' : undefined}>
            <div className={row}>
              <label htmlFor="pinball-map" className={rowLabel}>
                <FaMap className={rowIcon} />
                <span>맵</span>
              </label>
              <select
                id="pinball-map"
                value={mapIndex}
                onChange={(e) => onMapChange(Number(e.target.value))}
                className="h-[25px] w-full min-w-0 flex-1 basis-0 rounded-[5px] bg-[#999] text-[13px] text-black"
              >
                {maps.map((map) => (
                  <option key={map.index} value={map.index}>
                    {map.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${row} max-[750px]:flex max-[750px]:flex-wrap`}>
              <div className="flex w-1/2 items-center max-[750px]:flex-col max-[750px]:items-start">
                <label htmlFor="pinball-recording" className={`${rowLabel} max-[750px]:mb-[0.3rem]`}>
                  <FaVideo className={rowIcon} />
                  <span>녹화</span>
                </label>
                <Switch id="pinball-recording" checked={recording} onChange={setRecording} />
                <span className="w-[63px] shrink-0 max-[750px]:hidden" />
              </div>
              <div className="flex w-1/2 items-center max-[750px]:flex-col max-[750px]:items-start">
                <label htmlFor="pinball-skills" className={`${rowLabel} max-[750px]:mb-[0.3rem]`}>
                  <FaBomb className={rowIcon} />
                  <span>스킬 활성화</span>
                </label>
                <Switch id="pinball-skills" checked={skills} onChange={setSkills} />
                <span className="w-[63px] shrink-0 max-[750px]:hidden" />
              </div>
            </div>

            <div className={row}>
              <span className={rowLabel}>
                <FaTrophy className={rowIcon} />
                <span>당첨 순위</span>
              </span>
              <div className={group}>
                <GroupButton active={winnerType === 'first'} onClick={() => selectWinnerType('first')}>
                  첫 번째
                </GroupButton>
                <GroupButton active={winnerType === 'last'} onClick={() => selectWinnerType('last')}>
                  마지막
                </GroupButton>
                <input
                  ref={rankRef}
                  type="number"
                  min={1}
                  defaultValue={1}
                  aria-label="당첨 순위"
                  className={`${groupItem} w-0 text-center ${winnerType === 'custom' ? 'bg-[#333]' : 'bg-[#999]'}`}
                />
                <GroupButton active={winnerType === 'multi'} onClick={() => selectWinnerType('multi')}>
                  여러 명
                </GroupButton>
              </div>
            </div>

            <div
              className={`${row} ${winnerType === 'multi' ? 'pl-[150px] max-[750px]:flex max-[750px]:pl-0' : '!hidden'}`}
            >
              <div className={group}>
                <input
                  ref={startRef}
                  type="number"
                  min={1}
                  defaultValue={1}
                  aria-label="당첨 범위 시작"
                  className={`${groupItem} w-0 bg-[#999] text-center`}
                />
                <span className="flex h-[25px] shrink-0 grow-0 basis-6 items-center justify-center text-white">~</span>
                <input
                  ref={endRef}
                  type="number"
                  min={1}
                  defaultValue={3}
                  aria-label="당첨 범위 끝"
                  className={`${groupItem} w-0 bg-[#999] text-center`}
                />
              </div>
            </div>

            <div className={`${row} max-[750px]:!hidden`}>
              <div className="flex grow items-center justify-end gap-1 text-white">
                <FaSun className={icon} />
                <Switch id="pinball-dark" checked={dark} onChange={setDark} label="어두운 화면" />
                <FaMoon className={icon} />
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 min-w-0 shrink grow">
          <h3 className="m-0 p-0 text-[12pt] font-bold text-[#fefefe]">이름들을 입력하세요</h3>
          <textarea
            ref={namesRef}
            defaultValue={DEFAULT_NAMES}
            onChange={getReady}
            onBlur={onNamesBlur}
            placeholder="이름들을 쉼표나 엔터로 구분해서 넣어주세요"
            aria-label="참가자 이름"
            className="block min-h-[calc(5rem+35px)] w-full border-none bg-[#999] p-0.5 text-[14pt] text-black max-[750px]:min-h-[2.5rem] max-[750px]:text-[11pt]"
          />
          <div className="mt-0.5 flex items-center gap-[2px]">
            <div className="grow" />
            <button type="button" onClick={getReady} className={btn}>
              <FaShuffle className={icon} />
              <span>섞기</span>
            </button>
            <button type="button" onClick={onStart} className={btn}>
              <FaPlay className={icon} />
              <span>시작</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: '-50%', y: '100%' }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, x: '-50%', y: '100%' }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className="fixed bottom-2.5 left-1/2 z-[1000] overflow-hidden rounded bg-[#ccc] p-2 text-black"
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>

      <div
        className={`fixed bottom-0 left-1/2 z-[999] w-[90%] -translate-x-1/2 text-center text-[12px] ${
          dark ? 'text-white' : 'text-black'
        }`}
      >
        원작{' '}
        <a href="https://github.com/lazygyu/roulette" target="_blank" rel="noopener noreferrer" className="underline">
          Marble Roulette by lazygyu
        </a>{' '}
        (MIT License)
      </div>
    </div>
  );
}
