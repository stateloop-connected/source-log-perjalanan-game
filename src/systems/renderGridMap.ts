import Phaser from 'phaser';
import { TILE } from '../data/config';
import { EMPTY, type GridMap } from './GridMap';

/** Gambar GridMap ke scene. Kalau `collide`, kembalikan layer collider untuk physics. */
export function renderGridMap(scene: Phaser.Scene, grid: GridMap, collide: boolean): Phaser.Tilemaps.TilemapLayer | undefined {
  const map = scene.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: grid.cols, height: grid.rows });
  const tiles = map.addTilesetImage('city', 'city', TILE, TILE, 0, 0)!;

  const draw = (name: string, data: number[][], depth: number) => {
    const layer = map.createBlankLayer(name, tiles)!;
    for (let y = 0; y < grid.rows; y++) for (let x = 0; x < grid.cols; x++) if (data[y][x] !== EMPTY) layer.putTileAt(data[y][x], x, y);
    return layer.setDepth(depth);
  };
  draw('ground', grid.ground, -30);
  draw('deco', grid.deco, -20);
  // Di atas semua karakter (depth karakter = posisi y, maksimal tinggi peta).
  draw('over', grid.over, 50_000);

  for (const l of grid.labels) {
    scene.add
      .text(l.tx * TILE, l.ty * TILE + 3, l.text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffe08a',
        backgroundColor: '#2a1d14',
        padding: { x: 3, y: 2 },
      })
      .setOrigin(0.5, 0)
      .setDepth(50_001);
  }

  if (!collide) return undefined;
  const solid = map.createBlankLayer('solid', tiles)!;
  for (let y = 0; y < grid.rows; y++) for (let x = 0; x < grid.cols; x++) if (grid.solid[y][x]) solid.putTileAt(0, x, y);
  solid.setCollisionByExclusion([EMPTY]).setVisible(false);
  return solid;
}
