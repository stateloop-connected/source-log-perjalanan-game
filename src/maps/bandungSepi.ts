import { TRACKS } from '../data/tracks';
import {
  DAY1_HOME,
  DAY1_WARNET,
  DAY2_HOME,
  DAY2_WARNET,
  DAY3_WARNET,
  FLAG3,
  FLAGS3_KEY,
  SEPI_LINES,
  WARUNG_LINES,
} from '../story/chapter3';
import type { Has, MapDef } from '../story/types';
import { buildBandung } from './bandung';

const DOOR_ZAIN = { tx: 5, ty: 9 };
const DOOR_SITI = { tx: 18, ty: 9 };
const DOOR_WARNET = { tx: 30, ty: 9 };
const WARUNG = { tx: 15.5, ty: 17 };

/** Three days of the same loop: internet café, instant noodles, home. */
export const BANDUNG_SEPI: MapDef = {
  id: 'bandung-sepi',
  flagsKey: FLAGS3_KEY,
  build: () => {
    const m = buildBandung();
    // The noodle stash piling up by the front door.
    m.sprite(4, 10, 'mie', false);
    return m;
  },
  music: TRACKS.c64,
  tint: () => ({ color: 0x1a2333, alpha: 0.25 }),
  spawn: { tx: 5, ty: 10 },
  npcs: [],

  onEnter: (has: Has) => (has(FLAG3.INTRO) ? [] : [{ narrate: SEPI_LINES }, { set: FLAG3.INTRO }]),

  objective: (has) =>
    !has(FLAG3.H1_WARNET)
      ? 'Hari 1. Ke warnet'
      : !has(FLAG3.H1_RUMAH)
        ? 'Hari 1. Pulang'
        : !has(FLAG3.H2_WARNET)
          ? 'Hari 2. Ke warnet'
          : !has(FLAG3.H2_WARUNG)
            ? 'Hari 2. Beli mi di warung'
            : !has(FLAG3.H2_RUMAH)
              ? 'Hari 2. Pulang'
              : 'Hari 3. Ke warnet',

  interactables: [
    {
      id: 'warnet',
      at: DOOR_WARNET,
      script: (has) =>
        !has(FLAG3.H1_WARNET)
          ? [{ narrate: DAY1_WARNET }, { set: FLAG3.H1_WARNET }]
          : has(FLAG3.H1_RUMAH) && !has(FLAG3.H2_WARNET)
            ? [{ narrate: DAY2_WARNET }, { set: FLAG3.H2_WARNET }]
            : has(FLAG3.H2_RUMAH)
              ? [{ narrate: DAY3_WARNET }, { set: FLAG3.H3_WARNET }, { goto: { scene: 'world', data: { map: 'jalanan', spawn: { tx: 30, ty: 10 } } } }]
              : [{ say: [{ text: 'Barusan dari sana.' }] }],
    },
    {
      id: 'warung',
      at: WARUNG,
      script: (has) =>
        has(FLAG3.H2_WARNET) && !has(FLAG3.H2_WARUNG)
          ? [{ say: WARUNG_LINES }, { set: FLAG3.H2_WARUNG }]
          : [{ say: [{ text: 'Warung. Mi instannya selalu ada.' }] }],
    },
    {
      id: 'rumah',
      at: DOOR_ZAIN,
      script: (has) =>
        has(FLAG3.H1_WARNET) && !has(FLAG3.H1_RUMAH)
          ? [{ narrate: DAY1_HOME }, { set: FLAG3.H1_RUMAH }]
          : has(FLAG3.H2_WARUNG) && !has(FLAG3.H2_RUMAH)
            ? [{ narrate: DAY2_HOME }, { set: FLAG3.H2_RUMAH }]
            : [{ say: [{ text: 'Nanti saja pulangnya.' }] }],
    },
    {
      id: 'rumah-siti',
      at: DOOR_SITI,
      script: () => [{ say: [{ text: 'Rumah Siti. Sekarang nggak ada lagi alasan buat ke sana.' }] }],
    },
  ],
};
