/**
 * Chapter 3. Jalanan. Teks diambil dari artikel "Mi Instan, Warnet, dan Keluarga yang
 * Kutemukan di Jalan" (Log Perjalanan Hidup #3).
 *
 * Nama asli teman-teman jalanan tidak diketahui, jadi dipakai julukan deskriptif.
 * Kenakalan remaja hanya disebut di narasi, tidak dijadikan mekanik permainan.
 *
 * Aturan gaya (dicek `npm test`). Tanpa titik dua dan tanpa em dash.
 */
import type { Line } from './types';

export const FLAGS3_KEY = 'lph:ch3';

export const ZAIN = 'Zain';
export const IKAT = 'Si Ikat Kepala';
export const MERAH = 'Si Rambut Merah';
export const KUPLUK = 'Si Kupluk';
export const OM_BOTAK = 'Om botak';
export const OM_HELM = 'Om helm';

export const FLAG3 = {
  INTRO: 'sepi-intro',
  H1_WARNET: 'hari1-warnet',
  H1_RUMAH: 'hari1-rumah',
  H2_WARNET: 'hari2-warnet',
  H2_WARUNG: 'hari2-warung',
  H2_RUMAH: 'hari2-rumah',
  H3_WARNET: 'hari3-warnet',
  J_INTRO: 'jalan-intro',
  DUDUK1: 'duduk-bangku',
  DUDUK2: 'duduk-halte',
  DEKAT1: 'dekat-1',
  DEKAT2: 'dekat-2',
  GABUNG: 'gabung',
  MAKAN_DATANG: 'makan-datang',
  IKUT_KUPLUK: 'ikut-kupluk',
  MAKAN_DONE: 'makan-done',
  RAHASIA: 'rahasia',
  GITAR: 'gitar',
  N_BOTAK: 'ngamen-botak',
  N_HELM: 'ngamen-helm',
  N_WARUNG: 'ngamen-warung',
} as const;

export const NGAMEN_FLAGS = [FLAG3.N_BOTAK, FLAG3.N_HELM, FLAG3.N_WARUNG];

// ---------- prolog ----------

export const PROLOGUE3_COMMAND = 'cat 003-jalanan.log';
export const PROLOGUE3: string[] = [
  'Setelah Siti pergi, hidupku jadi sepi sekali.',
  'Aku kehilangan arah. Mau jadi apa, mau ngapain, aku nggak peduli. Ambisi apa pun rasanya hilang.',
];
export const CARD3 = { label: 'Chapter 3', title: 'Jalanan', caption: 'mi instan, warnet, dan keluarga yang kutemukan di jalan' };

// ---------- hari-hari sepi ----------

export const SEPI_LINES: Line[] = [
  { text: 'Orang di sekitarku sebenarnya banyak. Tapi nggak ada lagi rumah yang bisa aku datangi tanpa alasan.' },
  { text: 'Jadi aku kembali ke tempat yang paling aku kenal. Warnet.' },
];

export const DAY1_WARNET: Line[] = [
  { text: 'Hari-hariku waktu itu bisa diringkas jadi dua hal. Dota 2 dan mi instan.' },
  { text: 'Dari pagi sampai malam aku di warnet, push MMR. Menang, naik. Kalah, main lagi.' },
];
export const DAY1_HOME: Line[] = [
  { text: 'Di warnet makan mi instan. Pulang ke rumah, makan mi instan lagi.' },
  { text: 'Besoknya, sama lagi.' },
];
export const DAY2_WARNET: Line[] = [
  { text: 'Begitu terus sampai lupa hari.' },
  { text: 'Di dunia game setidaknya ada angka yang jelas naik turunnya, dan itu lebih gampang dipahami daripada hidupku sendiri.' },
];
export const WARUNG_LINES: Line[] = [{ text: 'Saking seringnya, aku sampai nyetok berbungkus-bungkus di rumah biar nggak perlu keluar beli.' }];
export const DAY2_HOME: Line[] = [
  { text: 'Kadang malas merebus, jadi mi-nya aku kremes saja langsung dari bungkusnya, bumbunya ditabur, lalu dimakan begitu saja.' },
  { text: 'Kalau ada ahli gizi yang baca bagian ini, mohon maaf, hehe.' },
];
export const DAY3_WARNET: Line[] = [
  { text: 'Lama-lama warnet pun membosankan.' },
  { text: 'MMR sudah nggak menarik. Layar yang sama, hero yang sama, kursi yang sama.' },
];

// ---------- jalanan ----------

export const JALAN_INTRO: Line[] = [{ text: 'Aku mulai lebih sering di luar. Jalan sendirian tanpa tujuan.' }];

export const MEET_LINES: Line[] = [
  { text: 'Di jalan itulah aku ketemu mereka.' },
  { text: 'Orang mungkin menyebut mereka anak punk. Anak jalanan. Segerombolan orang yang kalau lewat, banyak orang memilih menyeberang jalan supaya nggak papasan.' },
];

export const MAKAN_LINES: Line[] = [
  { text: 'Ada satu aturan yang nggak pernah tertulis tapi semua orang patuh. Makan harus bareng.' },
  { text: 'Makanannya mungkin cuma sedikit dan harus dibagi ke banyak tangan, tapi nggak ada yang makan sendirian.' },
  { text: 'Buat anak yang selama ini lebih sering makan mi instan sendirian di depan monitor, aturan itu rasanya aneh. Tapi juga hangat.' },
  { text: 'Di situ aku mulai ngerti, keluarga itu bisa saja orang-orang yang mau menunggumu datang sebelum mulai makan.' },
];

export const ENDING3: Line[] = [
  { text: 'Yang paling aku ingat dari mereka adalah setia kawannya. Besar sekali. Jauh lebih besar dari yang pernah aku lihat di tempat lain.' },
  { text: 'Dari mereka aku belajar cara cari uang di jalan. Ngamen dari satu tempat ke tempat lain.' },
  { text: 'Dan ya, kenakalan remaja pada umumnya, termasuk hal-hal yang sekarang nggak akan aku sarankan ke siapa pun.' },
  { text: 'Tapi jujur, masa itu seru sekali. Haha. Aku nggak akan bohong soal itu.' },
  { text: 'Untuk pertama kalinya setelah Siti pergi, aku merasa punya tempat lagi.' },
];
