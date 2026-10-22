// lazygyu/roulette (MIT, ./LICENSE) 의 rankRenderer.ts, minimap.ts, fastForwader.ts.
import { initialZoom } from './constants';
import type { StageDef } from './maps';
import type {
  ColorTheme,
  MapEntityState,
  MouseEventArgs,
  Rect,
  RenderParameters,
  UIObject,
  VectorLike,
  WinnerRange,
} from './types';
import type { Marble } from './marble';

/** 오른쪽 위 순위표. 휠로 넘기고, 두 번 누르면 결과를 표 형식으로 복사한다 */
export class RankRenderer implements UIObject {
  private _currentY = 0;
  private _targetY = 0;
  private fontHeight = 16;
  private _userMoved = 0;
  private _currentWinner = -1;
  private maxY = 0;
  private winners: Marble[] = [];
  private marbles: Marble[] = [];
  private winnerRange: WinnerRange = { start: 0, end: 0 };
  private messageHandler?: (msg: string) => void;

  onWheel = (e: WheelEvent) => {
    this._targetY += e.deltaY;
    if (this._targetY > this.maxY) {
      this._targetY = this.maxY;
    }
    this._userMoved = 2000;
  };

  onDblClick = (e?: MouseEventArgs) => {
    if (e) {
      if (navigator.clipboard) {
        const tsv: string[] = [];
        let rank = 0;
        tsv.push(
          ...[...this.winners, ...this.marbles].map((m) => {
            rank++;
            return [rank.toString(), m.name, this.isWinningRank(rank - 1) ? '☆' : ''].join('\t');
          })
        );

        tsv.unshift(['Rank', 'Name', 'Winner'].join('\t'));

        navigator.clipboard.writeText(tsv.join('\n')).then(() => {
          if (this.messageHandler) {
            this.messageHandler('결과가 복사되었습니다');
          }
        });
      }
    }
  };

  private isWinningRank(rank: number) {
    return rank >= this.winnerRange.start && rank <= this.winnerRange.end;
  }

  onMessage(func: (msg: string) => void) {
    this.messageHandler = func;
  }

  render(
    ctx: CanvasRenderingContext2D,
    { winners, marbles, winnerRange, theme }: RenderParameters,
    width: number,
    height: number
  ) {
    const startX = width - 5;
    const startY = Math.max(-this.fontHeight, this._currentY - height / 2);
    this.maxY = Math.max(0, (marbles.length + winners.length) * this.fontHeight + this.fontHeight);
    this._currentWinner = winners.length;

    this.winners = winners;
    this.marbles = marbles;
    this.winnerRange = winnerRange;

    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '10pt sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`${winners.length} / ${winners.length + marbles.length}`, width - 5, this.fontHeight);

    ctx.beginPath();
    ctx.rect(width - 150, this.fontHeight + 2, width, this.maxY);
    ctx.clip();

    ctx.translate(0, -startY);

    if (winnerRange.end > winnerRange.start) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
      const bandY = winnerRange.start * this.fontHeight + this.fontHeight / 2;
      const bandH = (winnerRange.end - winnerRange.start + 1) * this.fontHeight;
      ctx.fillRect(width - 150, bandY, 150, bandH);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.fillRect(width - 150, bandY, 3, bandH);
    }

    ctx.font = 'bold 11pt sans-serif';
    if (theme.rankStroke) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = theme.rankStroke;
    }
    winners.forEach((marble, rank) => {
      const y = rank * this.fontHeight;
      if (y >= startY && y <= startY + ctx.canvas.height) {
        ctx.fillStyle = `hsl(${marble.hue} 100% ${theme.marbleLightness}%)`;
        const text = `${this.isWinningRank(rank) ? '☆' : '✔'} ${marble.name} #${rank + 1}`;
        ctx.strokeText(text, startX, 20 + y);
        ctx.fillText(text, startX, 20 + y);
      }
    });
    ctx.font = '10pt sans-serif';
    marbles.forEach((marble, rank) => {
      const y = (rank + winners.length) * this.fontHeight;
      if (y >= startY && y <= startY + ctx.canvas.height) {
        ctx.fillStyle = `hsl(${marble.hue} 100% ${theme.marbleLightness}%)`;
        const text = `${marble.name} #${rank + 1 + winners.length}`;
        ctx.strokeText(text, startX, 20 + y);
        ctx.fillText(text, startX, 20 + y);
      }
    });
    ctx.restore();
  }

  update(deltaTime: number) {
    if (this._currentWinner === -1) {
      return;
    }
    if (this._userMoved > 0) {
      this._userMoved -= deltaTime;
    } else {
      this._targetY = this._currentWinner * this.fontHeight + this.fontHeight;
    }
    if (this._currentY !== this._targetY) {
      this._currentY += (this._targetY - this._currentY) * (deltaTime / 250);
    }
    if (Math.abs(this._currentY - this._targetY) < 1) {
      this._currentY = this._targetY;
    }
  }

  getBoundingBox(): Rect | null {
    return null;
  }
}

