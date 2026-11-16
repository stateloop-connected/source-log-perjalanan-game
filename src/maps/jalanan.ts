import { TRACKS } from '../data/tracks';
import {
  ENDING3,
  FLAG3,
  FLAGS3_KEY,
  IKAT,
  JALAN_INTRO,
  KUPLUK,
  MAKAN_LINES,
  MEET_LINES,
  MERAH,
  NGAMEN_FLAGS,
  OM_BOTAK,
  OM_HELM,
  ZAIN,
} from '../story/chapter3';
import type { Action, Has, MapDef } from '../story/types';
import { buildBandung, PARK_BENCH } from './bandung';

const HALTE = { tx: 24, ty: 16 };
const WARUNG = { tx: 15.5, ty: 17 };
const BENCH_SPOT = { tx: PARK_BENCH.tx + 0.5, ty: PARK_BENCH.ty + 1 };
const GANG = { ikat: { tx: 18, ty: 18 }, merah: { tx: 20, ty: 18 }, kupluk: { tx: 19, ty: 20 } };

const wandered = (has: Has) => has(FLAG3.DUDUK1) && has(FLAG3.DUDUK2);
const ngamenDone = (has: Has) => NGAMEN_FLAGS.filter((f) => has(f)).length;

/** Sitting at one spot. The second one is where Zain notices the gang. */
function sit(flag: string, other: string, lines: string[]): (has: Has) => Action[] {
  return (has) => {
    if (has(flag)) return [{ say: [{ text: 'Duduk lagi. Pindah lagi.' }] }];
    const meet: Action[] = has(other) ? [{ narrate: MEET_LINES }] : [];
    return [{ say: lines.map((text) => ({ text })) }, { set: flag }, ...meet];
  };
}

/** One busking stop. Needs the guitar first. */
function ngamen(flag: string, reply: { who?: string; text: string }[], idle: string): (has: Has) => Action[] {
  return (has) =>
    has(FLAG3.GITAR) && !has(flag)
      ? [{ say: [{ text: 'Aku nyanyi satu lagu sambil genjreng gitar.' }, ...reply] }, { set: flag }]
      : [{ say: [{ text: idle }] }];
}

