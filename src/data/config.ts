/** Resolusi logis. Kanvas di-scale utuh (FIT) ke layar. */
export const VIEW = { WIDTH: 480, HEIGHT: 270 } as const;

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
  /** Kecepatan jalan, px per detik. */
  SPEED: 70,
  /** Jarak maksimum (px, dari kaki pemain) untuk bisa berinteraksi. */
  REACH: 26,
} as const;

/** Huruf per detik untuk efek mesin tik di kotak dialog. */
export const TYPE_SPEED = 45;
