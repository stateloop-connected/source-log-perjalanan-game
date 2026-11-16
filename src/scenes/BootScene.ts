import Phaser from 'phaser';
import { TILE } from '../data/config';
import { CHAR_COL, CHARACTERS } from '../data/tiles';
import { TRACKS } from '../systems/Music';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.setPath('assets/');
    this.load.image('city', 'city.png');
    for (const c of CHARACTERS) this.load.spritesheet(c, `${c}.png`, { frameWidth: TILE, frameHeight: TILE });
    for (const t of Object.values(TRACKS)) if (t.preload) this.load.audio(t.key, t.path);
  }

  create(): void {
    // Frame = baris * 4 + kolom. Baris 0 diam, baris 1 & 2 langkah.
    for (const c of CHARACTERS) {
      for (const [dir, col] of Object.entries(CHAR_COL)) {
        this.anims.create({ key: `${c}-idle-${dir}`, frames: [{ key: c, frame: col }] });
        this.anims.create({
          key: `${c}-walk-${dir}`,
          frames: [col + 4, col, col + 8, col].map((frame) => ({ key: c, frame })),
          frameRate: 7,
          repeat: -1,
        });
      }
    }
    this.scene.start('title');
  }
}
