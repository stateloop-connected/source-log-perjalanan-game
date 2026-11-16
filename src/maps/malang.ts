import { TILE_ID } from '../data/tiles';
import { ENDING, FLAG, FLAGS_KEY, KAKEK, MALANG_INTRO, NENEK } from '../story/chapter1';
import type { MapDef } from '../story/types';
import { GridMap } from '../systems/GridMap';
import { TRACKS } from '../data/tracks';

const DOOR = { tx: 16, ty: 8 };
const MEJA = { tx: 13, ty: 9 };
const KERAN = { tx: 21, ty: 9 };
const ROAD = 14;

export function buildMalang(): GridMap {
  const m = new GridMap(32, 20, TILE_ID.GRASS);

  for (let x = 0; x < m.cols; x += 2) m.tree(x, 2, x % 4 ? TILE_ID.TREE_ORANGE : TILE_ID.TREE_GREEN);
  for (let x = 1; x < m.cols; x += 2) m.tree(x, 19, TILE_ID.TREE_ORANGE);

  // Rumah Kakek dan Nenek, dengan teras keramik di depannya.
  m.building(11, 3, 10, 3, TILE_ID.ROOF_GREY, TILE_ID.WALL_RED, { doorCol: 5, windows: [1, 3, 7, 8] });
  m.nine(m.ground, 12, 8, 8, 3, TILE_ID.PLAZA);
  m.prop(MEJA.tx, MEJA.ty, TILE_ID.BENCH_WOOD);
  m.prop(KERAN.tx, KERAN.ty, TILE_ID.TAP);
  m.fill(m.ground, DOOR.tx, 11, 1, ROAD - 11, TILE_ID.SIDEWALK[4]);

  // Kebun. Pagar tanaman dan pepohonan.
  for (const x of [3, 4, 5]) m.prop(x, 9, TILE_ID.HEDGE[x - 3]);
  for (const x of [25, 26, 27]) m.prop(x, 9, TILE_ID.HEDGE[x - 25]);
  m.tree(5, 6, TILE_ID.TREE_ORANGE).tree(8, 11).tree(24, 6).tree(27, 12, TILE_ID.TREE_ORANGE);
  m.prop(2, 12, TILE_ID.TREE_SMALL_ORANGE).prop(29, 7, TILE_ID.TREE_SMALL);
  // Pagar tanaman di kiri dan kanan jalan setapak.
  const hedge = (x0: number, w: number) => {
    for (let i = 0; i < w; i++) m.prop(x0 + i, 12, TILE_ID.HEDGE[i === 0 ? 0 : i === w - 1 ? 2 : 1]);
  };
  hedge(9, 6);
  hedge(18, 6);

  m.road(ROAD);
  m.tall(6, ROAD, TILE_ID.BUS_SIGN);
  return m;
}

