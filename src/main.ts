import Phaser from 'phaser';
import { COLOR, computeView, FONT } from './data/config';
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

/** Visible area. `visualViewport` follows the phone's address bar; innerWidth/Height do not. */
function screenSize(): { w: number; h: number } {
  const vv = window.visualViewport;
  return { w: vv?.width || window.innerWidth, h: vv?.height || window.innerHeight };
}

void loadFont().then(() => {
  const { w, h } = screenSize();
  const view = computeView(w, h);
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: view.width,
    height: view.height,
    pixelArt: true,
    backgroundColor: COLOR.bg,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [BootScene, TitleScene, StoryScene, WorldScene, WarnetScene],
  });
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;

  // The address bar showing/hiding and rotation change the visible area. FIT rescales the
  // canvas; refresh() makes Phaser re-measure after the browser has settled.
  let t: number | undefined;
  const refresh = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => game?.scale.refresh(), 150);
  };
  window.addEventListener('resize', refresh);
  window.addEventListener('orientationchange', refresh);
  window.visualViewport?.addEventListener('resize', refresh);
});

if (import.meta.hot) import.meta.hot.dispose(() => game?.destroy(true));
