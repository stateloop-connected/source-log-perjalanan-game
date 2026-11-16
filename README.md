# Log Perjalanan Hidup (game)

Story RPG tanpa battle, versi interaktif seri tulisan **Log Perjalanan Hidup** karya Zain Bagus di Medium.
Satu artikel = satu chapter yang bisa dimainkan.

Phaser 3 + TypeScript + Vite. Grafis Kenney RPG Urban Pack (CC0), musik CC0 dari OpenGameArt.

## Main

```bash
npm install
npm run dev      # http://localhost:5174
npm test         # gaya tulisan, integritas peta, simulasi tamat Chapter 1
npm run build    # typecheck + build ke dist/
npm run assets   # potong ulang sprite dari assets-src/
```

## Kontrol

| Aksi | Keyboard | Sentuh |
|---|---|---|
| Jalan | panah / WASD | tahan layar ke arah tujuan |
| Ngobrol, lanjut dialog | E / Spasi / Enter | ketuk |
| Pilih jawaban | atas / bawah, lalu E | ketuk jawabannya |
| Lewati prolog | Esc | ketuk "lewati >>" |
| Suara on/off | M | |

## Isi (prototipe v0.3). Chapter 1, sekitar 10 menit

1. **Pembukaan.** PRESS START, prolog terminal (`cat 001-masa-kecil.log`), kartu "Chapter 1. Bandung".
2. **Bandung.** Rumah yang ribut, Siti mengajak main ke rumahnya.
3. **Warnet.** Layar monitor "game online". Farming item, jual ke om_kantor, jokiin akun om_helm.
4. **Halte bus**, lalu kartu "Liburan. Malang".
5. **Malang.** Rumah Kakek dan Nenek. Quest tata krama berbentuk pilihan (makanan jangan dianggurin,
   piring langsung dicuci, bungkus dibuka pakai tangan). Jawaban salah ditegur, lalu diulang.
6. **Ending.** Narasi penutup dari artikel, "Bersambung."

Progres tersimpan di browser. Menu judul menawarkan **Lanjutkan** atau **Mulai dari awal**.

## Mengubah cerita

| Mau mengubah | File |
|---|---|
| Kalimat narasi, prolog, ending, chat warnet | `src/story/chapter1.ts` |
| Dialog NPC, quest, pilihan, petunjuk tujuan | `src/maps/bandung.ts`, `src/maps/malang.ts` |
| Tata letak peta | fungsi `buildBandung` / `buildMalang` di file yang sama |
| BGM tiap suasana | `src/data/tracks.ts` |

Cerita ditulis sebagai data (`say`, `choose`, `set`, `walk`, `narrate`, `goto`, `end`, lihat `src/story/types.ts`),
jadi chapter baru cukup menambah peta dan skrip tanpa mengubah engine.

`npm test` menolak teks cerita yang memakai titik dua atau em dash, sesuai gaya tulisan seri ini,
dan menyimulasikan Chapter 1 dari awal sampai tamat supaya alur quest tidak pernah buntu.

## Struktur

```
src/story/      teks cerita, tipe aksi, tes
src/maps/       peta + NPC + skrip per kota
src/scenes/     Title, Story (prolog/kartu), World (engine), Warnet
src/systems/    GridMap, renderGridMap, DialogueBox, Flags, Music, Sfx
src/data/       config, index tile Kenney, daftar BGM
assets-src/     sumber grafis Kenney (CC0)
tools/          pack_assets.py
```
