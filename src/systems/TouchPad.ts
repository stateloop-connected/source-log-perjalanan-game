import Phaser from 'phaser';
import { FONT } from '../data/config';

const STICK_RADIUS = 26;
const DEADZONE = 0.18;

/** True on phones and tablets, false on desktops even if they have a touchscreen. */
export function isTouchDevice(scene: Phaser.Scene): boolean {
  const d = scene.sys.game.device;
  return d.input.touch && !d.os.desktop;
}

/**
 * On-screen controls for phones.
 *
 * Left part of the screen: an analog stick that appears wherever the thumb lands.
 * Bottom right: an "OK" button (talk, advance dialogue, confirm).
 * Top right: fullscreen toggle, where the browser supports it (Android; not iPhone Safari).
 */
export class TouchPad {
  /** Movement vector, length 0..1. */
  readonly vector = new Phaser.Math.Vector2();
  private stickPointer?: number;
  private readonly base: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly button: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    onAction: () => void,
  ) {
    const { width, height } = scene.scale;
    scene.input.addPointer(2); // stick + button at the same time

    this.base = scene.add.circle(0, 0, STICK_RADIUS, 0xffffff, 0.12).setStrokeStyle(1, 0xffffff, 0.35);
    this.knob = scene.add.circle(0, 0, 11, 0xffffff, 0.35);
    for (const o of [this.base, this.knob]) o.setScrollFactor(0).setDepth(99_000).setVisible(false);

    const r = 20;
    const bg = scene.add.circle(0, 0, r, 0xf2cc60, 0.85).setStrokeStyle(2, 0x0b0f18, 0.6);
    const label = scene.add.text(0, 0, 'OK', { fontFamily: FONT, fontSize: '8px', color: '#0b0f18' }).setOrigin(0.5);
    this.button = scene.add.container(width - r - 12, height - r - 12, [bg, label]).setScrollFactor(0).setDepth(99_000);
    this.button.setSize(r * 2 + 8, r * 2 + 8).setInteractive({ useHandCursor: false });
    this.button.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation();
      this.button.setScale(0.9);
      onAction();
    });
    this.button.on('pointerup', () => this.button.setScale(1));
    this.button.on('pointerout', () => this.button.setScale(1));

    if (scene.sys.game.device.fullscreen.available) {
      const fs = scene.add
        .text(width - 6, 6, '[ ]', { fontFamily: FONT, fontSize: '8px', color: '#e6ebf5', backgroundColor: '#0b0f18', padding: { x: 3, y: 3 } })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(99_000)
        .setAlpha(0.8)
        .setInteractive();
      fs.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
        else scene.scale.startFullscreen();
      });
    }

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointerdown', this.onDown, this);
      scene.input.off('pointermove', this.onMove, this);
      scene.input.off('pointerup', this.onUp, this);
    });
  }

  /** The stick owns this pointer, so a release should not count as a tap. */
  owns(p: Phaser.Input.Pointer): boolean {
    return this.stickPointer === p.id;
  }

  /** Hide the controls while a dialogue box covers the bottom of the screen. */
  setVisible(v: boolean): void {
    this.button.setVisible(v);
    if (!v) this.release();
  }

  private onDown(p: Phaser.Input.Pointer, over: unknown[]): void {
    if (over.length > 0 || this.stickPointer !== undefined || !this.button.visible) return;
    if (p.x > this.scene.scale.width * 0.6) return; // right side is for taps and the button
    this.stickPointer = p.id;
    this.base.setPosition(p.x, p.y).setVisible(true);
    this.knob.setPosition(p.x, p.y).setVisible(true);
    this.vector.set(0, 0);
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (p.id !== this.stickPointer) return;
    const dx = p.x - this.base.x;
    const dy = p.y - this.base.y;
    const len = Math.hypot(dx, dy);
    const k = len > STICK_RADIUS ? STICK_RADIUS / len : 1;
    this.knob.setPosition(this.base.x + dx * k, this.base.y + dy * k);
    const mag = Math.min(1, len / STICK_RADIUS);
    if (mag < DEADZONE) this.vector.set(0, 0);
    else this.vector.set((dx / len) * mag, (dy / len) * mag);
  }

  private onUp(p: Phaser.Input.Pointer): void {
    if (p.id === this.stickPointer) {
      // Defer one tick so the scene's own pointerup handler can still ask owns().
      this.scene.time.delayedCall(0, () => this.release());
    }
  }

  private release(): void {
    this.stickPointer = undefined;
    this.vector.set(0, 0);
    this.base.setVisible(false);
    this.knob.setVisible(false);
  }
}
