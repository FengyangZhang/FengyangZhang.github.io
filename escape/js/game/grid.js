/** Walk grid built from a room map, props, and which doors are open. */

import { isExitOpen } from './logic.js';

export function mapSize(room) {
  const rows = room.map.length;
  const cols = room.map[0].length;
  return { cols, rows };
}

export function tileChar(room, x, y) {
  if (y < 0 || x < 0 || y >= room.map.length || x >= room.map[0].length) return ' ';
  return room.map[y][x];
}

export function buildWalkGrid(room, state) {
  const { cols, rows } = mapSize(room);
  const grid = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const ch = room.map[y][x];
      row.push(ch === '.' || ch === ',' ? 1 : 0);
    }
    grid.push(row);
  }
  for (const prop of room.props) {
    if (!prop.block) continue;
    const w = prop.w || 1;
    const h = prop.h || 1;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const y = prop.y + dy;
        const x = prop.x + dx;
        if (grid[y] && grid[y][x] != null) grid[y][x] = 0;
      }
    }
  }
  for (const exit of room.exits) {
    grid[exit.y][exit.x] = isExitOpen(state, exit) ? 1 : 0;
  }
  return grid;
}

export function footprintTiles(prop) {
  const tiles = [];
  const w = prop.w || 1;
  const h = prop.h || 1;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) tiles.push({ x: prop.x + dx, y: prop.y + dy });
  }
  return tiles;
}

/** Tiles the player can stand on to use this prop. */
export function standTiles(prop, grid) {
  const w = prop.w || 1;
  const h = prop.h || 1;
  if (!prop.block) {
    const on = footprintTiles(prop).filter((t) => grid[t.y] && grid[t.y][t.x] === 1);
    if (on.length) return on;
  }
  const tiles = [];
  for (let y = prop.y - 1; y <= prop.y + h; y++) {
    for (let x = prop.x - 1; x <= prop.x + w; x++) {
      const inside = x >= prop.x && x < prop.x + w && y >= prop.y && y < prop.y + h;
      if (inside) continue;
      if (grid[y] && grid[y][x] === 1) tiles.push({ x, y });
    }
  }
  return tiles;
}
