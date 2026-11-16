/**
 * Logical resolution for the given screen size.
 *
 * The canvas is scaled up to fill the screen, so a fixed 480x270 looks tiny on a phone:
 * a 844x390 landscape screen only scales it by 1.44 and leaves black bars. Instead we
 * pick an integer zoom from the screen's short side (at least 2x), then derive the
 * logical size from it. Sprites stay crisp and the canvas fills the screen edge to edge.
 *
 * Always computed as landscape (long side = width), so rotating the phone from portrait
 * to landscape does not need a new size.
 */
export function computeView(screenW: number, screenH: number): { width: number; height: number } {
  const long = Math.max(screenW, screenH);
  const short = Math.min(screenW, screenH);
  const zoom = Math.max(2, Math.floor(short / 230));
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));
  return { width: clamp(long / zoom, 320, 640), height: clamp(short / zoom, 180, 300) };
}

export const TILE = 16;

export const FONT = '"Press Start 2P", monospace';

export const COLOR = {
  bg: 0x0b0f18,
  panel: 0x0f1420,
  panelEdge: 0x3a4660,
  text: '#e6ebf5',
  name: '#f2cc60',
  dim: '#8a94a8',
} as const;

export const PLAYER = {
  /** Walking speed, px per second. */
  SPEED: 70,
  /** Max distance (px, from the player's feet) to interact with something. */
  REACH: 26,
} as const;

/** Letters per second for the dialogue typewriter effect. */
export const TYPE_SPEED = 45;
