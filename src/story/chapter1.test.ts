import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { Flags } from '../systems/Flags';
import { AFTER_WARNET, CARD_BANDUNG, CARD_MALANG, ENDING, FLAG, MALANG_INTRO, PROLOGUE, SITI_HOUSE, WARNET } from './chapter1';
import type { Action, Line, MapDef } from './types';

const ORDER = Object.values(FLAG);

/** Semua baris teks dalam daftar aksi, termasuk prompt & jawaban pilihan. */
function linesOf(actions: Action[]): Line[] {
  return actions.flatMap((a): Line[] => {
    if ('say' in a) return a.say;
    if ('narrate' in a) return a.narrate;
    if ('end' in a) return a.end;
    if ('choose' in a) return [a.choose.prompt, ...a.choose.options.flatMap((o) => [{ text: o.label }, ...o.reply])];
    return [];
  });
}

/** Evaluasi skrip di setiap titik progres (prefix urutan flag). */
function everyState<T>(fn: (has: (f: string) => boolean) => T[]): T[] {
  const out: T[] = [];
  for (let n = 0; n <= ORDER.length; n++) {
    const set = new Set(ORDER.slice(0, n));
    out.push(...fn((f) => set.has(f as never)));
  }
  return out;
}

function allLines(): Line[] {
  const maps = Object.values(MAPS);
  return [
    ...PROLOGUE.map((text) => ({ text })),
    ...[CARD_BANDUNG, CARD_MALANG].flatMap((c) => [{ text: c.caption }]),
    ...SITI_HOUSE,
    ...AFTER_WARNET,
    ...MALANG_INTRO,
    ...ENDING,
    ...WARNET.intro,
    ...[WARNET.chatBuy, WARNET.chatJoki, WARNET.chatThanks].map((c) => ({ text: c.text })),
    ...everyState((has) => maps.flatMap((m) => [...linesOf(m.onEnter(has)), ...m.interactables.flatMap((i) => linesOf(i.script(has)))])),
    ...everyState((has) => maps.map((m) => ({ text: m.objective(has) ?? '' }))),
  ];
}

describe('gaya tulisan', () => {
  it('teks cerita tanpa titik dua dan tanpa em dash', () => {
    for (const l of allLines()) expect(l.text, l.text).not.toMatch(/[:—]/);
  });

  it('tiap pertanyaan punya tepat satu jawaban benar', () => {
    const choices = everyState((has) =>
      Object.values(MAPS).flatMap((m) => m.interactables.flatMap((i) => i.script(has).filter((a) => 'choose' in a))),
    );
    expect(choices.length).toBeGreaterThan(0);
    for (const c of choices) if ('choose' in c) expect(c.choose.options.filter((o) => o.ok)).toHaveLength(1);
  });
});

describe('peta', () => {
  it.each(Object.values(MAPS))('$id. id interaksi unik, NPC yang dirujuk ada', (m: MapDef) => {
    const ids = m.interactables.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const npcs = new Set(m.npcs.map((n) => n.id));
    for (const i of m.interactables) if ('npc' in i.at) expect(npcs.has(i.at.npc), i.id).toBe(true);
  });

  it.each(Object.values(MAPS))('$id. titik spawn dan NPC tidak berada di tile padat', (m: MapDef) => {
    const g = m.build();
    expect(g.solid[m.spawn.ty][m.spawn.tx], 'spawn').toBe(false);
    for (const n of m.npcs) expect(g.solid[n.at.ty][n.at.tx], n.id).toBe(false);
  });
});

describe('playthrough Chapter 1', () => {
  /** Jalankan skrip seperti WorldScene, memilih jawaban benar. Kembalikan aksi goto/end yang ditemui. */
  function play(map: MapDef, id: string, flags: Set<string>): Action[] {
    const has = (f: string) => flags.has(f);
    const i = map.interactables.find((x) => x.id === id)!;
    const exits: Action[] = [];
    for (const a of i.script(has)) {
      if ('set' in a) flags.add(a.set);
      if ('goto' in a || 'end' in a) exits.push(a);
    }
    return exits;
  }

  it('bisa ditamatkan dari awal sampai akhir', () => {
    const f = new Set<string>([FLAG.INTRO]);
    const { bandung, malang } = MAPS;

    play(bandung, 'siti', f);
    expect(f.has(FLAG.DIAJAK_SITI)).toBe(true);
    play(bandung, 'pintu-siti', f);
    expect(f.has(FLAG.SITI_DONE)).toBe(true);

    const toWarnet = play(bandung, 'warnet', f);
    expect(toWarnet).toEqual([{ goto: { scene: 'warnet' } }]);
    f.add(FLAG.WARNET_DONE); // dipasang WarnetScene saat keluar

    const toMalang = play(bandung, 'halte', f);
    expect(toMalang[0] && 'goto' in toMalang[0] && toMalang[0].goto.scene).toBe('story');

    for (const id of ['nenek', 'meja', 'keran', 'nenek']) play(malang, id, f);
    expect(f.has(FLAG.BUNGKUS_DONE)).toBe(true);
    const end = play(malang, 'kakek', f);
    expect(end.some((a) => 'end' in a)).toBe(true);
  });

  it('halte tidak bisa dipakai sebelum ke warnet', () => {
    const f = new Set<string>([FLAG.INTRO, FLAG.DIAJAK_SITI, FLAG.SITI_DONE]);
    expect(play(MAPS.bandung, 'halte', f)).toEqual([]);
  });
});

describe('Flags', () => {
  function memStorage() {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    };
  }

  it('progres bertahan antar sesi', () => {
    const s = memStorage();
    new Flags('k', s).add('a');
    expect(new Flags('k', s).has('a')).toBe(true);
  });

  it('reset menghapus progres tersimpan', () => {
    const s = memStorage();
    const f = new Flags('k', s);
    f.add('a');
    f.reset();
    expect(new Flags('k', s).has('a')).toBe(false);
  });

  it('data rusak tidak bikin crash', () => {
    const s = memStorage();
    s.setItem('k', '{bukan json');
    expect(new Flags('k', s).has('a')).toBe(false);
  });
});
