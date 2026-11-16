import Phaser from 'phaser';
import { COLOR, FONT, TILE } from '../data/config';
import { BANDUNG_ROAD, buildBandung } from '../maps/bandung';
import { CARD_BANDUNG, FLAG, FLAGS_KEY } from '../story/chapter1';
import { renderGridMap } from '../systems/renderGridMap';
import { Flags } from '../systems/Flags';
import { Music, MUSIC_VOLUME, TRACKS } from '../systems/Music';
import { Sfx } from '../systems/Sfx';

/**
 * Layar judul. Latarnya peta Bandung sungguhan yang bergeser pelan, dengan Zain
 * dan Siti berjalan di jalan utama. Alurnya PRESS START, lalu menu (kalau ada
 * progres tersimpan), lalu prolog atau langsung lanjut main.
 */
/** Peta terakhir yang dikunjungi, untuk "Lanjutkan". */
function resumeMap(): string {
  return new Flags(FLAGS_KEY).has(FLAG.M_INTRO) ? 'malang' : 'bandung';
}

export class TitleScene extends Phaser.Scene {
  private stage: 'press' | 'menu' | 'leaving' = 'press';
  private options: { label: string; run: () => void }[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private selected = 0;

  constructor() {
    super('title');
  }

  create(): void {
    this.stage = 'press';
    this.selected = 0;
    this.optionTexts = [];
    const { width, height } = this.scale;
    const cx = width / 2;

    this.buildBackdrop();

    // Gelapkan latar supaya teks terbaca, lebih gelap di tengah atas tempat judul.
    this.add.rectangle(0, 0, width, height, COLOR.bg, 0.55).setOrigin(0).setScrollFactor(0).setDepth(100_000);
    this.add.rectangle(0, 40, width, 92, COLOR.bg, 0.5).setOrigin(0).setScrollFactor(0).setDepth(100_000);
    this.add.rectangle(0, height - 22, width, 22, COLOR.bg, 0.7).setOrigin(0).setScrollFactor(0).setDepth(100_000);

    const ui = (x: number, y: number, text: string, size: number, color: string) =>
      this.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, color }).setScrollFactor(0).setDepth(100_001);

    // Baris terminal kecil yang mengetik sendiri, benang merah dengan cover artikel.
    const term = ui(12, 12, '', 8, '#7ee787');
    const cmd = 'zain@malang:~/hidup$ tail -f zain.log';
    let n = 0;
    this.time.addEvent({ delay: 45, repeat: cmd.length - 1, callback: () => term.setText(cmd.slice(0, ++n) + '_') });

    const title1 = ui(cx, 66, 'LOG PERJALANAN', 16, COLOR.text).setOrigin(0.5);
    const title2 = ui(cx, 92, 'HIDUP', 24, COLOR.name).setOrigin(0.5);
    title1.setShadow(2, 2, '#000000', 0, false, true);
    title2.setShadow(2, 2, '#000000', 0, false, true);
    ui(cx, 118, `${CARD_BANDUNG.label}. ${CARD_BANDUNG.title}`, 8, COLOR.dim).setOrigin(0.5);

    const press = ui(cx, 186, 'PRESS START', 8, COLOR.text).setOrigin(0.5);
    const pressHint = ui(cx, 202, 'Enter / ketuk layar', 8, COLOR.dim).setOrigin(0.5);
    this.tweens.add({ targets: press, alpha: 0.15, duration: 600, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [3] });

    ui(8, height - 8, 'M  suara', 8, COLOR.dim).setOrigin(0, 1);
    ui(width - 8, height - 8, 'prototipe v0.3', 8, COLOR.dim).setOrigin(1, 1);

    this.cameras.main.fadeIn(800, 11, 15, 24);
    Music.play(this, TRACKS.town, MUSIC_VOLUME.title, 1500);

    // ---- input ----
    const kb = this.input.keyboard!;
    const onConfirm = () => {
      if (this.stage === 'press') {
        Sfx.confirm();
        press.destroy();
        pressHint.destroy();
        this.openMenu();
      } else if (this.stage === 'menu') {
        Sfx.confirm();
        this.options[this.selected].run();
      }
    };
    kb.on('keydown-ENTER', onConfirm);
    kb.on('keydown-SPACE', onConfirm);
    kb.on('keydown-E', onConfirm);
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-W', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-S', () => this.move(1));
    kb.on('keydown-M', () => Sfx.toggleMute(this.sound));
    // Ketukan di luar opsi menu = PRESS START. Opsi menu punya handler sendiri.
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, over: unknown[]) => {
      if (this.stage === 'press' && over.length === 0) onConfirm();
    });
  }

  private buildBackdrop(): void {
    const grid = buildBandung();
    renderGridMap(this, grid, false);
    const W = grid.widthPx;
    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, grid.heightPx).setRoundPixels(true);
    cam.setScroll(0, 40);
    this.tweens.add({ targets: cam, scrollX: W - this.scale.width, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Zain dan Siti berjalan berdampingan di jalan utama, lalu muncul lagi dari kiri.
    const roadY = (BANDUNG_ROAD + 3) * TILE + 2;
    const zain = this.add.sprite(-20, roadY, 'zain').setOrigin(0.5, 1).play('zain-walk-right').setDepth(roadY);
    const siti = this.add.sprite(-38, roadY - 3, 'siti').setOrigin(0.5, 1).play('siti-walk-right').setDepth(roadY - 3);
    this.tweens.add({ targets: [zain, siti], x: `+=${W + 80}`, duration: 26000, repeat: -1 });
  }

  private openMenu(): void {
    const saved = new Flags(FLAGS_KEY);
    const fresh = () => {
      saved.reset();
      this.leave('story');
    };
    // Tanpa progres tersimpan tidak ada yang perlu dipilih, langsung ke prolog.
    if (!saved.has(FLAG.INTRO)) {
      fresh();
      return;
    }
    this.stage = 'menu';
    this.options = [
      { label: 'Lanjutkan', run: () => this.leave('world') },
      { label: 'Mulai dari awal', run: fresh },
    ];
    const cx = this.scale.width / 2;
    this.optionTexts = this.options.map((o, i) =>
      this.add
        .text(cx, 182 + i * 16, o.label, { fontFamily: FONT, fontSize: '8px', color: COLOR.text })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100_001)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.select(i))
        .on('pointerup', () => {
          this.select(i);
          Sfx.confirm();
          o.run();
        }),
    );
    this.select(0);
  }

  private move(d: number): void {
    if (this.stage !== 'menu') return;
    this.select((this.selected + d + this.options.length) % this.options.length);
    Sfx.select();
  }

  private select(i: number): void {
    this.selected = i;
    this.optionTexts.forEach((t, j) =>
      t.setText(j === i ? `> ${this.options[j].label} <` : this.options[j].label).setColor(j === i ? COLOR.name : COLOR.dim),
    );
  }

  private leave(next: 'story' | 'world'): void {
    if (this.stage === 'leaving') return;
    this.stage = 'leaving';
    this.cameras.main.fadeOut(600, 11, 15, 24);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(next, next === 'world' ? { map: resumeMap() } : undefined));
  }
}
