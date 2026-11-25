/** Screen-space taps on the top-down tile grid. */

import { TILE } from '../render/scene.js';

const LIFT = {
  portrait: 10,
  banner: 8,
  candle: 8,
  bookshelf: 10,
  window: 8,
  door: 8,
  bell: 8,
  npc: 12,
  bottle: 6,
  lectern: 6,
  cauldron: 6,
  plaque: 6,
  tablet: 6,
  note: 4,
  star: 2,
  brick: 2,
  book: 6,
  brazier: 6,
  crane: 6,
};

export function propAnchor(prop, cam) {
  const w = prop.w || 1;
  const h = prop.h || 1;
  const lift = prop.lift ?? LIFT[prop.type] ?? 6;
  return {
    x: (prop.x + w / 2) * TILE * cam.scale + cam.ox,
    y: (prop.y + h / 2) * TILE * cam.scale + cam.oy - lift * cam.scale,
  };
}

export function pickProp(props, cam, sx, sy) {
  if (!cam) return null;
  let best = null;
  let bestScore = Infinity;
  const radius = Math.max(36, 22 * cam.scale);
  for (const prop of props) {
    const pt = propAnchor(prop, cam);
    const dist = Math.hypot(sx - pt.x, sy - pt.y);
    const reach = radius + (prop.reach || 0) * cam.scale;
    if (dist > reach) continue;
    const score = dist - (prop.pick || 0) * 14;
    if (score < bestScore) {
      bestScore = score;
      best = prop;
    }
  }
  return best;
}

export function nearestFloor(grid, wx, wy, maxDist = 1.2) {
  const tx = Math.floor(wx);
  const ty = Math.floor(wy);
  if (grid[ty]?.[tx] === 1) return { x: tx, y: ty };
  let best = null;
  let bestD = maxDist;
  const y0 = Math.max(0, Math.floor(wy - maxDist));
  const y1 = Math.min(grid.length - 1, Math.ceil(wy + maxDist));
  for (let y = y0; y <= y1; y++) {
    const row = grid[y];
    if (!row) continue;
    const x0 = Math.max(0, Math.floor(wx - maxDist));
    const x1 = Math.min(row.length - 1, Math.ceil(wx + maxDist));
    for (let x = x0; x <= x1; x++) {
      if (row[x] !== 1) continue;
      const d = Math.hypot(x + 0.5 - wx, y + 0.5 - wy);
      if (d < bestD) {
        bestD = d;
        best = { x, y };
      }
    }
  }
  return best;
}
