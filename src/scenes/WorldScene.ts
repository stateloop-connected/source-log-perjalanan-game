import Phaser from 'phaser';
import { COLOR, FONT, PLAYER, TILE } from '../data/config';
import type { CharKey, Facing } from '../data/tiles';
import { BANDUNG_NOISE_AT } from '../maps/bandung';
import { MAPS } from '../maps';
import { FLAG, FLAGS_KEY, NOISE } from '../story/chapter1';
import type { Action, At, Interactable, Line, MapDef } from '../story/types';
import { DialogueBox } from '../systems/DialogueBox';
import { Flags } from '../systems/Flags';
import { renderGridMap } from '../systems/renderGridMap';
import { Music, MUSIC_VOLUME, TRACKS } from '../systems/Music';
import { Sfx } from '../systems/Sfx';

/** Tap lebih singkat dari ini = "ketuk" (interaksi). Lebih lama = tahan untuk jalan. */
const TAP_MS = 180;

/** Pusat tile (px). */
const px = (a: At) => ({ x: a.tx * TILE + TILE / 2, y: a.ty * TILE + TILE / 2 });
/** Titik kaki karakter yang berdiri di tile itu. */
const feet = (a: At) => ({ x: a.tx * TILE + TILE / 2, y: a.ty * TILE + TILE - 1 });

export interface WorldData {
  map?: string;
  spawn?: At;
}

export class WorldScene extends Phaser.Scene {
  private def!: MapDef;
  private flags!: Flags;
  private player!: Phaser.Physics.Arcade.Sprite;
  private npcs = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private dialogue!: DialogueBox;
  private prompt!: Phaser.GameObjects.Text;
  private objective!: Phaser.GameObjects.Text;
  private shade!: Phaser.GameObjects.Rectangle;

  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'act', Phaser.Input.Keyboard.Key[]>;
  private facing: Facing = 'down';
  private busy = false;
  private ended = false;
  private pointerDownAt = 0;
  private spawnOverride?: At;

  constructor() {
    super('world');
  }

  init(data: WorldData): void {
    this.def = MAPS[data?.map ?? 'bandung'];
    this.spawnOverride = data?.spawn;
    this.npcs = new Map();
    this.busy = false;
    this.ended = false;
    this.facing = 'down';
  }

  create(): void {
    this.flags = new Flags(FLAGS_KEY);
    const has = (f: string) => this.flags.has(f);
    const grid = this.def.build();
    const solid = renderGridMap(this, grid, true)!;

    const start = feet(this.spawnOverride ?? this.def.spawn);
    this.player = this.makeChar('zain', start.x, start.y);
    this.physics.world.setBounds(0, 0, grid.widthPx, grid.heightPx);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, solid);

    for (const n of this.def.npcs) {
      if (n.show && !n.show(has)) continue;
      const p = feet(n.at);
      const s = this.makeChar(n.sprite, p.x, p.y).setImmovable(true);
      s.play(`${n.sprite}-idle-${n.face ?? 'down'}`);
      this.physics.add.collider(this.player, s);
      this.npcs.set(n.id, s);
    }

    const cam = this.cameras.main;
    cam.setBounds(0, 0, grid.widthPx, grid.heightPx).startFollow(this.player, true, 0.15, 0.15).setRoundPixels(true);
    cam.setBackgroundColor(COLOR.bg).fadeIn(500, 11, 15, 24);

