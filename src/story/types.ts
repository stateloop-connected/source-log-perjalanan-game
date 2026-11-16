import type { CharKey, Facing } from '../data/tiles';
import type { GridMap } from '../systems/GridMap';
import type { Track } from '../data/tracks';

export interface Line {
  /** Nama pembicara. Kosong = narasi. */
  who?: string;
  text: string;
}

/** Titik di peta, dalam satuan tile (boleh pecahan). */
export interface At {
  tx: number;
  ty: number;
}

export interface ChoiceOption {
  label: string;
  /** Pilihan benar menutup pertanyaan. Pilihan salah memutar `reply` lalu pertanyaan diulang. */
  ok: boolean;
  reply: Line[];
}

/**
 * Langkah-langkah cerita. Dijalankan berurutan oleh WorldScene.
 * Semua cerita ditulis sebagai data, logika game tidak perlu disentuh.
 */
export type Action =
  | { say: Line[] }
  | { choose: { prompt: Line; options: ChoiceOption[] } }
  | { set: string }
  /** NPC berjalan melewati titik-titik. Tidak menunggu, pemain tetap bisa bergerak. */
  | { walk: { npc: string; path: At[]; vanish?: boolean } }
  /** Layar menggelap, dialog diputar di atas layar gelap, lalu terang lagi. */
  | { narrate: Line[] }
  | { teleport: At }
  /** Pindah ke scene lain, misalnya warnet atau perjalanan ke kota lain. */
  | { goto: { scene: string; data?: object } }
  /** Akhir chapter. Narasi penutup, "Bersambung", kembali ke judul. */
  | { end: Line[] };

export type Has = (flag: string) => boolean;

export interface NpcDef {
  id: string;
  sprite: CharKey;
  at: At;
  face?: Facing;
  /** NPC hanya muncul kalau ini bernilai true. */
  show?: (has: Has) => boolean;
}

export interface Interactable {
  id: string;
  /** Posisi tetap, atau menempel pada NPC. */
  at: At | { npc: string };
  show?: (has: Has) => boolean;
  script: (has: Has) => Action[];
}

export interface MapDef {
  id: string;
  build(): GridMap;
  music: Track;
  spawn: At;
  npcs: NpcDef[];
  interactables: Interactable[];
  /** Diputar saat masuk peta. Kembalikan [] kalau tidak ada. */
  onEnter(has: Has): Action[];
  /** Petunjuk tujuan di pojok kiri atas. */
  objective(has: Has): string | undefined;
}