/** 미니맵 최대 배율. 맵이 길거나 넓으면 이보다 작아진다 */
const MINIMAP_SCALE = 4;
/** 기본으로 보여주는 가로 범위 (기본 맵 크기) */
const MINIMAP_MIN_X = 0;
const MINIMAP_UNITS = 26;
/** 미니맵은 좌측에 세로로 긴 스트립이다. 다른 HUD가 피해가려면 이 값이 필요하다 */
export const MINIMAP_INSET = 10;
export const MINIMAP_WIDTH = MINIMAP_UNITS * MINIMAP_SCALE;

/** 왼쪽 위 미니맵. 마우스를 올린 곳으로 화면을 옮긴다 */
export class Minimap implements UIObject {
  private ctx!: CanvasRenderingContext2D;
  private lastParams: RenderParameters | null = null;

  private _onViewportChangeHandler: ((pos?: VectorLike) => void) | null = null;
  private boundingBox: Rect;
  private mousePosition: { x: number; y: number } | null = null;
  private scale = MINIMAP_SCALE;
  /** 지금 맵의 가로 범위. 맵이 바뀔 때만 다시 계산한다 */
  private rangeStage: StageDef | null = null;
  private range = { minX: MINIMAP_MIN_X, maxX: MINIMAP_MIN_X + MINIMAP_UNITS };

  constructor() {
    this.boundingBox = {
      x: MINIMAP_INSET,
      y: MINIMAP_INSET,
      w: MINIMAP_WIDTH,
      h: 0,
    };
  }

  getBoundingBox(): Rect | null {
    return this.boundingBox;
  }

  onViewportChange(callback: (pos?: VectorLike) => void) {
    this._onViewportChangeHandler = callback;
  }

  update(): void {
    // nothing to do
  }

  onMouseMove = (e?: { x: number; y: number }) => {
    if (!e) {
      this.mousePosition = null;
      if (this._onViewportChangeHandler) {
        this._onViewportChangeHandler();
      }
      return;
    }
    if (!this.lastParams) return;
    this.mousePosition = {
      x: e.x,
      y: e.y,
    };
    if (this._onViewportChangeHandler) {
      this._onViewportChangeHandler({
        x: this.mousePosition.x / this.scale + this.range.minX,
        y: this.mousePosition.y / this.scale,
      });
    }
  };

  /** 맵의 가로 범위. 기본 범위(0 ~ 26) 와 장애물이 있는 범위를 합친다 */
  private updateRange(stage: StageDef) {
    if (stage === this.rangeStage) return;
    this.rangeStage = stage;
    let minX = MINIMAP_MIN_X;
    let maxX = MINIMAP_MIN_X + MINIMAP_UNITS;
    for (const entity of stage.entities ?? []) {
      const { x } = entity.position;
      const shape = entity.shape;
      let xs: number[];
      if (shape.type === 'polyline') {
        xs = shape.points.map((p) => x + p[0]);
      } else if (shape.type === 'circle') {
        xs = [x - shape.radius, x + shape.radius];
      } else {
        const reach = Math.hypot(shape.width, shape.height);
        xs = [x - reach, x + reach];
      }
      for (const v of xs) {
        if (!Number.isFinite(v)) continue;
        minX = Math.min(minX, v);
        maxX = Math.max(maxX, v);
      }
    }
    this.range = { minX: Math.floor(minX), maxX: Math.ceil(maxX) };
  }

  render(ctx: CanvasRenderingContext2D, params: RenderParameters, _width: number, height: number) {
    if (!ctx) return;
    const { stage } = params;
    if (!stage) return;
    this.updateRange(stage);
    const units = this.range.maxX - this.range.minX;
    // 맵이 길어도 화면 세로 안에, 넓어도 원래 미니맵 폭 안에 전부 들어가도록 배율을 줄인다
    const maxHeight = Math.max(0, height - MINIMAP_INSET * 2);
    this.scale = Math.min(MINIMAP_SCALE, maxHeight / stage.goalY, MINIMAP_WIDTH / units);
    this.boundingBox.w = units * this.scale;
    this.boundingBox.h = stage.goalY * this.scale;

    this.lastParams = params;

    this.ctx = ctx;
    ctx.save();
    ctx.fillStyle = params.theme.minimapBackground;
    ctx.translate(MINIMAP_INSET, MINIMAP_INSET);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.range.minX, 0);
    ctx.fillRect(this.range.minX, 0, units, stage.goalY);

