/** Isometric projection. Tile (x, y) is a diamond; z is height in pixels. */

export const TILE_W = 78;
export const TILE_H = 39;

export function iso(x, y, z = 0) {
  return {
    x: (x - y) * (TILE_W / 2),
    y: (x + y) * (TILE_H / 2) - z,
  };
}

/** Inverse of iso() at z = 0. Returns fractional tile coordinates. */
export function isoInv(sx, sy) {
  const hx = TILE_W / 2;
  const hy = TILE_H / 2;
  return {
    x: (sx / hx + sy / hy) / 2,
    y: (sy / hy - sx / hx) / 2,
  };
}

export function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
}

/** Footprint from tile (x,y) size w×h, raised to z. */
export function topFace(x, y, w, h, z) {
  return [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + h, z), iso(x, y + h, z)];
}

export function leftFace(x, y, w, h, z0, z1) {
  return [iso(x, y + h, z0), iso(x + w, y + h, z0), iso(x + w, y + h, z1), iso(x, y + h, z1)];
}

export function rightFace(x, y, w, h, z0, z1) {
  return [iso(x + w, y, z0), iso(x + w, y + h, z0), iso(x + w, y + h, z1), iso(x + w, y, z1)];
}
