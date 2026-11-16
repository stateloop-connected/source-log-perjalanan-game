import { TILE_ID } from '../data/tiles';
import {
  AFTER_WARNET,
  CARD_MALANG,
  FLAG,
  INTRO,
  OM_BOTAK,
  OM_HELM,
  SITI,
  SITI_HOUSE,
  ZAIN,
} from '../story/chapter1';
import type { MapDef } from '../story/types';
import { GridMap } from '../systems/GridMap';
import { TRACKS } from '../data/tracks';

/** Jalan utama dimulai di baris ini (trotoar), aspal 3 baris di bawahnya. */
export const BANDUNG_ROAD = 12;

// Posisi penting, dalam tile.
const DOOR_ZAIN = { tx: 5, ty: 9 };
const DOOR_SITI = { tx: 18, ty: 9 };
const DOOR_WARNET = { tx: 30, ty: 9 };
const HALTE = { tx: 24, ty: 16 };

export function buildBandung(): GridMap {
  const m = new GridMap(40, 24, TILE_ID.GRASS);

  // Deretan pohon di batas atas dan bawah.
  for (let x = 0; x < m.cols; x += 2) m.tree(x, 2, x % 4 ? TILE_ID.TREE_GREEN : TILE_ID.TREE_ORANGE);
  for (let x = 1; x < m.cols; x += 2) m.tree(x, 23, x % 3 ? TILE_ID.TREE_GREEN : TILE_ID.TREE_ORANGE);

  // Rumah Zain, rumah Siti, warnet.
  m.building(3, 4, 6, 3, TILE_ID.PLAZA, TILE_ID.WALL_RED, { doorCol: 2, windows: [1, 4] });
  m.building(15, 4, 6, 3, TILE_ID.ROOF_GREY, TILE_ID.WALL_ORANGE, { doorCol: 3, windows: [1, 4] });
  m.building(27, 4, 8, 3, TILE_ID.ROOF_PLAIN, TILE_ID.WALL_RED, {
    doorCol: 3,
    door: TILE_ID.DOOR_GLASS,
    windows: [1, 5, 6],
    label: 'WARNET',
  });

  // Jalan setapak dari tiap pintu ke trotoar.
  for (const d of [DOOR_ZAIN, DOOR_SITI, DOOR_WARNET]) m.fill(m.ground, d.tx, d.ty, 1, BANDUNG_ROAD - d.ty, TILE_ID.SIDEWALK[4]);

  m.road(BANDUNG_ROAD);

  // Isi lingkungan sebelah utara jalan.
  m.tree(11, 9).tree(12, 6, TILE_ID.TREE_ORANGE);
  m.prop(10, 10, TILE_ID.TREE_SMALL).prop(22, 10, TILE_ID.TREE_SMALL).prop(25, 9, TILE_ID.TREE_SMALL_ORANGE);
  m.prop(2, 9, TILE_ID.TRASH).prop(36, 10, TILE_ID.TRASH);
  m.tall(8, 11, TILE_ID.LAMP).tall(23, 11, TILE_ID.LAMP).tall(37, 11, TILE_ID.LAMP);

  // Sebelah selatan. Taman, kios buah, halte.
  m.nine(m.ground, 2, 18, 11, 4, TILE_ID.PARK);
  m.tree(4, 20).tree(8, 19, TILE_ID.TREE_ORANGE).tree(11, 21);
  m.prop(15, 17, TILE_ID.STALL[0]).prop(16, 17, TILE_ID.STALL[1]);
  m.tall(HALTE.tx, HALTE.ty, TILE_ID.BUS_SIGN);
  m.prop(25, 17, TILE_ID.BENCH[0]).prop(26, 17, TILE_ID.BENCH[1]);
  m.tree(31, 20).tree(35, 19, TILE_ID.TREE_ORANGE).prop(33, 21, TILE_ID.TREE_SMALL);
  return m;
}

