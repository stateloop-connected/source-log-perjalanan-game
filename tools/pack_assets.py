"""Siapkan aset game dari Kenney RPG Urban Pack (CC0) ke public/assets/.

Sumber disimpan di repo: assets-src/kenney-rpg-urban/tilemap_packed.png (27x18 tile, 16px, tanpa spasi).
Jalankan ulang kalau sumber berubah. Jangan edit hasil di public/assets/ secara manual.

    python tools/pack_assets.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "kenney-rpg-urban" / "tilemap_packed.png"
OUT = ROOT / "public" / "assets"
COLS = 27
T = 16

# Karakter di sheet: 4 kolom (samping, depan, belakang, samping-cermin) x 3 baris
# (diam, langkah 1, langkah 2). Index = tile kiri-atas blok karakter.
KARAKTER = {
    "zain": 23,      # anak kaus hijau
    "siti": 104,     # anak perempuan rambut panjang
    "kakek": 185,    # rambut abu, berjenggot
    "pekerja": 266,  # helm kuning, om-om pelanggan
    "bapak": 347,    # botak, om-om pelanggan
    "nenek": 428,    # rambut gelap, diwarnai ulang jadi abu (lihat UBAN)
}

# Rambut gelap -> uban, khusus Nenek. Warna diukur dari tile 429.
UBAN = {
    (55, 55, 51, 255): (150, 150, 146, 255),
    (96, 96, 90, 255): (204, 204, 198, 255),
}


def tile(sheet: Image.Image, i: int) -> Image.Image:
    x, y = (i % COLS) * T, (i // COLS) * T
    return sheet.crop((x, y, x + T, y + T))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    sheet.save(OUT / "city.png")
    print("tileset city.png", sheet.size)

    for nama, base in KARAKTER.items():
        out = Image.new("RGBA", (4 * T, 3 * T))
        for r in range(3):
            for c in range(4):
                out.paste(tile(sheet, base + r * COLS + c), (c * T, r * T))
        if nama == "nenek":
            px = out.load()
            for y in range(out.height):
                for x in range(out.width):
                    px[x, y] = UBAN.get(px[x, y], px[x, y])
        out.save(OUT / f"{nama}.png")
        print("karakter", nama)


if __name__ == "__main__":
    main()
