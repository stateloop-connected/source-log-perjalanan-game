/**
 * Bunyi kecil ala game jadul, disintesis langsung lewat Web Audio. Tanpa file audio.
 * Browser baru mengizinkan suara setelah ada interaksi pengguna, dan "PRESS START"
 * adalah interaksi pertama itu, jadi AudioContext dibuat secara malas.
 */
let ctx: AudioContext | undefined;
let muted = false;

function audio(): AudioContext | undefined {
  if (muted) return undefined;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return undefined;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.05, slideTo?: number): void {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const Sfx = {
  /** Ketukan mesin tik. Dibuat sangat pelan supaya tidak melelahkan. */
  type: () => tone(1400 + Math.random() * 200, 0.025, 'square', 0.012),
  select: () => tone(660, 0.07, 'square', 0.04),
  confirm: () => {
    tone(523, 0.09, 'square', 0.05);
    setTimeout(() => tone(784, 0.14, 'square', 0.05), 90);
  },
  advance: () => tone(880, 0.04, 'triangle', 0.04),
  /** Dentum rendah untuk "BRAK!" dari rumah yang ribut. */
  thud: () => tone(140, 0.18, 'sine', 0.08, 60),
  /** Matikan/nyalakan semua suara, efek dan BGM sekaligus. */
  toggleMute: (sound?: { mute: boolean }) => {
    muted = !muted;
    if (sound) sound.mute = muted;
    return muted;
  },
};
