/**
 * Chapter 2. Untuk Siti. Teks diambil dari artikel "Untuk Siti" (Log Perjalanan Hidup #2).
 * Detail penyakit Siti sengaja tidak ditampilkan, sesuai permintaan penulis.
 *
 * Aturan gaya (dicek `npm test`). Tanpa titik dua dan tanpa em dash.
 */
import type { Line } from './types';

export const CHAPTER2_ID = 'ch2';
export const FLAGS2_KEY = `lph:${CHAPTER2_ID}`;

export const SITI = 'Siti';
export const ZAIN = 'Zain';

export const FLAG2 = {
  RS_INTRO: 'rumah-intro',
  PS_DONE: 'ps-done',
  MASAK_DONE: 'masak-done',
  SAKIT: 'sakit',
  JALAN_INTRO: 'jalan-intro',
  IKUT_JALAN: 'ikut-jalan',
  JALAN_DONE: 'jalan-done',
  KURSI_RODA: 'kursi-roda',
  IKUT_KURSI: 'ikut-kursi',
  KURSI_DONE: 'kursi-done',
  PERGI: 'pergi',
  PERGI_TOLD: 'pergi-told',
  MEM_STIK: 'kenangan-stik',
  MEM_MASAK: 'kenangan-masak',
  MEM_NANTI: 'kenangan-nanti',
} as const;

export const MEMORY_FLAGS = [FLAG2.MEM_STIK, FLAG2.MEM_MASAK, FLAG2.MEM_NANTI];

// ---------- prolog ----------

export const PROLOGUE2_COMMAND = 'cat 002-untuk-siti.log';
export const PROLOGUE2: string[] = [
  'Di tulisan sebelumnya aku cerita soal Siti. Teman kecilku di Bandung, yang rumahnya selalu jadi tujuanku setiap kali rumahku sendiri terlalu berisik.',
  'Ada satu hal yang belum aku ceritakan di sana.',
  'Siti sudah nggak ada.',
  'Sebelum lanjut ke cerita-cerita berikutnya, rasanya aku perlu menulis tentang dia dulu.',
];
export const CARD2 = { label: 'Chapter 2', title: 'Untuk Siti', caption: 'teman kecil yang dulu selalu jadi tempatku pulang' };

// ---------- rumah Siti ----------

export const ROOM_INTRO: Line[] = [
  { text: 'Siti itu hampir selalu ada. Waktu kecil aku nggak punya banyak hal yang bisa disebut tetap.' },
  { text: 'Kami satu kelas waktu SD. Di sekolah ketemu, pulang sekolah ketemu lagi.' },
];

export const PS_LINES: Line[] = [
  { text: 'Dia punya PS2 di rumahnya, dan itu sudah cukup jadi alasan buatku untuk hampir tinggal di sana.' },
  { text: 'Game favorit kami GTA San Andreas.' },
  { who: SITI, text: 'Gantian! Kamu sudah lama mainnya.' },
  { who: ZAIN, text: 'Bentar lagi, bentar lagi.' },
  { text: 'Dua anak SD rebutan stik, ketawa-ketawa nggak jelas tiap kali CJ ketabrak mobil.' },
];

export const SAKIT_LINES: Line[] = [
  { text: 'Orang tuanya juga begitu baik. Mereka nggak pernah bikin aku merasa jadi tamu.' },
  { text: 'Buatku Siti ya Siti, teman yang memang sudah seharusnya ada di situ.' },
  { text: 'Lalu Siti sakit.' },
  { text: 'Aku nggak mau cerita detail soal penyakitnya. Rasanya itu bukan bagian yang perlu diingat orang tentang dia.' },
];

// ---------- Bandung, setelah Siti sakit ----------

export const WALKER_LINES: Line[] = [
  { text: 'Yang aku ingat justru perubahannya, yang datang pelan-pelan.' },
  { text: 'Awalnya dia masih bisa jalan sendiri. Lalu dia mulai butuh alat bantu jalan.' },
];

export const NANTI_LINES: Line[] = [
  { who: SITI, text: 'Nanti kalau sudah besar, kamu mau jadi apa?' },
  { text: 'Kami tetap main. Tetap ngobrol. Bedanya, sekarang lebih banyak duduk daripada lari ke sana kemari.' },
  { text: 'Dan kami suka sekali membicarakan nanti. Nanti kalau sudah besar mau jadi apa, mau tinggal di mana, mau ngapain aja.' },
  { text: 'Rencana-rencana anak kecil yang nggak pernah kepikiran bakal nggak sempat dijalani.' },
];

export const KURSI_LINES: Line[] = [
  { text: 'Lalu kursi roda.' },
  { text: 'Waktu itu aku masih di Bandung. Jadi aku ada di sana, hampir setiap hari, di samping dia.' },
];

export const RENTAL_LINES: Line[] = [
  { text: 'Dulu dia yang selalu menemani aku setiap kali rumahku berisik.' },
  { text: 'Di masa itu, giliran aku yang menemani dia.' },
];

export const PERGI_LINES: Line[] = [{ text: 'Sampai akhirnya Siti pergi.' }];

export const AFTER_PERGI: Line[] = [
  { text: 'Aku nggak akan pura-pura bilang aku sudah baik-baik saja soal itu, atau bahwa semua ada hikmahnya. Ada hal yang memang cukup dirasakan saja.' },
  { text: 'Sejak itu aku seperti hidup dengan bayang-bayang Siti. Dia ada di banyak hal kecil yang mungkin nggak akan disadari orang lain.' },
];

export const MEMORY_LINES: Record<(typeof MEMORY_FLAGS)[number], string> = {
  [FLAG2.MEM_STIK]: 'Suaranya waktu rebutan stik PS.',
  [FLAG2.MEM_MASAK]: 'Gayanya waktu menyuruhku jadi pembeli di permainan masak-masakan.',
  [FLAG2.MEM_NANTI]: 'Obrolan kami tentang nanti.',
};

export const ENDING2: Line[] = [
  { text: 'Bahkan sekarang, waktu aku menulis ini, ingatan tentang dia masih jelas sekali.' },
  { text: 'Kalau sekarang aku ingat masa kecilku, kenangan di Bandung ternyata nggak cuma suara pertengkaran.' },
  { text: 'Ada rumah lain yang pintunya selalu terbuka. Ada orang tua lain yang mau menenangkan anak yang bukan anak mereka.' },
  { text: 'Dan ada Siti, yang menemaniku tanpa pernah minta apa-apa.' },
  { text: 'Mungkin itu juga sebabnya aku bisa tumbuh jadi orang yang cukup waras, hehe.' },
  { text: 'Terima kasih, Siti. Untuk semua hari yang kamu habiskan menemani anak yang nggak punya tempat lain untuk pulang.' },
];