    this.ctx.lineWidth = 3 / (params.camera.zoom + initialZoom);
    this.drawEntities(params.entities, params.theme);
    this.drawMarbles(params);
    this.drawViewport(params);

    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.w, this.boundingBox.h);
    ctx.restore();
  }

  private drawViewport(params: RenderParameters) {
    this.ctx.save();
    const { camera, size } = params;
    const zoom = camera.zoom * initialZoom;
    const w = size.x / zoom;
    const h = size.y / zoom;
    this.ctx.strokeStyle = params.theme.minimapViewport;
    this.ctx.lineWidth = 1 / zoom;
    this.ctx.strokeRect(camera.x - w / 2, camera.y - h / 2, w, h);
    this.ctx.restore();
  }

  private drawEntities(entities: MapEntityState[], theme: ColorTheme) {
    this.ctx.save();
    entities.forEach((entity) => {
      this.ctx.save();
      this.ctx.fillStyle = entity.shape.color ?? theme.entity[entity.shape.type].fill;
      this.ctx.strokeStyle = entity.shape.color ?? theme.entity[entity.shape.type].outline;
      this.ctx.translate(entity.x, entity.y);
      this.ctx.rotate(entity.angle);

      this.ctx.save();
      const shape = entity.shape;
      switch (shape.type) {
        case 'box': {
          const w = shape.width * 2;
          const h = shape.height * 2;
          this.ctx.rotate(shape.rotation);
          this.ctx.fillRect(-w / 2, -h / 2, w, h);
          break;
        }
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, shape.radius, 0, Math.PI * 2, false);
          this.ctx.stroke();
          break;
        case 'polyline':
          if (shape.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.points[0][0], shape.points[0][1]);
            for (let i = 1; i < shape.points.length; i++) {
              this.ctx.lineTo(shape.points[i][0], shape.points[i][1]);
            }
            this.ctx.stroke();
          }
          break;
      }
      this.ctx.restore();
      this.ctx.restore();
    });
    this.ctx.restore();
  }

  private drawMarbles(params: RenderParameters) {
    const { marbles } = params;
    const viewPort = {
      x: params.camera.x,
      y: params.camera.y,
      w: params.size.x,
      h: params.size.y,
      zoom: params.camera.zoom * initialZoom,
    };
    marbles.forEach((marble) => {
      marble.render(this.ctx, 1, false, true, viewPort, params.theme);
    });
  }
}

/**
 * 원본 아이콘(assets/images/ff.svg, Font Awesome Free "forward-fast", CC BY 4.0) 의 경로.
 * 640 x 640 좌표계다
 */
const FF_ICON_PATH =
  'M83.8 541.6C95.8 546.6 109.5 543.8 118.7 534.7L288 365.3L288 512C288 524.9 295.8 536.6 307.8 541.6C319.8 546.6 333.5 543.8 342.7 534.7L512 365.3L512 512C512 529.7 526.3 544 544 544C561.7 544 576 529.7 576 512L576 128C576 110.3 561.7 96 544 96C526.3 96 512 110.3 512 128L512 274.7L342.6 105.3C333.4 96.1 319.7 93.4 307.7 98.4C295.7 103.4 288 115.1 288 128L288 274.7L118.6 105.4C109.4 96.2 95.7 93.5 83.7 98.5C71.7 103.5 64 115.1 64 128L64 512C64 524.9 71.8 536.6 83.8 541.6z';

/** 캔버스를 누르고 있는 동안 2배속. 화면 가운데에 빨리감기 표시를 띄운다 */
export class FastForwarder implements UIObject {
  private bound: Rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  private icon: Path2D | null = null;

  private isEnabled: boolean = false;

  public get speed(): number {
    return this.isEnabled ? 2 : 1;
  }

  update(_deltaTime: number): void {}

  render(ctx: CanvasRenderingContext2D, _params: RenderParameters, width: number, height: number): void {
    this.bound.w = width / 2;
    this.bound.h = height / 2;
    this.bound.x = this.bound.w / 2;
    this.bound.y = this.bound.h / 2;

    const centerX = this.bound.x + this.bound.w / 2;
    const centerY = this.bound.y + this.bound.h / 2;

    if (this.isEnabled) {
      this.icon ??= new Path2D(FF_ICON_PATH);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.translate(centerX - 100, centerY - 100);
      ctx.scale(200 / 640, 200 / 640);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.fill(this.icon);
      ctx.stroke(this.icon);
      ctx.restore();
    }
  }

  getBoundingBox(): Rect | null {
    return this.bound;
  }

  // 캔버스 어디를 눌러도 2배속이 된다 (영역 밖에서 누르면 mouseHandler 가 undefined 를 넘기지만 그때도 켠다).
  // 누른 채로 미니맵 위로 움직이며 화면을 옮길 수 있도록 일부러 가운데 영역으로 제한하지 않는다
  onMouseDown(_e?: MouseEventArgs): void {
    this.isEnabled = true;
  }

  onMouseUp(_e?: MouseEventArgs): void {
    this.isEnabled = false;
  }
}
