// lazygyu/roulette (MIT, ./LICENSE) 의 roulette.ts.
// 원본은 EventTarget 으로 'goal', 'message' 를 알리는데, 화면(PinballClient)이 넘긴 콜백을 부르게 바꿨다.
// 광고, 맵 공유마당, 진행도 디버그 그림은 뺐고, 화면을 떠날 때 정리하는 destroy 를 더했다.
import { Camera } from './camera';
import { canvasHeight, canvasWidth, initialZoom, options, Skills, type ThemeName, Themes, zoomThreshold } from './constants';
import { ParticleManager, SkillEffect, zoomZoneIntensity } from './effects';
import { FastForwarder, Minimap, RankRenderer } from './hud';
import { type StageDef, stages } from './maps';
import { Marble } from './marble';
import { Physics } from './physics';
import { ProgressMap } from './progressMap';
import { VideoRecorder } from './recorder';
import { RouletteRenderer } from './renderer';
import type { ColorTheme, GameObject, MouseEventHandlerName, MouseEventName, UIObject, WinnerRange } from './types';
import { parseName, shuffle } from './utils';

/** 입력 범위를 실제 구슬 수에 맞춰 자른다. 범위를 넘기면 뒤쪽이 잘린다 */
function clipWinnerRange({ start, end }: WinnerRange, marbleCount: number): WinnerRange {
  const last = Math.max(0, marbleCount - 1);
  const clippedStart = Math.min(Math.max(0, start), last);
  return { start: clippedStart, end: Math.min(Math.max(clippedStart, end), last) };
}

/**
 * 순위 흔들림 줄이기. 구슬마다 순위 값(결승까지 남은 거리) 을 이 시간(초) 동안 부드럽게 따라가고,
 * 앞 구슬보다 RANK_MARGIN 넘게 앞서야 자리를 바꾼다
 */
const RANK_EMA_SEC = 0.4;
const RANK_MARGIN = 0.25;

export type RouletteEvents = {
  /** 당첨자가 모두 정해졌을 때. 당첨 순위 순서의 이름 */
  onGoal?: (winners: string[]) => void;
  /** 화면 아래에 잠깐 띄울 알림 */
  onMessage?: (msg: string) => void;
};

export class Roulette {
  private _marbles: Marble[] = [];

  private _lastTime: number = 0;
  private _elapsed: number = 0;

  private _updateInterval = 10;
  private _timeScale = 1;

  private _winners: Marble[] = [];
  private _particleManager = new ParticleManager();
  private _stage: StageDef = stages[0];

  private _camera: Camera = new Camera();
  private _renderer = new RouletteRenderer();

  private _effects: GameObject[] = [];

  private _winnerRange: WinnerRange = { start: 0, end: 0 };
  private _goalDist: number = Infinity;
  /** 연출 구역이 있는 맵에서 커트라인을 다투는 두 구슬 중 센 쪽의 연출 강도 (0 ~ 1). 구역이 없으면 null 이고 zoomY 로 판단한다 */
  private _zoomIntensity: number | null = null;
  /** 연출이 _targetIndex 구슬이 아니라 _rivalIndex 구슬 때문에 걸렸는지 */
  private _focusOnRival = false;
  /** 구슬별 평활화한 순위 값 (결승까지 남은 거리) */
  private _rankKeys = new Map<Marble, number>();
  private _isRunning: boolean = false;
  /** 진행 중에는 null, 당첨자가 모두 확정되면 당첨자 배열 */
  private _result: Marble[] | null = null;

  // 구슬 id(= order)는 매 라운드 재사용된다. 리셋 시 취소하지 않으면 이 타이머가
  // 뒤늦게 발화해 같은 id를 가진 새 라운드의 구슬을 지워버린다
  private _pendingRemovals: number[] = [];

  private _uiObjects: UIObject[] = [];

  private _autoRecording: boolean = false;
  private _recorder: VideoRecorder;
  private _recorderStopTimer = 0;

  private physics = new Physics();

  private fastForwarder = new FastForwarder();
  private _theme: ColorTheme = Themes.dark;

  private _frame = 0;
  /** destroy 때 떼어 낼 이벤트 */
  private _listeners: (() => void)[] = [];

