/** Screen-space taps. Tall props are aimed at their visible body, not only the floor tile. */

import { iso } from '../engine/iso.js';

const LIFT = {
  portrait: 52,
  banner: 44,
  candle: 30,
  bookshelf: 46,
  window: 40,
  door: 28,
  bell: 48,
  npc: 40,
  bottle: 22,
  lectern: 24,
  cauldron: 18,
  plaque: 20,
  tablet: 18,
  note: 8,
  star: 6,
  brick: 6,
  book: 22,
  brazier: 22,
  crane: 36,
};

function screenPoint(prop, cam, z) {
  const w = prop.w || 1;
  const h = prop.h || 1;
  const p = iso(prop.x + w / 2, prop.y + h / 2, z);
  return {
    x: p.x * cam.scale + cam.ox,
    y: p.y * cam.scale + cam.oy,
  };
}

export function propAnchor(prop, cam) {
  const lift = prop.lift ?? LIFT[prop.type] ?? 16;
  return screenPoint(prop, cam, lift);
}

/** Nearest prop whose screen body contains the tap. Higher `pick` wins ties. */
export function pickProp(props, cam, sx, sy) {
  if (!cam) return null;
  let best = null;
  let bestScore = Infinity;
  const radius = Math.max(36, 30 * cam.scale);
  for (const prop of props) {
    const lift = prop.lift ?? LIFT[prop.type] ?? 16;
    const points = [screenPoint(prop, cam, 0), screenPoint(prop, cam, lift)];
    const dist = Math.min(...points.map((pt) => Math.hypot(sx - pt.x, sy - pt.y)));
    if (dist > radius) continue;
    const score = dist - (prop.pick || 0) * 18;
    if (score < bestScore) {
      bestScore = score;
      best = prop;
    }
  }
  return best;
}

/** Floor tile to walk to. Snaps a near-miss (a tap on a wall edge) onto a walkable tile. */
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
