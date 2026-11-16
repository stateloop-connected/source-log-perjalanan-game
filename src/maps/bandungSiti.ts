import { TRACKS } from '../data/tracks';
import {
  AFTER_PERGI,
  ENDING2,
  FLAG2,
  FLAGS2_KEY,
  KURSI_LINES,
  MEMORY_FLAGS,
  MEMORY_LINES,
  NANTI_LINES,
  PERGI_LINES,
  RENTAL_LINES,
  SITI,
  WALKER_LINES,
} from '../story/chapter2';
import type { Action, At, Has, MapDef, NpcDef } from '../story/types';
import { buildBandung, PARK_BENCH } from './bandung';

const SITI_HOME = { tx: 19, ty: 10 };
const RENTAL_DOOR = { tx: 30, ty: 9 };
const BENCH_SPOT = { tx: PARK_BENCH.tx + 0.5, ty: PARK_BENCH.ty + 1 };

/** Is Siti walking with Zain right now (walker stage or wheelchair stage)? */
const following = (has: Has) =>
  (has(FLAG2.IKUT_JALAN) && !has(FLAG2.JALAN_DONE)) || (has(FLAG2.IKUT_KURSI) && !has(FLAG2.KURSI_DONE));

const memoriesLeft = (has: Has) => MEMORY_FLAGS.filter((f) => !has(f));

/** One "shadow" of Siti. Talking to it plays a memory; the last one closes the chapter. */
function shadow(id: string, flag: (typeof MEMORY_FLAGS)[number], at: At): { npc: NpcDef; script: (has: Has) => Action[] } {
  return {
    npc: { id, sprite: 'siti', at, face: 'down', ghost: true, show: (has) => has(FLAG2.PERGI) && !has(flag) },
    script: (has) => {
      const rest = memoriesLeft(has).filter((f) => f !== flag);
      return [
        { say: [{ text: MEMORY_LINES[flag] }] },
        { set: flag },
        { walk: { npc: id, path: [], vanish: true } },
        ...(rest.length === 0 ? [{ end: ENDING2 } as Action] : []),
      ];
    },
  };
}

const SHADOWS = [
  shadow('bayang-stik', FLAG2.MEM_STIK, { tx: 28, ty: 10 }),
  shadow('bayang-masak', FLAG2.MEM_MASAK, SITI_HOME),
  shadow('bayang-nanti', FLAG2.MEM_NANTI, { tx: PARK_BENCH.tx, ty: PARK_BENCH.ty + 1 }),
];

export const BANDUNG_SITI: MapDef = {
  id: 'bandung-siti',
  flagsKey: FLAGS2_KEY,
  build: () => buildBandung('RENTAL PS'),
  // Silence right after Siti is gone, until the first memory is found.
  music: (has) => (has(FLAG2.PERGI) && memoriesLeft(has).length === MEMORY_FLAGS.length ? undefined : TRACKS.snowfall),
  endMusic: TRACKS.snowfall,
  tint: (has) => (has(FLAG2.PERGI) ? { color: 0x0b1430, alpha: 0.45 } : undefined),
  // Zain walks at Siti's pace.
  playerSpeed: (has) => (has(FLAG2.IKUT_JALAN) && !has(FLAG2.JALAN_DONE) ? 26 : following(has) ? 42 : undefined),
  spawn: { tx: 18, ty: 11 },

  npcs: [
    {
      id: 'siti',
      sprite: 'siti',
      at: SITI_HOME,
      face: 'down',
      show: (has) => !has(FLAG2.PERGI),
      aid: (has) => (has(FLAG2.KURSI_RODA) ? 'wheelchair' : 'walker'),
      follow: following,
    },
    ...SHADOWS.map((s) => s.npc),
  ],

  onEnter: (has) => [
    ...(has(FLAG2.SAKIT) && !has(FLAG2.JALAN_INTRO) ? [{ narrate: WALKER_LINES }, { set: FLAG2.JALAN_INTRO }] : []),
    ...(has(FLAG2.PERGI) && !has(FLAG2.PERGI_TOLD) ? [{ narrate: AFTER_PERGI }, { set: FLAG2.PERGI_TOLD }] : []),
  ],

  objective: (has) =>
    has(FLAG2.PERGI)
      ? `Bayang-bayang Siti ${MEMORY_FLAGS.length - memoriesLeft(has).length}/${MEMORY_FLAGS.length}`
      : !has(FLAG2.IKUT_JALAN)
        ? 'Temui Siti di depan rumahnya'
        : !has(FLAG2.JALAN_DONE)
          ? 'Temani Siti ke bangku taman'
          : !has(FLAG2.IKUT_KURSI)
            ? 'Temui Siti'
            : 'Antar Siti ke rental PS',

  interactables: [
    {
      id: 'siti',
      at: { npc: 'siti' },
      script: (has) =>
        !has(FLAG2.IKUT_JALAN)
          ? [{ say: [{ who: SITI, text: 'Zain, temani aku jalan ke taman ya. Pelan-pelan aja.' }] }, { set: FLAG2.IKUT_JALAN }]
          : has(FLAG2.KURSI_RODA) && !has(FLAG2.IKUT_KURSI)
            ? [{ say: [{ who: SITI, text: 'Ke rental, yuk. Aku mau lihat kamu main lagi.' }] }, { set: FLAG2.IKUT_KURSI }]
            : [{ say: [{ who: SITI, text: 'Besok ke sini lagi ya, Zain.' }] }],
    },
    {
      id: 'bangku',
      at: BENCH_SPOT,
      show: (has) => !has(FLAG2.PERGI),
      script: (has) =>
        has(FLAG2.IKUT_JALAN) && !has(FLAG2.JALAN_DONE)
          ? [
              { say: NANTI_LINES },
              { set: FLAG2.JALAN_DONE },
              { narrate: KURSI_LINES },
              { set: FLAG2.KURSI_RODA },
              { goto: { scene: 'world', data: { map: 'bandung-siti', spawn: { tx: 18, ty: 11 } } } },
            ]
          : [{ say: [{ text: 'Bangku taman.' }] }],
    },
    {
      id: 'rental',
      at: RENTAL_DOOR,
      show: (has) => !has(FLAG2.PERGI),
      script: (has) =>
        has(FLAG2.IKUT_KURSI) && !has(FLAG2.KURSI_DONE)
          ? [
              { narrate: RENTAL_LINES },
              { set: FLAG2.KURSI_DONE },
              { set: FLAG2.PERGI },
              { narrate: PERGI_LINES },
              { goto: { scene: 'world', data: { map: 'bandung-siti', spawn: { tx: 30, ty: 11 } } } },
            ]
          : [{ say: [{ text: 'Rental PS. Tempat kami main kalau bosan di rumah Siti.' }] }],
    },
    ...SHADOWS.map((s) => ({ id: s.npc.id, at: { npc: s.npc.id }, script: s.script })),
  ],
};
