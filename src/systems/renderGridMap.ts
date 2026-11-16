import Phaser from 'phaser';
import { TILE } from '../data/config';
import { EMPTY, INDOOR_BASE, PROP_FRAME, type GridMap } from './GridMap';

/** Draw a GridMap into the scene. When `collide` is set, return the collision layer for physics. */
export function renderGridMap(scene: Phaser.Scene, grid: GridMap, collide: boolean): Phaser.Tilemaps.TilemapLayer | undefined {
  const map = scene.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: grid.cols, height: grid.rows });
  const city = map.addTilesetImage('city', 'city', TILE, TILE, 0, 0, 0)!;
  const inside = map.addTilesetImage('indoor', 'indoor', TILE, TILE, 0, 0, INDOOR_BASE)!;
  const sets = [city, inside];

  const draw = (name: string, data: number[][], depth: number) => {
    const layer = map.createBlankLayer(name, sets)!;
    for (let y = 0; y < grid.rows; y++) for (let x = 0; x < grid.cols; x++) if (data[y][x] !== EMPTY) layer.putTileAt(data[y][x], x, y);
    return layer.setDepth(depth);
  };
  draw('ground', grid.ground, -30);
  draw('deco', grid.deco, -20);
  // Above every character (character depth = its y, at most the map height).
  draw('over', grid.over, 50_000);

  for (const p of grid.props) {
    const y = p.ty * TILE + TILE;
    scene.add.image(p.tx * TILE + TILE / 2, y, 'props', PROP_FRAME[p.name]).setOrigin(0.5, 1).setDepth(y - 1);
  }

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
  const solid = map.createBlankLayer('solid', sets)!;
  for (let y = 0; y < grid.rows; y++) for (let x = 0; x < grid.cols; x++) if (grid.solid[y][x]) solid.putTileAt(0, x, y);
  solid.setCollisionByExclusion([EMPTY]).setVisible(false);
  return solid;
}