export const JALANAN: MapDef = {
  id: 'jalanan',
  flagsKey: FLAGS3_KEY,
  build: () => {
    const m = buildBandung();
    m.sprite(19, 19, 'nasi', false).sprite(17, 19, 'gitar', false);
    return m;
  },
  // Wandering alone is ambient; once Zain belongs somewhere, the warm town theme comes back.
  music: (has) => (has(FLAG3.GABUNG) ? TRACKS.town : TRACKS.contemplation),
  tint: () => ({ color: 0x3a2412, alpha: 0.18 }),
  spawn: { tx: 30, ty: 10 },

  npcs: [
    { id: 'ikat', sprite: 'punk1', at: GANG.ikat, face: 'down' },
    { id: 'merah', sprite: 'punk2', at: GANG.merah, face: 'left' },
    {
      id: 'kupluk',
      sprite: 'punk3',
      at: { tx: 33, ty: 11 },
      face: 'left',
      show: (has) => has(FLAG3.MAKAN_DATANG) && !has(FLAG3.MAKAN_DONE),
      follow: (has) => has(FLAG3.IKUT_KUPLUK) && !has(FLAG3.MAKAN_DONE),
    },
    { id: 'kupluk-gang', sprite: 'punk3', at: GANG.kupluk, face: 'up', show: (has) => has(FLAG3.MAKAN_DONE) },
    { id: 'om-botak', sprite: 'bapak', at: { tx: 27, ty: 18 }, face: 'up' },
    { id: 'om-helm', sprite: 'pekerja', at: { tx: 35, ty: 10 }, face: 'left' },
  ],

  onEnter: (has) => (has(FLAG3.J_INTRO) ? [] : [{ narrate: JALAN_INTRO }, { set: FLAG3.J_INTRO }]),

  objective: (has) =>
    !wandered(has)
      ? 'Jalan tanpa tujuan'
      : !has(FLAG3.GABUNG)
        ? 'Anak-anak di dekat warung'
        : !has(FLAG3.MAKAN_DATANG)
          ? 'Ngobrol dengan Si Rambut Merah'
          : !has(FLAG3.IKUT_KUPLUK)
            ? 'Cari Si Kupluk di depan warnet'
            : !has(FLAG3.MAKAN_DONE)
              ? 'Ajak Si Kupluk ke yang lain'
              : !has(FLAG3.RAHASIA)
                ? 'Ngobrol dengan Si Rambut Merah'
                : !has(FLAG3.GITAR)
                  ? 'Ngobrol dengan Si Ikat Kepala'
                  : ngamenDone(has) < NGAMEN_FLAGS.length
                    ? `Ngamen ${ngamenDone(has)}/${NGAMEN_FLAGS.length}`
                    : 'Kembali ke yang lain',

  interactables: [
    {
      id: 'bangku',
      at: BENCH_SPOT,
      script: sit(FLAG3.DUDUK1, FLAG3.DUDUK2, ['Duduk di pinggir jalan. Pindah tempat. Duduk lagi.']),
    },
    {
      id: 'halte',
      at: HALTE,
      script: sit(FLAG3.DUDUK2, FLAG3.DUDUK1, ['Lontang-lantung.', 'Kalau ada yang tanya mau ke mana, aku sendiri nggak tahu jawabannya.']),
    },
    {
      id: 'ikat',
      at: { npc: 'ikat' },
      script: (has) =>
        !wandered(has)
          ? [{ say: [{ text: 'Segerombolan anak nongkrong di dekat warung. Aku cuma lewat.' }] }]
          : !has(FLAG3.DEKAT1)
            ? [{ say: [{ text: 'Awalnya aku cuma sering ada di tempat yang sama dengan mereka.' }] }, { set: FLAG3.DEKAT1 }]
            : !has(FLAG3.DEKAT2)
              ? [{ say: [{ text: 'Lama-lama ikut duduk.' }] }, { set: FLAG3.DEKAT2 }]
              : !has(FLAG3.GABUNG)
                ? [
                    {
                      say: [
                        { who: IKAT, text: 'Kamu lagi, kamu lagi. Sering banget nongkrong di sini.' },
                        { who: IKAT, text: 'Sini, gabung aja.' },
                        { text: 'Lama-lama ikut ngobrol. Dan tanpa sadar, aku sudah jadi bagian dari mereka.' },
                      ],
                    },
                    { set: FLAG3.GABUNG },
                  ]
                : !has(FLAG3.MAKAN_DATANG)
                  ? [{ say: [{ who: IKAT, text: 'Si Rambut Merah bawa nasi bungkus tuh.' }] }]
                  : !has(FLAG3.MAKAN_DONE) && !has(FLAG3.IKUT_KUPLUK)
                    ? [{ say: [{ who: IKAT, text: 'Si Kupluk belum datang. Biasanya dia di depan warnet.' }] }]
                    : !has(FLAG3.MAKAN_DONE)
                      ? [
                          { narrate: MAKAN_LINES },
                          { set: FLAG3.MAKAN_DONE },
                          { goto: { scene: 'world', data: { map: 'jalanan', spawn: { tx: 18, ty: 20 } } } },
                        ]
                      : has(FLAG3.RAHASIA) && !has(FLAG3.GITAR)
                        ? [
                            { say: [{ who: IKAT, text: 'Ayo cari uang. Kita ngamen.' }, { text: 'Si Ikat Kepala nyodorin gitar ke aku.' }] },
                            { set: FLAG3.GITAR },
                          ]
                        : has(FLAG3.GITAR) && ngamenDone(has) === NGAMEN_FLAGS.length
                          ? [{ say: [{ who: IKAT, text: 'Lumayan. Cukup buat makan bareng besok.' }] }, { end: ENDING3 }]
                          : [{ say: [{ who: IKAT, text: 'Santai aja di sini.' }] }],
    },
    {
      id: 'merah',
      at: { npc: 'merah' },
      script: (has) =>
        has(FLAG3.GABUNG) && !has(FLAG3.MAKAN_DATANG)
          ? [
              { say: [{ who: MERAH, text: 'Makanan datang!' }] },
              {
                choose: {
                  prompt: { text: 'Nasi bungkusnya sudah di depan mata. Perut lapar sekali.' },
                  options: [
                    {
                      label: 'Langsung makan',
                      ok: false,
                      reply: [
                        { who: IKAT, text: 'Eh, tunggu. Si Kupluk belum datang.' },
                        { who: IKAT, text: 'Di sini makan harus bareng. Belum kumpul semua, nggak ada yang makan duluan.' },
                      ],
                    },
                    { label: 'Tunggu yang lain', ok: true, reply: [{ who: MERAH, text: 'Nah. Si Kupluk mana ya?' }] },
                  ],
                },
              },
              { set: FLAG3.MAKAN_DATANG },
            ]
          : has(FLAG3.MAKAN_DONE) && !has(FLAG3.RAHASIA)
            ? [
                { say: [{ who: MERAH, text: 'Eh, rumahmu di mana sih? Orang tuamu kerja apa?' }] },
                {
                  choose: {
                    prompt: { text: 'Gimana jawabnya?' },
                    options: [
                      {
                        label: 'Cerita jujur',
                        ok: false,
                        reply: [{ text: 'Kata-katanya sudah di ujung lidah. Tapi aku takut kalau mereka tahu, aku bakal dianggap orang luar.' }],
                      },
                      {
                        label: 'Ngeles, ganti topik',
                        ok: true,
                        reply: [
                          { who: ZAIN, text: 'Ah, biasa aja. Nggak penting.' },
                          { text: 'Sebenarnya secara ekonomi aku nggak kekurangan. Di rumah ada makanan, ada uang, ada atap. Tapi aku nggak pernah cerita.' },
                          { text: 'Jadi aku tutupi semuanya dan menjalani hidup seperti mereka.' },
                        ],
                      },
                    ],
                  },
                },
                { set: FLAG3.RAHASIA },
              ]
            : [{ say: [{ who: MERAH, text: has(FLAG3.GABUNG) ? 'Kenyang juga ya, hehe.' : '...' }] }],
    },
    {
      id: 'kupluk',
      at: { npc: 'kupluk' },
      script: (has) =>
        has(FLAG3.IKUT_KUPLUK)
          ? []
          : [{ say: [{ who: KUPLUK, text: 'Mereka nungguin aku? Ya ampun. Ayo.' }] }, { set: FLAG3.IKUT_KUPLUK }],
    },
    {
      id: 'kupluk-gang',
      at: { npc: 'kupluk-gang' },
      script: () => [{ say: [{ who: KUPLUK, text: 'Makasih udah dijemput.' }] }],
    },
    {
      id: 'om-botak',
      at: { npc: 'om-botak' },
      script: ngamen(FLAG3.N_BOTAK, [{ who: OM_BOTAK, text: 'Nih, Dek. Buat beli makan.' }], 'Om botak lagi duduk nunggu bus.'),
    },
    {
      id: 'om-helm',
      at: { npc: 'om-helm' },
      script: ngamen(FLAG3.N_HELM, [{ who: OM_HELM, text: 'Lumayan suaranya. Nih.' }], 'Om helm baru pulang kerja.'),
    },
    {
      id: 'warung',
      at: WARUNG,
      script: ngamen(FLAG3.N_WARUNG, [{ text: 'Ibu warung ngasih receh, sambil geleng-geleng kepala.' }], 'Warung langganan.'),
    },
  ],
};
