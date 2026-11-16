import Phaser from 'phaser';
import { COLOR, FONT } from '../data/config';
import { CARD_BANDUNG, PROLOGUE, PROLOGUE_COMMAND } from '../story/chapter1';
import { Music, MUSIC_VOLUME, TRACKS } from '../systems/Music';
import { Sfx } from '../systems/Sfx';

const PROMPT = 'zain@malang:~/hidup/log$ ';
/** Huruf per detik. Lebih lambat dari dialog, biar terasa dibaca. */
const CPS = 32;

export interface StoryData {
  /** Perintah terminal yang diketik di awal. Kosong = tanpa baris terminal. */
  command?: string;
  lines?: string[];
  card: { label: string; title: string; caption: string };
  next: { scene: string; data?: object };
}

/** Default = prolog Chapter 1, dipakai saat datang dari layar judul. */
const PROLOGUE_DATA: StoryData = {
  command: PROLOGUE_COMMAND,
  lines: PROLOGUE,
  card: CARD_BANDUNG,
  next: { scene: 'world', data: { map: 'bandung' } },
};

/**
 * Layar cerita di atas latar gelap. Perintah terminal (opsional), baris-baris kisah
 * satu per satu, lalu kartu judul. Dipakai untuk prolog dan perpindahan kota.
 * Enter/ketuk mempercepat, Esc atau "lewati" loncat ke kartu.
 */
export class StoryScene extends Phaser.Scene {
  private d!: StoryData;
  private story!: Phaser.GameObjects.Text;
  private index = -1;
  private shown = 0;
  private holdUntil = 0;
  private phase: 'command' | 'lines' | 'card' | 'done' = 'command';
  private lastTick = 0;

  constructor() {
    super('story');
  }

  init(data: Partial<StoryData>): void {
    this.d = data?.card ? (data as StoryData) : PROLOGUE_DATA;
    this.index = -1;
    this.phase = 'command';
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLOR.bg).fadeIn(500, 11, 15, 24);
    Music.play(this, TRACKS.contemplation, MUSIC_VOLUME.prologue, 2000);

    this.story = this.add
      .text(width / 2, height / 2, '', {
        fontFamily: FONT,
        fontSize: '8px',
        color: COLOR.text,
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: width - 100, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    const skip = this.add
      .text(width - 10, height - 10, 'lewati >>', { fontFamily: FONT, fontSize: '8px', color: '#5a6478' })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => skip.setColor(COLOR.name))
      .on('pointerout', () => skip.setColor('#5a6478'))
      .on('pointerup', () => this.showCard());

    const kb = this.input.keyboard!;
    kb.on('keydown-ESC', () => this.showCard());
    kb.on('keydown-M', () => Sfx.toggleMute(this.sound));
    for (const k of ['ENTER', 'SPACE', 'E']) kb.on(`keydown-${k}`, () => this.hurry());
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, over: unknown[]) => {
      if (over.length === 0) this.hurry();
    });

    const command = this.d.command;
    if (!command) {
      this.time.delayedCall(500, () => this.nextLine());
      return;
    }
    const prompt = this.add.text(14, 14, PROMPT, { fontFamily: FONT, fontSize: '8px', color: '#7ee787' });
    const cmd = this.add.text(14 + prompt.width, 14, '', { fontFamily: FONT, fontSize: '8px', color: COLOR.text });
    let n = 0;
    this.time.addEvent({
      delay: 70,
      startAt: -500,
      repeat: command.length - 1,
      callback: () => {
        if (this.phase !== 'command') return;
        cmd.setText(command.slice(0, ++n));
        Sfx.type();
        if (n === command.length) this.time.delayedCall(700, () => this.nextLine());
      },
    });
  }

  private get lines(): string[] {
    return this.d.lines ?? [];
  }

  private hurry(): void {
    if (this.phase === 'lines') {
      const full = this.lines[this.index];
      if (this.shown < full.length) {
        this.shown = full.length;
        this.story.setText(full);
        this.holdUntil = this.time.now + 1500;
      } else this.nextLine();
    } else if (this.phase === 'card') this.leave();
  }

  private nextLine(): void {
    if (this.phase === 'card' || this.phase === 'done') return;
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.showCard();
      return;
    }
    this.phase = 'lines';
    this.shown = 0;
    this.holdUntil = Infinity;
    this.story.setText('');
    Sfx.advance();
  }

  override update(_t: number, delta: number): void {
    if (this.phase !== 'lines') return;
    const full = this.lines[this.index];
    if (this.shown < full.length) {
      this.shown = Math.min(full.length, this.shown + (delta / 1000) * CPS);
      this.story.setText(full.slice(0, Math.floor(this.shown)));
      if (this.time.now - this.lastTick > 70) {
        Sfx.type();
        this.lastTick = this.time.now;
      }
      if (this.shown >= full.length) this.holdUntil = this.time.now + Math.max(1800, full.length * 40);
    } else if (this.time.now >= this.holdUntil) this.nextLine();
  }

  private showCard(): void {
    if (this.phase === 'card' || this.phase === 'done') return;
    this.phase = 'card';
    this.children.removeAll(true);

    const { width, height } = this.scale;
    const cx = width / 2;
    const c = this.d.card;
    const label = this.add.text(cx, height / 2 - 34, c.label, { fontFamily: FONT, fontSize: '8px', color: COLOR.name }).setOrigin(0.5);
    const title = this.add.text(cx, height / 2 - 8, c.title, { fontFamily: FONT, fontSize: '24px', color: COLOR.text }).setOrigin(0.5);
    const line = this.add.rectangle(cx, height / 2 + 16, 60, 1, 0x5a6478).setScale(0, 1);
    const caption = this.add
      .text(cx, height / 2 + 32, c.caption, { fontFamily: FONT, fontSize: '8px', color: COLOR.dim, align: 'center', lineSpacing: 6, wordWrap: { width: 300, useAdvancedWrap: true } })
      .setOrigin(0.5, 0);

    for (const o of [label, title, caption]) o.setAlpha(0);
    Sfx.confirm();
    this.tweens.add({ targets: label, alpha: 1, duration: 500 });
    this.tweens.add({ targets: title, alpha: 1, duration: 700, delay: 300 });
    this.tweens.add({ targets: line, scaleX: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: caption, alpha: 1, duration: 700, delay: 1000 });
    this.time.delayedCall(4200, () => this.leave());
  }

  private leave(): void {
    if (this.phase === 'done') return;
    this.phase = 'done';
    this.cameras.main.fadeOut(700, 11, 15, 24);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(this.d.next.scene, this.d.next.data));
  }
}
