import Phaser from 'phaser';

export { MUSIC_VOLUME, TRACKS, type Track } from '../data/tracks';
import type { Track } from '../data/tracks';

let current: Phaser.Sound.BaseSound | undefined;
let currentKey: string | undefined;

function fadeTo(scene: Phaser.Scene, sound: Phaser.Sound.BaseSound, volume: number, ms: number, onDone?: () => void): void {
  scene.tweens.killTweensOf(sound);
  scene.tweens.add({ targets: sound, volume, duration: ms, onComplete: onDone });
}

/**
 * BGM global. Satu trek jalan sekaligus, dan tetap jalan saat pindah scene
 * (SoundManager milik game, bukan milik scene). Ganti trek = crossfade.
 *
 * Browser menahan suara sampai ada interaksi pertama (`sound.locked`); kalau masih
 * terkunci, pemutaran ditunda sampai event UNLOCKED.
 */
export const Music = {
  play(scene: Phaser.Scene, track: Track, volume: number, fadeMs = 800): void {
    const target = volume * track.gain;
    const start = () => {
      if (current && currentKey === track.key && current.isPlaying) {
        fadeTo(scene, current, target, fadeMs);
        return;
      }
      if (!scene.cache.audio.exists(track.key)) return; // trek belum dimuat, diam saja
      const old = current;
      if (old) fadeTo(scene, old, 0, fadeMs, () => old.destroy());
      current = scene.sound.add(track.key, { loop: true, volume: 0 });
      currentKey = track.key;
      current.play();
      fadeTo(scene, current, target, fadeMs);
    };
    if (scene.sound.locked) scene.sound.once(Phaser.Sound.Events.UNLOCKED, start);
    else start();
  },

  fadeOut(scene: Phaser.Scene, ms = 1200): void {
    const s = current;
    if (!s) return;
    current = undefined;
    currentKey = undefined;
    fadeTo(scene, s, 0, ms, () => s.destroy());
  },
};
