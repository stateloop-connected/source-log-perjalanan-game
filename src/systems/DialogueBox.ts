import Phaser from 'phaser';
import { COLOR, FONT, TYPE_SPEED } from '../data/config';
import type { Line } from '../story/types';
import { Sfx } from './Sfx';

/**
 * Kotak dialog di bawah layar dengan efek mesin tik, plus mode pilihan.
 * Menempel ke kamera (scrollFactor 0), jadi tidak ikut bergeser saat peta di-scroll.
 *
 * Dialog. Tekan lanjut saat masih mengetik = tampilkan penuh, tekan lagi = baris berikutnya.
 * Pilihan. Atas/bawah memilih, lanjut mengonfirmasi, atau ketuk opsinya langsung.
 */
export class DialogueBox {
  private readonly root: Phaser.GameObjects.Container;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly arrow: Phaser.GameObjects.Text;
  private readonly optionTexts: Phaser.GameObjects.Text[] = [];
  private readonly width: number;

  private lines: Line[] = [];
  private index = 0;
  private shown = 0;
  private typing = false;
  private lastSoundAt = 0;
  private onDone?: () => void;

  private options: string[] = [];
  private selected = 0;
  private onChoose?: (i: number) => void;

  constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const pad = 8;
    const h = 74;
    this.width = width - pad * 2;
    const top = height - h - pad;

    const bg = scene.add.graphics();
    bg.fillStyle(COLOR.panel, 0.95).fillRoundedRect(0, 0, this.width, h, 4);
    bg.lineStyle(1, COLOR.panelEdge, 1).strokeRoundedRect(0.5, 0.5, this.width - 1, h - 1, 4);

    this.nameText = scene.add.text(10, 8, '', { fontFamily: FONT, fontSize: '8px', color: COLOR.name });
    this.bodyText = scene.add.text(10, 22, '', {
      fontFamily: FONT,
      fontSize: '8px',
      color: COLOR.text,
      lineSpacing: 6,
      wordWrap: { width: this.width - 20, useAdvancedWrap: true },
    });
    this.arrow = scene.add.text(this.width - 16, h - 14, '▼', { fontFamily: FONT, fontSize: '8px', color: COLOR.dim });
    scene.tweens.add({ targets: this.arrow, y: h - 12, duration: 400, yoyo: true, repeat: -1 });

    this.root = scene.add.container(pad, top, [bg, this.nameText, this.bodyText, this.arrow]);
    this.root.setScrollFactor(0).setDepth(100_000).setVisible(false);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  get isChoosing(): boolean {
    return this.isOpen && this.onChoose !== undefined;
  }

  open(lines: Line[], onDone?: () => void): void {
    this.clearOptions();
    if (lines.length === 0) {
      onDone?.();
      return;
    }
    this.lines = lines;
    this.index = 0;
    this.onDone = onDone;
    this.root.setVisible(true);
    this.showLine();
  }

  /** Tampilkan pertanyaan beserta opsinya. Callback menerima index opsi yang dipilih. */
  choose(prompt: Line, options: string[], onChoose: (i: number) => void): void {
    this.clearOptions();
    this.lines = [prompt];
    this.index = 0;
    this.root.setVisible(true);
    this.showLine();
    this.shown = prompt.text.length;
    this.render();

    this.options = options;
    this.onChoose = onChoose;
    this.arrow.setVisible(false);
    const startY = this.bodyText.y + this.bodyText.height + 6;
    this.options.forEach((_label, i) => {
      const t = this.scene.add
        .text(14, startY + i * 13, '', { fontFamily: FONT, fontSize: '8px', color: COLOR.dim })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.select(i))
        .on('pointerup', () => {
          this.select(i);
          this.confirm();
        });
      this.root.add(t);
      this.optionTexts.push(t);
    });
    this.select(0);
  }

  move(delta: number): void {
    if (!this.isChoosing) return;
    this.select((this.selected + delta + this.options.length) % this.options.length);
    Sfx.select();
  }

  /** Tombol lanjut. Di mode pilihan berarti konfirmasi. */
  advance(): void {
    if (!this.isOpen) return;
    if (this.isChoosing) {
      this.confirm();
      return;
    }
    if (this.typing) {
      this.shown = this.current.text.length;
      this.render();
      return;
    }
    this.index += 1;
    Sfx.advance();
    if (this.index >= this.lines.length) {
      this.root.setVisible(false);
      const done = this.onDone;
      this.onDone = undefined;
      done?.();
      return;
    }
    this.showLine();
  }

  update(deltaMs: number): void {
    if (!this.isOpen || !this.typing) return;
    this.shown = Math.min(this.current.text.length, this.shown + (deltaMs / 1000) * TYPE_SPEED);
    this.render();
  }

  private confirm(): void {
    const cb = this.onChoose;
    const i = this.selected;
    this.clearOptions();
    this.root.setVisible(false);
    Sfx.confirm();
    cb?.(i);
  }

  private select(i: number): void {
    this.selected = i;
    this.optionTexts.forEach((t, j) => t.setText(`${j === i ? '>' : ' '} ${this.options[j]}`).setColor(j === i ? COLOR.name : COLOR.dim));
  }

  private clearOptions(): void {
    for (const t of this.optionTexts) t.destroy();
    this.optionTexts.length = 0;
    this.options = [];
    this.onChoose = undefined;
  }

  private get current(): Line {
    return this.lines[this.index];
  }

  private showLine(): void {
    this.shown = 0;
    this.lastSoundAt = 0;
    this.typing = true;
    const who = this.current.who;
    this.nameText.setText(who ?? '');
    this.bodyText.setY(who ? 22 : 12).setColor(who ? COLOR.text : COLOR.dim);
    this.render();
  }

  private render(): void {
    const full = this.current.text;
    const n = Math.floor(this.shown);
    if (n > this.lastSoundAt + 1) {
      Sfx.type();
      this.lastSoundAt = n;
    }
    this.bodyText.setText(full.slice(0, n));
    this.typing = n < full.length;
    this.arrow.setVisible(!this.typing && !this.onChoose);
  }
}
