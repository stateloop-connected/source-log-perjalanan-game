/**
 * Index tile di `public/assets/city.png` (Kenney RPG Urban Pack, 27 kolom x 18 baris, 16px).
 * Index = baris * 27 + kolom. Semua dipilih dengan me-render sheet + grid index.
 */
export const CITY_COLS = 27;

/** 9-slice. Urutan [kiri-atas, atas, kanan-atas, kiri, tengah, kanan, kiri-bawah, bawah, kanan-bawah]. */
export type Nine = readonly [number, number, number, number, number, number, number, number, number];

export const TILE_ID = {
  GRASS: 28,
  /** Taman berpagar trotoar. */
  PARK: [0, 1, 2, 27, 28, 29, 54, 55, 56] as Nine,
  SIDEWALK: [8, 9, 10, 35, 36, 37, 62, 63, 64] as Nine,
  /** Lantai keramik krem, dipakai untuk teras. */
  PLAZA: [81, 82, 83, 108, 109, 110, 135, 136, 137] as Nine,
  ROOF_GREY: [89, 90, 91, 116, 117, 118, 143, 144, 145] as Nine,
  ROOF_PLAIN: [8, 9, 10, 35, 36, 37, 62, 63, 64] as Nine,
  ASPHALT: 406,
  ROAD_DASH: 433,

  WALL_RED: { top: [17, 18, 19], bottom: [98, 99, 100] },
  WALL_ORANGE: { top: [125, 126, 127], bottom: [206, 207, 208] },

  DOOR: 283,
  DOOR_GLASS: 285,
  WINDOW: 362,
  WINDOW_GLASS: 445,

  TREE_GREEN: [232, 259],
  TREE_ORANGE: [313, 340],
  TREE_SMALL: 265,
  TREE_SMALL_ORANGE: 373,
  HEDGE: [328, 329, 330],
  BENCH: [270, 271],
  BENCH_WOOD: 381,
  BUS_SIGN: [168, 195],
  LAMP: [164, 191],
  TRASH: 279,
  TAP: 251,
  STALL: [276, 277],
} as const;

export type Wall = { top: readonly number[]; bottom: readonly number[] };

/**
 * Spritesheet karakter 16x16, 4 kolom x 3 baris.
 * Kolom 0 = menghadap kiri, 1 = depan, 2 = belakang, 3 = menghadap kanan.
 * Baris 0 = diam, 1 & 2 = langkah.
 */
export const CHAR_COL = { left: 0, down: 1, up: 2, right: 3 } as const;
export type Facing = keyof typeof CHAR_COL;
export const CHARACTERS = ['zain', 'siti', 'kakek', 'nenek', 'pekerja', 'bapak', 'punk1', 'punk2', 'punk3'] as const;
export type CharKey = (typeof CHARACTERS)[number];
