import Phaser from 'phaser';
import { COLOR, FONT, VIEW } from './data/config';
import { BootScene } from './scenes/BootScene';
import { StoryScene } from './scenes/StoryScene';
import { TitleScene } from './scenes/TitleScene';
import { WarnetScene } from './scenes/WarnetScene';
import { WorldScene } from './scenes/WorldScene';

/** Phaser menggambar teks ke canvas, jadi font harus termuat sebelum teks pertama dibuat. */
async function loadFont(): Promise<void> {
  try {
    await document.fonts?.load(`8px ${FONT}`);
    await document.fonts?.ready;
  } catch {
    // Gagal? Phaser pakai monospace, game tetap jalan.
  }
}

let game: Phaser.Game | undefined;

void loadFont().then(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: VIEW.WIDTH,
    height: VIEW.HEIGHT,
    pixelArt: true,
    backgroundColor: COLOR.bg,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [BootScene, TitleScene, StoryScene, WorldScene, WarnetScene],
  });
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
});

if (import.meta.hot) import.meta.hot.dispose(() => game?.destroy(true));
