/** A* on a small grid. 8-direction movement, no corner cutting. */

const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

function key(x, y) {
  return x + ',' + y;
}

function heuristic(ax, ay, bx, by) {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  const diag = Math.min(dx, dy);
  return diag * Math.SQRT2 + (Math.max(dx, dy) - diag);
}

export function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

export function walkableAt(grid, x, y) {
  return inBounds(grid, x, y) && grid[y][x] === 1;
}

/**
 * @param {number[][]} grid 1 = walkable
 * @returns {{x:number,y:number}[] | null} tile coordinates including the start
 */
export function findPath(grid, sx, sy, tx, ty) {
  if (!walkableAt(grid, sx, sy) || !walkableAt(grid, tx, ty)) return null;
  if (sx === tx && sy === ty) return [{ x: sx, y: sy }];

  const cols = grid[0].length;
  const open = [[sx, sy]];
  const gScore = new Map([[key(sx, sy), 0]]);
  const came = new Map();
  const fScore = new Map([[key(sx, sy), heuristic(sx, sy, tx, ty)]]);
  const closed = new Set();

  while (open.length) {
    let bestI = 0;
    let bestF = Infinity;
    for (let i = 0; i < open.length; i++) {
      const f = fScore.get(key(open[i][0], open[i][1])) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        bestI = i;
      }
    }
    const [x, y] = open.splice(bestI, 1)[0];
    const k = key(x, y);
    if (x === tx && y === ty) {
      const path = [{ x, y }];
      let cur = k;
      while (came.has(cur)) {
        cur = came.get(cur);
        const [px, py] = cur.split(',').map(Number);
        path.push({ x: px, y: py });
      }
      path.reverse();
      return path;
    }
    closed.add(k);
    const base = gScore.get(k) ?? Infinity;

    for (const [dx, dy, cost] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!walkableAt(grid, nx, ny)) continue;
      if (dx !== 0 && dy !== 0) {
        if (!walkableAt(grid, x + dx, y) || !walkableAt(grid, x, y + dy)) continue;
      }
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      const tentative = base + cost;
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
      came.set(nk, k);
      gScore.set(nk, tentative);
      fScore.set(nk, tentative + heuristic(nx, ny, tx, ty));
      if (!open.some(([ox, oy]) => ox === nx && oy === ny)) open.push([nx, ny]);
    }
    if (open.length > cols * grid.length) break;
  }
  return null;
}

export function nearestWalkable(grid, tiles, fromX, fromY) {
  let best = null;
  let bestLen = Infinity;
  for (const tile of tiles) {
    const path = findPath(grid, fromX, fromY, tile.x, tile.y);
    if (!path) continue;
    if (path.length < bestLen) {
      bestLen = path.length;
      best = tile;
    }
  }
  return best;
}
