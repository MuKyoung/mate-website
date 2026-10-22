// lazygyu/roulette (MIT, ./LICENSE) 의 types/*, UIObject, gameObject 를 한 파일로 모았다.
import type { Camera } from './camera';
import type { ParticleManager } from './effects';
import type { StageDef } from './maps';
import type { Marble } from './marble';

export interface VectorLike {
  x: number;
  y: number;
}

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type EntityShapeTypes = 'box' | 'circle' | 'polyline';

interface EntityShapeBase {
  type: EntityShapeTypes;
  color?: string;
  bloomColor?: string;
}

export interface EntityBoxShape extends EntityShapeBase {
  type: 'box';
  width: number;
  height: number;
  rotation: number;
}

export interface EntityCircleShape extends EntityShapeBase {
  type: 'circle';
  radius: number;
}

export interface EntityPolylineShape extends EntityShapeBase {
  type: 'polyline';
  rotation: number;
  points: [number, number][];
}

export type EntityShape = EntityBoxShape | EntityCircleShape | EntityPolylineShape;

export type EntityPhysicalProps = {
  density: number;
  restitution: number;
  angularVelocity: number;
  life?: number;
};

export interface MapEntity {
  position: VectorLike;
  type: 'static' | 'kinematic';
  shape: EntityShape;
  props: EntityPhysicalProps;
}

export interface MapEntityState {
  x: number;
  y: number;
  angle: number;
  shape: EntityShape;
  life: number;
}

interface ShapeColor {
  outline: string;
  fill: string;
  bloom: string;
  bloomRadius: number;
}

export interface ColorTheme {
  background: string;
  marbleLightness: number;
  marbleWinningBorder: string;
  skillColor: string;
  coolTimeIndicator: string;
  entity: {
    box: ShapeColor;
    circle: ShapeColor;
    polyline: ShapeColor;
  };
  rankStroke: string;
  minimapBackground: string;
  minimapViewport: string;
  winnerText: string;
  winnerOutline: string;
  winnerBackground: string;
}

/** 0-based, 양끝 포함. 1명 추첨은 start === end */
export type WinnerRange = { start: number; end: number };

export interface GameObject {
  isDestroy: boolean;

  update(deltaTime: number): void;

  render(ctx: CanvasRenderingContext2D, zoom: number, theme: ColorTheme): void;
}

export type RenderParameters = {
  camera: Camera;
  stage: StageDef;
  entities: MapEntityState[];
  marbles: Marble[];
  winners: Marble[];
  particleManager: ParticleManager;
  effects: GameObject[];
  winnerRange: WinnerRange;
  /** 진행 중에는 null, 당첨자가 모두 확정되면 당첨자 배열 */
  result: Marble[] | null;
  size: VectorLike;
  theme: ColorTheme;
};

export type MouseEventArgs = { x: number; y: number; button: number };

export type MouseEventName = 'MouseMove' | 'MouseUp' | 'MouseDown' | 'DblClick';

export type MouseEventHandlerName = `on${MouseEventName}`;

/** 캔버스 위에 그리는 화면 요소 (순위표, 미니맵, 빨리감기) */
export interface UIObject {
  update(deltaTime: number): void;

  render(ctx: CanvasRenderingContext2D, params: RenderParameters, width: number, height: number): void;

  getBoundingBox(): Rect | null;

  onWheel?(e: WheelEvent): void;

  onMouseMove?(e?: MouseEventArgs): void;

  onMouseDown?(e?: MouseEventArgs): void;

  onMouseUp?(e?: MouseEventArgs): void;

  onDblClick?(e?: MouseEventArgs): void;

  onMessage?(func: (msg: string) => void): void;
}