export const BANDUNG: MapDef = {
  id: 'bandung',
  build: buildBandung,
  music: TRACKS.town,
  spawn: { tx: 5, ty: 10 },

  npcs: [
    { id: 'siti', sprite: 'siti', at: { tx: 20, ty: 10 }, face: 'down', show: (has) => !has(FLAG.DIAJAK_SITI) },
    { id: 'om-helm', sprite: 'pekerja', at: { tx: 33, ty: 10 }, face: 'left' },
    { id: 'om-botak', sprite: 'bapak', at: { tx: 27, ty: 18 }, face: 'up' },
  ],

  onEnter: (has) => [
    ...(has(FLAG.INTRO) ? [] : [{ say: INTRO }, { set: FLAG.INTRO }]),
    ...(has(FLAG.WARNET_DONE) && !has(FLAG.WARNET_TOLD) ? [{ narrate: AFTER_WARNET }, { set: FLAG.WARNET_TOLD }] : []),
  ],

  objective: (has) =>
    !has(FLAG.DIAJAK_SITI)
      ? 'Kabur ke rumah Siti'
      : !has(FLAG.SITI_DONE)
        ? 'Masuk ke rumah Siti'
        : !has(FLAG.WARNET_DONE)
          ? 'Pergi ke warnet'
          : 'Ke halte bus, liburan ke Malang',

  interactables: [
    {
      id: 'pintu-zain',
      at: DOOR_ZAIN,
      script: (has) =>
        has(FLAG.SITI_DONE)
          ? [{ say: [{ text: 'Masih sama berisiknya. Nanti saja pulangnya.' }] }]
          : [{ say: [{ text: 'Dari dalam masih kedengaran suara orang marah-marah.' }, { who: ZAIN, text: 'Mending jangan masuk dulu.' }] }],
    },
    {
      id: 'siti',
      at: { npc: 'siti' },
      script: () => [
        {
          say: [
            { who: SITI, text: 'Zain! Ribut lagi ya di rumahmu?' },
            { who: ZAIN, text: '...iya.' },
            { who: SITI, text: 'Ya udah, main PS di rumahku aja. Kamu boleh pegang stik duluan.' },
            { who: ZAIN, text: 'Beneran?' },
            { who: SITI, text: 'Iya. Tapi habis itu ikut main masak-masakan ya. Kamu jadi pembelinya.' },
          ],
        },
        { set: FLAG.DIAJAK_SITI },
        { walk: { npc: 'siti', path: [{ tx: DOOR_SITI.tx, ty: 10 }, DOOR_SITI], vanish: true } },
      ],
    },
    {
      id: 'pintu-siti',
      at: DOOR_SITI,
      script: (has) =>
        has(FLAG.DIAJAK_SITI) && !has(FLAG.SITI_DONE)
          ? [{ narrate: SITI_HOUSE }, { set: FLAG.SITI_DONE }, { teleport: { tx: DOOR_SITI.tx, ty: 10 } }]
          : has(FLAG.SITI_DONE)
            ? [{ say: [{ text: 'Rumah Siti. Pintunya hampir selalu terbuka buat aku.' }] }]
            : [{ say: [{ text: 'Rumah Siti. Siti lagi main di depan.' }] }],
    },
    {
      id: 'warnet',
      at: DOOR_WARNET,
      script: (has) =>
        !has(FLAG.SITI_DONE)
          ? [{ say: [{ text: 'Warnet. Tempat paling nyaman buat main game. Tapi sekarang aku mau ke Siti dulu.' }] }]
          : !has(FLAG.WARNET_DONE)
            ? [{ goto: { scene: 'warnet' } }]
            : [{ say: [{ text: 'Hari ini sudah cukup. Besok juga ke sini lagi sih, hehe.' }] }],
    },
    {
      id: 'om-helm',
      at: { npc: 'om-helm' },
      script: (has) => [
        {
          say: has(FLAG.WARNET_DONE)
            ? [{ who: OM_HELM, text: 'Mantap, Dek. Besok jokiin lagi ya.' }]
            : [{ who: OM_HELM, text: 'Dek, nanti tolong jokiin akunku ya. Om mau masuk kerja dulu.' }],
        },
      ],
    },
    {
      id: 'om-botak',
      at: { npc: 'om-botak' },
      script: (has) => [
        {
          say: has(FLAG.WARNET_DONE)
            ? [{ who: OM_BOTAK, text: 'Mau ke mana, Dek? Malang? Hati-hati di jalan ya.' }]
            : [{ who: OM_BOTAK, text: 'Main ke warnet lagi, Dek? Jangan lupa sekolah lho.' }],
        },
      ],
    },
    {
      id: 'halte',
      at: HALTE,
      script: (has) =>
        has(FLAG.WARNET_DONE)
          ? [{ goto: { scene: 'story', data: { card: CARD_MALANG, next: { scene: 'world', data: { map: 'malang' } } } } }]
          : [{ say: [{ text: 'Halte bus. Belum waktunya liburan.' }] }],
    },
  ],
};

/** Posisi rumah Zain (tile), untuk efek "BRAK!" yang melayang dari atapnya. */
export const BANDUNG_NOISE_AT = { tx: 6, ty: 4 };
