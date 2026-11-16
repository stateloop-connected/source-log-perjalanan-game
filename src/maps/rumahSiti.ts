import { TRACKS } from '../data/tracks';
import { TILE_ID } from '../data/tiles';
import { FLAG2, FLAGS2_KEY, PS_LINES, ROOM_INTRO, SAKIT_LINES, SITI } from '../story/chapter2';
import type { MapDef } from '../story/types';
import { GridMap, indoor } from '../systems/GridMap';

const W = 16;
const H = 11;
const DOOR = { tx: 7, ty: 10 };
const TV = { tx: 6, ty: 3 };
const TOYS = { tx: 2, ty: 8 };

/** Siti's living room. Wooden floor, cream walls, the TV with the PS2 under it. */
export function buildRumahSiti(): GridMap {
  const m = new GridMap(W, H, indoor(51));
  const [capL, cap, capR, sideL, , sideR, botL, bot, botR] = TILE_ID.ROOF_GREY;

  // Walls. A cap row, then two rows of wall face, framed on the sides and bottom.
  m.put(m.deco, 0, 0, capL).put(m.deco, W - 1, 0, capR);
  m.fill(m.deco, 1, 0, W - 2, 1, cap);
  for (let x = 1; x < W - 1; x++) {
    const k = x === 1 ? 0 : x === W - 2 ? 2 : 1;
    m.put(m.deco, x, 1, TILE_ID.WALL_ORANGE.top[k]).put(m.deco, x, 2, TILE_ID.WALL_ORANGE.bottom[k]);
  }
  for (let y = 1; y < H - 1; y++) m.put(m.deco, 0, y, sideL).put(m.deco, W - 1, y, sideR);
  m.put(m.deco, 0, H - 1, botL).put(m.deco, W - 1, H - 1, botR);
  for (let x = 1; x < W - 1; x++) if (x !== DOOR.tx) m.put(m.deco, x, H - 1, bot);
  m.block(0, 0, W, 3).block(0, 0, 1, H).block(W - 1, 0, 1, H);
  for (let x = 0; x < W; x++) if (x !== DOOR.tx) m.block(x, H - 1, 1, 1);

  // Things on the wall.
  m.put(m.over, 3, 1, indoor(18)).put(m.over, 10, 1, indoor(343)).put(m.over, 12, 1, indoor(370));

  // Furniture.
  m.sprite(TV.tx, TV.ty, 'tv');
  for (let i = 0; i < 3; i++) m.put(m.ground, 5 + i, 5, indoor(421 + i)); // patterned rug in front of the TV
  m.prop(1, 3, indoor(16)).prop(W - 2, 3, indoor(17));
  m.prop(11, 3, indoor(266)).prop(12, 3, indoor(267));
  m.prop(11, 7, indoor(0)).prop(12, 7, indoor(1)).prop(13, 7, indoor(55));
  for (let i = 0; i < 3; i++) m.put(m.ground, 1 + i, 8, indoor(448 + i)); // play corner
  m.sprite(TOYS.tx, TOYS.ty, 'toys');
  return m;
}

export const RUMAH_SITI: MapDef = {
  id: 'rumah-siti',
  flagsKey: FLAGS2_KEY,
  build: buildRumahSiti,
  music: TRACKS.lullaby,
  spawn: { tx: 7, ty: 8 },

  npcs: [{ id: 'siti', sprite: 'siti', at: { tx: 6, ty: 5 }, face: 'up' }],

  onEnter: (has) => (has(FLAG2.RS_INTRO) ? [] : [{ narrate: ROOM_INTRO }, { set: FLAG2.RS_INTRO }]),

  objective: (has) =>
    !has(FLAG2.PS_DONE) ? 'Main PS bareng Siti' : !has(FLAG2.MASAK_DONE) ? 'Ngobrol dengan Siti' : 'Keluar lewat pintu',

  interactables: [
    {
      id: 'tv',
      at: { tx: TV.tx, ty: TV.ty + 1 },
      script: (has) =>
        has(FLAG2.PS_DONE)
          ? [{ say: [{ text: 'TV-nya masih nyala. Stiknya tergeletak di karpet.' }] }]
          : [{ say: PS_LINES }, { set: FLAG2.PS_DONE }, { walk: { npc: 'siti', path: [{ tx: 4, ty: 6 }, { tx: 3, ty: 8 }] } }],
    },
    {
      id: 'siti',
      at: { npc: 'siti' },
      script: (has) =>
        !has(FLAG2.PS_DONE)
          ? [{ say: [{ who: SITI, text: 'Sini, duduk. Stiknya ada dua kok.' }] }]
          : !has(FLAG2.MASAK_DONE)
            ? [
                { say: [{ who: SITI, text: 'Sekarang gantian. Main masak-masakan, kamu jadi pembelinya.' }] },
                {
                  choose: {
                    prompt: { text: 'Main masak-masakan?' },
                    options: [
                      { label: 'Protes, nggak mau', ok: false, reply: [{ text: 'Protes pun percuma.' }] },
                      {
                        label: 'Ya udah, jadi pembeli',
                        ok: true,
                        reply: [
                          { who: SITI, text: 'Mau pesan apa, Pak? Hari ini menunya enak semua lho.' },
                          { text: 'Aku jadi pembeli, atau tamu, atau apa pun peran yang dia suruh.' },
                        ],
                      },
                    ],
                  },
                },
                { set: FLAG2.MASAK_DONE },
              ]
            : [{ say: [{ who: SITI, text: 'Besok main lagi ya.' }] }],
    },
    {
      id: 'mainan',
      at: TOYS,
      script: () => [{ say: [{ text: 'Mainan masak-masakan punya Siti.' }] }],
    },
    {
      id: 'pintu',
      at: DOOR,
      script: (has) =>
        has(FLAG2.MASAK_DONE)
          ? [{ narrate: SAKIT_LINES }, { set: FLAG2.SAKIT }, { goto: { scene: 'world', data: { map: 'bandung-siti', spawn: { tx: 18, ty: 11 } } } }]
          : [{ say: [{ text: 'Masih betah di sini.' }] }],
    },
  ],
};