export const MALANG: MapDef = {
  id: 'malang',
  flagsKey: FLAGS_KEY,
  build: buildMalang,
  music: TRACKS.lullaby,
  spawn: { tx: 8, ty: ROAD },

  npcs: [
    { id: 'nenek', sprite: 'nenek', at: { tx: 15, ty: 9 }, face: 'down' },
    { id: 'kakek', sprite: 'kakek', at: { tx: 23, ty: 10 }, face: 'left' },
  ],

  onEnter: (has) => (has(FLAG.M_INTRO) ? [] : [{ narrate: MALANG_INTRO }, { set: FLAG.M_INTRO }]),

  objective: (has) =>
    !has(FLAG.DISURUH_MAKAN)
      ? 'Temui Nenek di teras'
      : !has(FLAG.SUDAH_MAKAN)
        ? 'Makan di meja teras'
        : !has(FLAG.CUCI_DONE)
          ? 'Cuci piring di keran'
          : !has(FLAG.BUNGKUS_DONE)
            ? 'Ngobrol lagi dengan Nenek'
            : 'Temui Kakek',

  interactables: [
    {
      id: 'nenek',
      at: { npc: 'nenek' },
      script: (has) =>
        !has(FLAG.DISURUH_MAKAN)
          ? [{ say: [{ who: NENEK, text: 'Sudah datang, Le? Ayo makan dulu. Sudah Nenek siapkan di meja.' }] }, { set: FLAG.DISURUH_MAKAN }]
          : !has(FLAG.SUDAH_MAKAN)
            ? [{ say: [{ who: NENEK, text: 'Makan dulu, Le. Mejanya di situ.' }] }]
            : !has(FLAG.CUCI_DONE)
              ? [{ say: [{ who: NENEK, text: 'Piringnya dicuci dulu di keran.' }] }]
              : !has(FLAG.BUNGKUS_DONE)
                ? [
                    { say: [{ who: NENEK, text: 'Ini ada jajan buat kamu.' }] },
                    {
                      choose: {
                        prompt: { text: 'Bungkusnya diikat kencang. Gimana bukanya?' },
                        options: [
                          {
                            label: 'Gigit ikatannya biar cepat',
                            ok: false,
                            reply: [{ who: KAKEK, text: 'Le. Ikatannya jangan digigit. Buka pakai tangan, pelan-pelan, biar rezekimu nggak ikut terhalang.' }],
                          },
                          {
                            label: 'Buka pakai tangan, pelan-pelan',
                            ok: true,
                            reply: [{ text: 'Aku buka ikatannya pelan-pelan pakai tangan.' }, { who: NENEK, text: 'Nah, pinter.' }],
                          },
                        ],
                      },
                    },
                    { set: FLAG.BUNGKUS_DONE },
                  ]
                : [{ say: [{ who: NENEK, text: 'Sana, temani Kakekmu.' }] }],
    },
    {
      id: 'meja',
      at: MEJA,
      script: (has) =>
        has(FLAG.DISURUH_MAKAN) && !has(FLAG.SUDAH_MAKAN)
          ? [
              { say: [{ text: 'Makanannya masih hangat.' }] },
              {
                choose: {
                  prompt: { text: 'Perutku sudah kenyang, tapi di piring masih ada sisa.' },
                  options: [
                    { label: 'Sisakan saja', ok: false, reply: [{ who: KAKEK, text: 'Le. Makanan itu rezeki. Jangan dianggurin.' }] },
                    { label: 'Habiskan', ok: true, reply: [{ text: 'Piringnya bersih.' }] },
                  ],
                },
              },
              {
                choose: {
                  prompt: { text: 'Terus piringnya?' },
                  options: [
                    {
                      label: 'Tinggal di meja, nanti saja',
                      ok: false,
                      reply: [{ who: NENEK, text: 'Habis makan, piringnya langsung dicuci. Jangan dibiarkan nganggur di meja.' }],
                    },
                    { label: 'Bawa ke keran, cuci sekarang', ok: true, reply: [] },
                  ],
                },
              },
              { set: FLAG.SUDAH_MAKAN },
            ]
          : has(FLAG.SUDAH_MAKAN)
            ? [{ say: [{ text: 'Mejanya sudah bersih.' }] }]
            : [{ say: [{ text: 'Meja makan di teras.' }] }],
    },
    {
      id: 'keran',
      at: KERAN,
      script: (has) =>
        has(FLAG.SUDAH_MAKAN) && !has(FLAG.CUCI_DONE)
          ? [{ say: [{ text: 'Aku cuci piringnya sampai bersih.' }] }, { set: FLAG.CUCI_DONE }]
          : [{ say: [{ text: 'Keran air.' }] }],
    },
    {
      id: 'kakek',
      at: { npc: 'kakek' },
      script: (has) =>
        has(FLAG.BUNGKUS_DONE)
          ? [{ say: [{ who: KAKEK, text: 'Nah. Begitu.' }] }, { end: ENDING }]
          : has(FLAG.DISURUH_MAKAN)
            ? [{ say: [{ text: 'Kakek cuma melirik sebentar, lalu kembali diam.' }] }]
            : [{ say: [{ who: KAKEK, text: 'Sana, temui nenekmu dulu.' }] }],
    },
  ],
};