    this.prompt = this.add
      .text(0, 0, '', { fontFamily: FONT, fontSize: '8px', color: '#0b0f18', backgroundColor: '#f2cc60', padding: { x: 3, y: 2 } })
      .setOrigin(0.5, 1)
      .setDepth(60_000)
      .setVisible(false);
    this.objective = this.add
      .text(8, 8, '', { fontFamily: FONT, fontSize: '8px', color: COLOR.text, backgroundColor: '#0b0f18', padding: { x: 4, y: 3 } })
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setDepth(90_000);
    this.shade = this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLOR.bg).setOrigin(0).setScrollFactor(0).setDepth(95_000).setAlpha(0);
    this.dialogue = new DialogueBox(this);

    this.setupInput();
    if (this.def.id === 'bandung') this.startNoise();
    Music.play(this, this.def.music, MUSIC_VOLUME.world, 1500);
    this.refreshObjective();
    this.run(this.def.onEnter(has));
  }

  // ---------- karakter ----------

  private makeChar(key: CharKey, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const s = this.physics.add.sprite(x, y, key, 1).setOrigin(0.5, 1);
    s.body!.setSize(10, 6).setOffset(3, 10);
    return s;
  }

  private face(s: Phaser.GameObjects.Sprite, target: { x: number; y: number }): void {
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const dir: Facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    s.play(`${s.texture.key}-idle-${dir}`);
  }

  // ---------- skrip cerita ----------

  private has = (f: string) => this.flags.has(f);

  /** Jalankan aksi satu per satu. */
  private run(actions: Action[]): void {
    if (actions.length === 0) {
      this.busy = false;
      this.refreshObjective();
      return;
    }
    this.busy = true;
    const [a, ...rest] = actions;
    const next = () => this.run(rest);

    if ('say' in a) this.dialogue.open(a.say, next);
    else if ('choose' in a) this.ask(a.choose.prompt, a.choose.options, next);
    else if ('set' in a) {
      this.flags.add(a.set);
      next();
    } else if ('walk' in a) {
      this.walkNpc(a.walk.npc, a.walk.path, a.walk.vanish);
      next();
    } else if ('narrate' in a) this.narrate(a.narrate, next);
    else if ('teleport' in a) {
      const p = feet(a.teleport);
      this.player.setPosition(p.x, p.y);
      next();
    } else if ('goto' in a) {
      const { scene, data } = a.goto;
      this.cameras.main.fadeOut(600, 11, 15, 24);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(scene, data));
    } else if ('end' in a) this.finishChapter(a.end);
  }

  /** Pertanyaan diulang sampai pemain memilih jawaban yang benar. */
  private ask(prompt: Line, options: { label: string; ok: boolean; reply: Line[] }[], next: () => void): void {
    this.dialogue.choose(
      prompt,
      options.map((o) => o.label),
      (i) => {
        const o = options[i];
        this.dialogue.open(o.reply, () => (o.ok ? next() : this.ask(prompt, options, next)));
      },
    );
  }

  private narrate(lines: Line[], next: () => void): void {
    this.tweens.add({
      targets: this.shade,
      alpha: 1,
      duration: 700,
      onComplete: () => this.dialogue.open(lines, () => this.tweens.add({ targets: this.shade, alpha: 0, duration: 700, onComplete: next })),
    });
  }

  private walkNpc(id: string, path: At[], vanish?: boolean): void {
    const s = this.npcs.get(id);
    if (!s) return;
    s.disableBody(true, false);
    const key = s.texture.key;
    let from = { x: s.x, y: s.y };
    const steps = path.map((p) => {
      const to = feet(p);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dir: Facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      const duration = Math.max(1, (Math.hypot(dx, dy) / PLAYER.SPEED) * 1000);
      from = to;
      return { x: to.x, y: to.y, duration, onStart: () => s.play(`${key}-walk-${dir}`, true) };
    });
    this.tweens.chain({
      targets: s,
      tweens: [...steps, ...(vanish ? [{ alpha: 0, duration: 250 }] : [])],
      onComplete: () => {
        if (vanish) {
          s.setVisible(false);
          this.npcs.delete(id);
        } else s.play(`${key}-idle-down`);
      },
    });
  }

  private finishChapter(lines: Line[]): void {
    this.ended = true;
    this.refreshObjective();
    Music.play(this, TRACKS.smallThings, MUSIC_VOLUME.ending, 2500);
    this.tweens.add({
      targets: this.shade,
      alpha: 1,
      duration: 1200,
      onComplete: () =>
        this.dialogue.open(lines, () => {
          const { width, height } = this.scale;
          const t1 = this.add.text(width / 2, height / 2 - 6, 'Bersambung.', { fontFamily: FONT, fontSize: '12px', color: COLOR.text });
          const t2 = this.add.text(width / 2, height / 2 + 16, 'ketuk / tekan E untuk kembali', { fontFamily: FONT, fontSize: '8px', color: COLOR.dim });
          for (const t of [t1, t2]) t.setOrigin(0.5).setScrollFactor(0).setDepth(96_000).setAlpha(0);
          this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 800 });
          this.flags.reset();
          this.time.delayedCall(700, () => {
            const back = () => this.scene.start('title');
            this.input.once('pointerup', back);
            for (const k of this.keys.act) k.once('down', back);
          });
        }),
    });
  }

  // ---------- interaksi ----------

  private where(i: Interactable): { x: number; y: number } | undefined {
    if ('npc' in i.at) {
      const s = this.npcs.get(i.at.npc);
      return s?.visible && s.body?.enable ? { x: s.x, y: s.y - 4 } : undefined;
    }
    return px(i.at);
  }

  private nearest(): { i: Interactable; x: number; y: number } | undefined {
    let best: { i: Interactable; x: number; y: number } | undefined;
    let bestD: number = PLAYER.REACH;
    for (const i of this.def.interactables) {
      if (i.show && !i.show(this.has)) continue;
      const p = this.where(i);
      if (!p) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y - 4, p.x, p.y);
      if (d <= bestD) {
        best = { i, ...p };
        bestD = d;
      }
    }
    return best;
  }

  private act(): void {
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    if (this.busy || this.ended) return;
    const t = this.nearest();
    if (!t) return;
    this.player.setVelocity(0);
    if ('npc' in t.i.at) {
      const s = this.npcs.get(t.i.at.npc);
      if (s) this.face(s, this.player);
    }
    this.run(t.i.script(this.has));
  }

  private setupInput(): void {
    const kb = this.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    const k = (code: number) => kb.addKey(code);
    this.keys = {
      up: [k(K.UP), k(K.W)],
      down: [k(K.DOWN), k(K.S)],
      left: [k(K.LEFT), k(K.A)],
      right: [k(K.RIGHT), k(K.D)],
      act: [k(K.E), k(K.SPACE), k(K.ENTER)],
    };
    for (const key of this.keys.act) key.on('down', () => this.act());
    for (const key of this.keys.up) key.on('down', () => this.dialogue.move(-1));
    for (const key of this.keys.down) key.on('down', () => this.dialogue.move(1));
    kb.on('keydown-M', () => Sfx.toggleMute(this.sound));
    // Key milik plugin keyboard bertahan antar restart scene; bersihkan supaya listener tidak menumpuk.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllKeys(true));

    this.input.on('pointerdown', () => (this.pointerDownAt = this.time.now));
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, over: unknown[]) => {
      // Ketukan pada opsi pilihan ditangani opsinya sendiri.
      if (over.length === 0 && this.time.now - this.pointerDownAt < TAP_MS) this.act();
    });
  }

  /** Teks "BRAK!" yang melayang dari rumah Zain sampai dia diajak Siti. */
  private startNoise(): void {
    const at = px(BANDUNG_NOISE_AT);
    this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        if (this.flags.has(FLAG.DIAJAK_SITI) || this.ended) return;
        const word = Phaser.Utils.Array.GetRandom(NOISE);
        const t = this.add
          .text(at.x + Phaser.Math.Between(-30, 30), at.y, word, { fontFamily: FONT, fontSize: '8px', color: '#ff9b5c', stroke: '#0b0f18', strokeThickness: 3 })
          .setOrigin(0.5)
          .setDepth(55_000);
        if (word.startsWith('BRAK')) Sfx.thud();
        this.tweens.add({ targets: t, y: t.y - 18, alpha: 0, duration: 1300, ease: 'Sine.easeOut', onComplete: () => t.destroy() });
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, at.x, at.y + 80) < 110) this.cameras.main.shake(80, 0.002);
      },
    });
  }

  private refreshObjective(): void {
    const o = this.ended ? undefined : this.def.objective(this.has);
    this.objective.setText(o ? `> ${o}` : '').setVisible(Boolean(o));
  }

  // ---------- loop ----------

  override update(_time: number, delta: number): void {
    this.dialogue.update(delta);
    this.updateMovement();
    this.player.setDepth(this.player.y);
    for (const s of this.npcs.values()) s.setDepth(s.y);
    this.updatePrompt();
  }

  private updateMovement(): void {
    const idle = () => {
      this.player.setVelocity(0);
      this.player.play(`zain-idle-${this.facing}`, true);
    };
    if (this.dialogue.isOpen || this.busy || this.ended) return idle();

    const down = (ks: Phaser.Input.Keyboard.Key[]) => ks.some((k) => k.isDown);
    let vx = (down(this.keys.right) ? 1 : 0) - (down(this.keys.left) ? 1 : 0);
    let vy = (down(this.keys.down) ? 1 : 0) - (down(this.keys.up) ? 1 : 0);

    const p = this.input.activePointer;
    if (vx === 0 && vy === 0 && p.isDown && this.time.now - this.pointerDownAt >= TAP_MS) {
      const dx = p.worldX - this.player.x;
      const dy = p.worldY - (this.player.y - 8);
      if (Math.hypot(dx, dy) > 6) {
        vx = dx;
        vy = dy;
      }
    }

    const len = Math.hypot(vx, vy);
    if (len === 0) return idle();
    this.player.setVelocity((vx / len) * PLAYER.SPEED, (vy / len) * PLAYER.SPEED);
    this.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down';
    this.player.play(`zain-walk-${this.facing}`, true);
  }

  private updatePrompt(): void {
    const t = this.dialogue.isOpen || this.busy || this.ended ? undefined : this.nearest();
    if (!t) {
      this.prompt.setVisible(false);
      return;
    }
    const touch = this.sys.game.device.input.touch && !this.sys.game.device.os.desktop;
    this.prompt
      .setText(touch ? 'ketuk' : 'E')
      .setPosition(t.x, t.y - ('npc' in t.i.at ? 14 : 8))
      .setVisible(true);
  }
}