  constructor(
    container: HTMLElement,
    private readonly events: RouletteEvents = {}
  ) {
    this._renderer.init(container);
    this._recorder = new VideoRecorder(this._renderer.canvas);

    this.addUiObject(new RankRenderer());
    this.attachEvent();
    const minimap = new Minimap();
    minimap.onViewportChange((pos) => {
      if (pos) {
        this._camera.setPosition(pos, false);
        this._camera.lock(true);
      } else {
        this._camera.lock(false);
      }
    });
    this.addUiObject(minimap);
    this.addUiObject(this.fastForwarder);
    this._loadMap();
    this._frame = window.requestAnimationFrame(this._update);
  }

  /** 화면을 떠날 때 루프, 타이머, 이벤트, 캔버스를 모두 정리한다 */
  public destroy() {
    window.cancelAnimationFrame(this._frame);
    this._pendingRemovals.forEach((id) => window.clearTimeout(id));
    this._pendingRemovals = [];
    window.clearTimeout(this._recorderStopTimer);
    this._recorder.discard();
    this._listeners.forEach((off) => off());
    this._listeners = [];
    this._renderer.destroy();
  }

  private listen<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Window,
    type: K,
    handler: (e: HTMLElementEventMap[K]) => void
  ) {
    target.addEventListener(type, handler as EventListener);
    this._listeners.push(() => target.removeEventListener(type, handler as EventListener));
  }

  private addUiObject(obj: UIObject) {
    this._uiObjects.push(obj);
    if (obj.onWheel) {
      this.listen(this._renderer.canvas, 'wheel', obj.onWheel);
    }
    if (obj.onMessage) {
      obj.onMessage((msg) => this.events.onMessage?.(msg));
    }
  }

  private _update = () => {
    if (!this._lastTime) this._lastTime = Date.now();
    const currentTime = Date.now();

    this._elapsed += (currentTime - this._lastTime) * this.fastForwarder.speed;
    if (this._elapsed > 100) {
      this._elapsed %= 100;
    }
    this._lastTime = currentTime;

    // _timeScale 은 _updateMarbles 에서 갱신되지만 물리 스텝 크기는 이 프레임 시작값으로 고정된다.
    // 구슬 정지 판정도 같은 값을 써야 실제 진행된 물리 시간과 맞는다
    const timeScale = this._timeScale;
    const interval = (this._updateInterval / 1000) * timeScale;

    let simSeconds = 0;
    while (this._elapsed >= this._updateInterval) {
      simSeconds += interval;
      this.physics.step(interval);
      this._updateMarbles(this._updateInterval, timeScale);
      this._particleManager.update(this._updateInterval);
      this._updateEffects(this._updateInterval);
      this._elapsed -= this._updateInterval;
      this._uiObjects.forEach((obj) => obj.update(this._updateInterval));
    }

    if (this._marbles.length > 1) {
      this._sortMarbles(simSeconds);
    }

    const cameraTargetIndex = this._winners.length > 0 ? this._targetIndex : 0;
    this._camera.update({
      marbles: this._marbles,
      stage: this._stage,
      intensity: this._zoomIntensity ?? Math.max(0, 1 - this._goalDist / zoomThreshold),
      targetIndex: cameraTargetIndex,
      // 첫 골인 전에는 카메라가 커트라인 대신 선두를 따라가므로 커트라인 쪽 판단을 넘기지 않는다
      focusOnRival: cameraTargetIndex === this._targetIndex && this._focusOnRival,
      viewSize: { x: this._renderer.width / initialZoom, y: this._renderer.height / initialZoom },
    });

    this._render();
    this._frame = window.requestAnimationFrame(this._update);
  };

  /**
   * 순위대로 정렬한다. 순위 값은 진행도 지도의 "결승까지 남은 거리" (progressMap.ts).
   * dt = 이번 프레임에 진행된 물리 시간(초)
   */
  private _sortMarbles(dt: number) {
    const map = ProgressMap.for(this._stage);

    /** 지난 프레임 기록이 있는 구슬 수. 구슬을 새로 넣은 직후면 0 */
    let known = 0;
    const alpha = 1 - Math.exp(-dt / RANK_EMA_SEC);
    const keys = new Map<Marble, number>();
    for (const m of this._marbles) {
      const raw = map.distanceAt(m.x, m.y);
      const prev = this._rankKeys.get(m);
      if (prev !== undefined) known++;
      keys.set(m, prev !== undefined ? prev + (raw - prev) * alpha : raw);
    }
    this._rankKeys = keys;

    // 구슬을 막 넣었을 때는 지난 순서가 없으니 그냥 정렬한다
    if (known < this._marbles.length / 2) {
      this._marbles.sort((a, b) => keys.get(a)! - keys.get(b)! || b.y - a.y);
      return;
    }
    // 지난 프레임 순서에서 출발해, 앞 구슬보다 RANK_MARGIN 넘게 앞설 때만 앞으로 보낸다 (여유를 둔 삽입 정렬)
    const list = this._marbles;
    for (let i = 1; i < list.length; i++) {
      const m = list[i];
      const k = keys.get(m)! + RANK_MARGIN;
      let j = i;
      while (j > 0 && k < keys.get(list[j - 1])!) {
        list[j] = list[j - 1];
        j--;
      }
      list[j] = m;
    }
  }

  private _updateMarbles(deltaTime: number, timeScale: number) {
    const stage = this._stage;

    for (let i = 0; i < this._marbles.length; i++) {
      const marble = this._marbles[i];
      marble.update(deltaTime, timeScale);
      if (marble.skill === Skills.Impact) {
        this._effects.push(new SkillEffect(marble.x, marble.y));
        this.physics.impact(marble.id);
      }
      if (marble.y > stage.goalY) {
        this._winners.push(marble);
        if (this._isRunning && this._isWinningRank(this._winners.length - 1)) {
          this._particleManager.shot(this._renderer.width, this._renderer.height);
        }
        this._pendingRemovals.push(
          window.setTimeout(() => {
            this.physics.removeMarble(marble.id);
          }, 500)
        );
      }
    }

    // 연출(줌인, 슬로모션) 은 커트라인을 다투는 두 구슬 중 연출이 더 센 쪽을 기준으로 건다.
    // 예: 꼴찌를 뽑을 때는 바로 앞 구슬이 골인하는 순간 꼴찌가 정해진다
    const zones = stage.zoomZones?.length ? stage.zoomZones : null;
    const intensityOf = (m: Marble) =>
      zones ? zoomZoneIntensity(zones, m.x, m.y) : Math.max(0, 1 - Math.abs(stage.zoomY - m.y) / zoomThreshold);
    const target = this._marbles[this._targetIndex];
    const rival = this._marbles[this._rivalIndex];
    this._focusOnRival = !!target && !!rival && intensityOf(rival) > intensityOf(target);
    const focus = this._focusOnRival ? rival : target;
    this._goalDist = Math.abs(stage.zoomY - (focus ? focus.y : 0));
    this._zoomIntensity = zones ? (focus ? intensityOf(focus) : 0) : null;
    this._timeScale = this._calcTimeScale();

    this._marbles = this._marbles.filter((marble) => marble.y <= stage.goalY);

    this._checkFinish();
  }

  /** 카메라와 슬로우모션이 주목할 구슬 = 당첨 커트라인에 걸쳐있는 구슬 */
  private get _targetIndex() {
    return this._winnerRange.end - this._winners.length;
  }

  /** 커트라인을 두고 _targetIndex 구슬과 다투는 구슬 = 바로 뒤, 없으면 바로 앞 구슬 */
  private get _rivalIndex() {
    const i = this._targetIndex;
    return this._marbles[i + 1] ? i + 1 : i - 1;
  }

  private _isWinningRank(rank: number) {
    return rank >= this._winnerRange.start && rank <= this._winnerRange.end;
  }

  private _checkFinish() {
    if (!this._isRunning) return;
    const { start, end } = this._winnerRange;

    // 남은 구슬이 1개면 그 등수는 골인하지 않아도 확정된다. 2개 이상 남았다면 그들 사이의
    // 순위는 물리로만 정해지므로 예측하지 않는다 (당첨 범위 안에서도 순위는 의미를 가진다)
    const early = this._winners.length > 0 && this._marbles.length === 1;
    const ranked = early ? [...this._winners, this._marbles[0]] : this._winners;
    if (ranked.length <= end) return;

    if (early && this._isWinningRank(this._winners.length)) {
      this._particleManager.shot(this._renderer.width, this._renderer.height);
    }

    this._result = ranked.slice(start, end + 1);
    this._isRunning = false;
    this.events.onGoal?.(this._result.map((m) => m.name));
    this._recorderStopTimer = window.setTimeout(() => {
      this._recorder.stop();
    }, 1000);
  }

  private _calcTimeScale(): number {
    const targetIndex = this._targetIndex;
    // 연출 구역: 커트라인 구슬이 구역 가운데로 갈수록 느려진다. 경쟁하는 구슬이 있을 때만
    if (this._zoomIntensity !== null) {
      if (
        this._winners.length < this._winnerRange.end + 1 &&
        this._zoomIntensity > 0 &&
        (this._marbles[targetIndex - 1] || this._marbles[targetIndex + 1])
      ) {
        return Math.max(0.2, 1 - this._zoomIntensity);
      }
      return 1;
    }
    if (this._winners.length < this._winnerRange.end + 1 && this._goalDist < zoomThreshold) {
      if (
        this._marbles[this._focusOnRival ? this._rivalIndex : targetIndex].y >
          this._stage.zoomY - zoomThreshold * 1.2 &&
        (this._marbles[targetIndex - 1] || this._marbles[targetIndex + 1])
      ) {
        return Math.max(0.2, this._goalDist / zoomThreshold);
      }
    }
    return 1;
  }

  private _updateEffects(deltaTime: number) {
    this._effects.forEach((effect) => effect.update(deltaTime));
    this._effects = this._effects.filter((effect) => !effect.isDestroy);
  }

  private _render() {
    const renderParams = {
      camera: this._camera,
      stage: this._stage,
      entities: this.physics.getEntities(),
      marbles: this._marbles,
      winners: this._winners,
      particleManager: this._particleManager,
      effects: this._effects,
      winnerRange: this._winnerRange,
      result: this._result,
      size: { x: this._renderer.width, y: this._renderer.height },
      theme: this._theme,
    };
    this._renderer.render(renderParams, this._uiObjects);
  }

  private mouseHandler(eventName: MouseEventName, e: MouseEvent) {
    const handlerName = `on${eventName}` as MouseEventHandlerName;

    const sizeFactor = this._renderer.sizeFactor;
    const pos = { x: e.offsetX * sizeFactor, y: e.offsetY * sizeFactor };
    this._uiObjects.forEach((obj) => {
      const handler = obj[handlerName]?.bind(obj);
      if (!handler) return;
      const bounds = obj.getBoundingBox();
      if (!bounds) {
        handler({ ...pos, button: e.button });
      } else if (
        pos.x >= bounds.x &&
        pos.y >= bounds.y &&
        pos.x <= bounds.x + bounds.w &&
        pos.y <= bounds.y + bounds.h
      ) {
        handler({ x: pos.x - bounds.x, y: pos.y - bounds.y, button: e.button });
      } else {
        handler(undefined);
      }
    });
  }

  private attachEvent() {
    const canvas = this._renderer.canvas;
    const offRelease = () => {
      window.removeEventListener('pointerup', onPointerRelease);
      window.removeEventListener('pointercancel', onPointerRelease);
    };
    const onPointerRelease = (e: PointerEvent) => {
      this.mouseHandler('MouseUp', e);
      offRelease();
    };
    this._listeners.push(offRelease);

    this.listen(canvas, 'pointerdown', (e) => {
      this.mouseHandler('MouseDown', e);
      window.addEventListener('pointerup', onPointerRelease);
      window.addEventListener('pointercancel', onPointerRelease);
    });
    this.listen(canvas, 'pointermove', (e) => {
      this.mouseHandler('MouseMove', e);
      canvas.style.cursor = this.resultCloseHitAt(e) ? 'pointer' : '';
    });
    this.listen(canvas, 'dblclick', (e) => this.mouseHandler('DblClick', e));
    this.listen(canvas, 'contextmenu', (e) => e.preventDefault());
    this.listen(canvas, 'click', (e) => {
      if (this.resultCloseHitAt(e)) {
        this._renderer.closeResultPopup();
      }
    });
  }

  private resultCloseHitAt(e: MouseEvent): boolean {
    const sizeFactor = this._renderer.sizeFactor;
    return this._renderer.getResultCloseHitAt(e.offsetX * sizeFactor, e.offsetY * sizeFactor);
  }

  private _loadMap() {
    this.physics.createStage(this._stage);
    this._camera.initializePosition();
  }

  public clearMarbles() {
    this._pendingRemovals.forEach((id) => window.clearTimeout(id));
    this._pendingRemovals = [];
    this.physics.clearMarbles();
    this._result = null;
    this._winners = [];
    this._marbles = [];
  }

  public start() {
    this._isRunning = true;
    this._winnerRange = clipWinnerRange(options.winnerRange, this._marbles.length);
    this._camera.startFollowingMarbles();

    const go = () => {
      this.physics.start();
      this._marbles.forEach((marble) => (marble.isActive = true));
    };
    if (this._autoRecording) {
      this._recorder.start().then(go, (e) => {
        console.error('recording failed to start', e);
        go();
      });
    } else {
      go();
    }
  }

  public setTheme(themeName: ThemeName) {
    this._theme = Themes[themeName];
  }

  public setUseSkills(value: boolean) {
    options.useSkills = value;
  }

  public setWinnerRange(start: number, end: number) {
    options.winnerRange = { start, end };
    this._winnerRange = clipWinnerRange(options.winnerRange, this._marbles.length);
  }

  /** 실제 구슬 수에 맞춰 잘린 범위 (0-based, 양끝 포함) */
  public getWinnerRange(): WinnerRange {
    return { ...this._winnerRange };
  }

  public setAutoRecording(value: boolean) {
    this._autoRecording = value;
  }

  public setMarbles(names: string[]) {
    this.reset();
    const arr = names.slice();

    let maxWeight = -Infinity;
    let minWeight = Infinity;

    const members = arr
      .map((nameString) => {
        const result = parseName(nameString);
        if (!result) return null;
        const { name, weight, count } = result;
        if (weight > maxWeight) maxWeight = weight;
        if (weight < minWeight) minWeight = weight;
        return { name, weight, count };
      })
      .filter((member) => !!member);

    const gap = maxWeight - minWeight;

    let totalCount = 0;
    members.forEach((member) => {
      member.weight = 0.1 + (gap ? (member.weight - minWeight) / gap : 0);
      totalCount += member.count;
    });

    const orders = shuffle(
      Array(totalCount)
        .fill(0)
        .map((_, i) => i)
    );
    members.forEach((member) => {
      for (let j = 0; j < member.count; j++) {
        const order = orders.pop() || 0;
        this._marbles.push(new Marble(this.physics, order, totalCount, member.name, member.weight));
      }
    });

    // 카메라를 구슬 생성 위치 중앙으로 이동 + 줌인
    if (totalCount > 0) {
      const cols = Math.min(totalCount, 10);
      const rows = Math.ceil(totalCount / 10);
      const lineDelta = -Math.max(0, Math.ceil(rows - 5));
      const centerX = 10.25 + (cols - 1) * 0.3;
      const centerY = (1 + rows) / 2 + lineDelta;

      const spawnWidth = Math.max((cols - 1) * 0.6, 1);
      const spawnHeight = Math.max(rows - 1, 1);
      const margin = 3;
      const viewW = canvasWidth / initialZoom;
      const viewH = canvasHeight / initialZoom;
      const zoom = Math.max(
        1.5,
        Math.min(Math.min(viewW / (spawnWidth + margin * 2), viewH / (spawnHeight + margin * 2)), 3)
      );

      this._camera.initializePosition({ x: centerX, y: centerY }, zoom);
    }
  }

  private _clearMap() {
    this.physics.clear();
    this._marbles = [];
  }

  public reset() {
    this.clearMarbles();
    this._clearMap();
    this._loadMap();
    this._goalDist = Infinity;
    this._focusOnRival = false;
  }

  public getCount() {
    return this._marbles.length;
  }

  public getMaps() {
    return stages.map((stage, index) => {
      return {
        index,
        title: stage.title,
      };
    });
  }

  public setMap(index: number) {
    const stage = stages[index];
    if (!stage) {
      throw new Error('Incorrect map number');
    }
    const names = this._marbles.map((marble) => marble.name);
    this._stage = stage;
    this.setMarbles(names);
    this._camera.initializePosition();
  }
}
