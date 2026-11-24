/** Age-2 bedroom props. Coordinates are source pixels, feet at (0, 0), y grows up. */

function box(g, color, x, y, w, h) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

export function paintNurseryWall(g, x, edge) {
  g.fillStyle = '#f7d5e1';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#fff8ef';
  g.fillRect(2, 3, 2, 2);
  g.fillRect(11, 6, 2, 2);
  g.fillStyle = '#f6e7a8';
  g.fillRect(6, 5, 3, 1);
  g.fillRect(7, 4, 1, 3);
  if (edge === 'n' && x >= 4 && x <= 7) {
    g.fillStyle = '#6b4228';
    g.fillRect(1, 1, 14, 12);
    g.fillStyle = '#9fd4ee';
    g.fillRect(3, 3, 10, 8);
    g.fillStyle = '#fff6d0';
    g.fillRect(4, 4, 3, 3);
    g.fillStyle = '#6b4228';
    g.fillRect(7, 3, 1, 8);
    g.fillRect(3, 6, 10, 1);
    g.fillStyle = '#e7b7c8';
    g.fillRect(0, 2, 3, 11);
    g.fillRect(13, 2, 3, 11);
  } else if (edge === 'n' && (x === 2 || x === 9)) {
    g.fillStyle = '#6b4228';
    g.fillRect(2, 1, 12, 11);
    g.fillStyle = '#e6c56a';
    g.fillRect(3, 2, 10, 9);
    g.fillStyle = x === 2 ? '#f6c8aa' : '#7eb6d6';
    g.fillRect(4, 3, 8, 4);
    g.fillStyle = '#3d8a55';
    g.fillRect(4, 7, 8, 3);
  } else if (edge === 'n' && x === 8) {
    const colors = ['#d6453c', '#f5c20e', '#3d6ea8', '#3d8a55'];
    g.fillStyle = '#6b4228';
    g.fillRect(1, 2, 14, 11);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = colors[i];
      g.fillRect(2 + i * 3, 3, 2, 8);
    }
  }
  g.fillStyle = '#e8c9a4';
  g.fillRect(0, 13, 16, 3);
  g.fillStyle = '#c48a5a';
  g.fillRect(0, 13, 16, 1);
}

export function paintNurseryFrieze(g, width, height) {
  g.fillStyle = '#f7d5e1';
  g.fillRect(0, 0, width, height);
  g.fillStyle = '#fff8ef';
  for (let x = 4; x < width; x += 10) {
    g.fillRect(x, 8, 2, 2);
    g.fillRect(x + 5, 16, 2, 2);
  }
  g.fillStyle = '#f6e7a8';
  for (let x = 8; x < width; x += 22) {
    g.fillRect(x, 12, 3, 1);
    g.fillRect(x + 1, 11, 1, 3);
  }
  g.fillStyle = '#4a2c18';
  g.fillRect(0, 0, width, 2);
  g.fillStyle = '#e6c56a';
  g.fillRect(0, 2, width, 1);
  g.fillStyle = '#e8c9a4';
  g.fillRect(0, height - 6, width, 6);
  g.fillStyle = '#c48a5a';
  g.fillRect(0, height - 6, width, 1);

  drawFramed(g, 18, 6, '#f6c8aa', '#7eb6d6');
  drawWindowBand(g, 58, 5, 52, 22);
  drawPictureBooks(g, 122, 6);
  drawFramed(g, 156, 6, '#f6e7a8', '#8c3048');
}

function drawFramed(g, x, y, sky, hill) {
  g.fillStyle = '#6b4228';
  g.fillRect(x, y, 18, 16);
  g.fillStyle = '#e6c56a';
  g.fillRect(x + 1, y + 1, 16, 14);
  g.fillStyle = sky;
  g.fillRect(x + 3, y + 3, 12, 6);
  g.fillStyle = hill;
  g.fillRect(x + 3, y + 8, 12, 5);
  g.fillStyle = '#3d8a55';
  g.fillRect(x + 5, y + 9, 3, 4);
  g.fillStyle = '#f6e7a8';
  g.fillRect(x + 11, y + 4, 2, 2);
}

function drawWindowBand(g, x, y, w, h) {
  g.fillStyle = '#6b4228';
  g.fillRect(x, y, w, h);
  g.fillStyle = '#9fd4ee';
  g.fillRect(x + 3, y + 3, w - 6, h - 6);
  g.fillStyle = '#fff6d0';
  g.fillRect(x + 6, y + 5, 8, 6);
  g.fillStyle = '#6b4228';
  g.fillRect(x + w / 2 - 1, y + 3, 2, h - 6);
  g.fillRect(x + 3, y + h / 2, w - 6, 2);
  g.fillStyle = '#e7b7c8';
  g.fillRect(x - 6, y + 2, 8, h - 2);
  g.fillRect(x + w - 2, y + 2, 8, h - 2);
  g.fillStyle = '#f7d5e1';
  g.fillRect(x - 4, y + 4, 2, h - 8);
  g.fillRect(x + w, y + 4, 2, h - 8);
  g.fillStyle = '#c48a5a';
  g.fillRect(x - 8, y, w + 16, 2);
}

function drawPictureBooks(g, x, y) {
  g.fillStyle = '#6b4228';
  g.fillRect(x, y, 28, 20);
  const colors = ['#d6453c', '#3d6ea8', '#f5c20e', '#3d8a55', '#e6c56a', '#f4efe6'];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = colors[i];
    g.fillRect(x + 2 + i * 4, y + 3, 3, 14);
    g.fillStyle = '#fff8ef';
    g.fillRect(x + 3 + i * 4, y + 5, 1, 4);
  }
}

export function nurseryDecos() {
  return [
    { kind: 'plant', x: 1.22, y: 1.35 },
    { kind: 'plant', x: 10.35, y: 1.55 },
    { kind: 'plant', x: 1.22, y: 9.45 },
    { kind: 'ball', x: 6.65, y: 7.45 },
    { kind: 'crayons', x: 9.4, y: 9.2 },
    { kind: 'rattle', x: 3.45, y: 6.55 },
    { kind: 'blocks2', x: 7.55, y: 8.65 },
  ];
}

export function paintNurseryDeco(g, kind) {
  if (kind === 'ball') {
    box(g, '#d6453c', 4, 6, 8, 8);
    box(g, '#f6e7a8', 6, 8, 2, 2);
    box(g, '#3d6ea8', 5, 14, 6, 2);
    return true;
  }
  if (kind === 'crayons') {
    box(g, '#d6453c', 3, 6, 2, 10);
    box(g, '#3d6ea8', 6, 4, 2, 12);
    box(g, '#f5c20e', 9, 7, 2, 9);
    box(g, '#3d8a55', 12, 5, 2, 11);
    return true;
  }
  if (kind === 'rattle') {
    box(g, '#e6c56a', 4, 4, 6, 6);
    box(g, '#6b4228', 6, 10, 2, 6);
    box(g, '#d6453c', 5, 15, 4, 2);
    return true;
  }
  if (kind === 'blocks2') {
    box(g, '#3d6ea8', 2, 8, 6, 6);
    box(g, '#f5c20e', 7, 10, 6, 6);
    box(g, '#d6453c', 4, 3, 5, 5);
    return true;
  }
  return false;
}

const NURSERY_TYPES = new Set([
  'crib', 'chest', 'curtain', 'bookshelf', 'blanket', 'blocks', 'sorter',
  'robot', 'bunny', 'doll', 'horse', 'duck', 'dino', 'nightlight', 'plant', 'door',
]);

export function isNurseryProp(type) {
  return NURSERY_TYPES.has(type);
}

export function paintNurseryProp(g, prop, state) {
  const found = !!state.flags?.['seek_' + prop.seek];
  switch (prop.type) {
    case 'crib': return paintCrib(g, found);
    case 'chest': return paintChest(g, found);
    case 'curtain': return paintCurtain(g, found);
    case 'bookshelf': return paintBooks(g, found);
    case 'blanket': return paintBlanket(g, found);
    case 'blocks': return paintBlocks(g);
    case 'sorter': return paintSorter(g, !!state.flags?.candle_2);
    case 'robot': return paintRobot(g);
    case 'bunny': return paintBunny(g);
    case 'doll': return paintDoll(g);
    case 'horse': return paintHorse(g);
    case 'duck': return paintDuck(g);
    case 'dino': return paintDino(g);
    case 'nightlight': return paintNightlight(g);
    case 'plant': return paintPot(g);
    case 'door': return paintNurseryDoor(g, !!state.flags?.candle_2);
    default: return false;
  }
}

function paintCrib(g, found) {
  box(g, '#6b4228', -30, -46, 6, 42);
  box(g, '#6b4228', 24, -46, 6, 42);
  box(g, '#c4a070', -24, -40, 48, 4);
  box(g, '#c4a070', -24, -14, 48, 4);
  for (let x = -20; x <= 18; x += 6) box(g, '#e7d3b0', x, -36, 3, 22);
  box(g, '#f7e7c8', -22, -28, 44, 14);
  box(g, '#f4b7c8', -20, -26, 40, 8);
  box(g, '#fff8ef', -16, -36, 14, 8);
  box(g, '#f7d5e1', -14, -34, 10, 4);
  if (!found) {
    box(g, '#c48a4a', -34, -12, 10, 10);
    box(g, '#6b4228', -32, -10, 6, 6);
    box(g, '#f3ead4', -30, -8, 2, 2);
  }
}

function paintChest(g, found) {
  box(g, '#6b4228', -16, -22, 32, 20);
  box(g, '#a56b3a', -14, -20, 28, 16);
  box(g, '#e6c56a', -3, -14, 6, 4);
  box(g, '#6b4228', -14, -24, 28, 4);
  if (found) {
    box(g, '#c48a4a', -14, -34, 28, 10);
    box(g, '#3d8a55', -4, -30, 8, 6);
  } else {
    box(g, '#c48a4a', -14, -28, 28, 6);
    box(g, '#3d8a55', 14, -16, 8, 4);
    box(g, '#2f6b3a', 16, -22, 3, 6);
    box(g, '#6fbf7a', 20, -14, 4, 3);
  }
}

function paintCurtain(g, found) {
  box(g, '#6b4228', -16, -48, 32, 3);
  box(g, '#e7b7c8', -16, -45, 12, 40);
  box(g, '#e7b7c8', 4, -45, 12, 40);
  box(g, '#f7d5e1', -12, -42, 2, 34);
  box(g, '#f7d5e1', 8, -42, 2, 34);
  box(g, '#9fd4ee', -4, -42, 8, 22);
  box(g, '#fff6d0', -2, -38, 3, 8);
  if (!found) {
    box(g, '#f5c20e', -2, -28, 8, 6);
    box(g, '#e07a20', 4, -26, 6, 3);
    box(g, '#241610', 0, -26, 2, 2);
  }
}

function paintBooks(g, found) {
  box(g, '#6b4228', -14, -46, 28, 42);
  box(g, '#8a5a32', -12, -28, 24, 3);
  box(g, '#8a5a32', -12, -12, 24, 3);
  const colors = ['#d6453c', '#f5c20e', '#3d6ea8', '#3d8a55', '#f4efe6'];
  for (let i = 0; i < 5; i++) {
    box(g, colors[i], -11 + i * 4, -42, 3, 14);
    box(g, colors[(i + 2) % 5], -11 + i * 4, -26, 3, 14);
    box(g, '#fff8ef', -10 + i * 4, -38, 1, 4);
  }
  if (!found) {
    box(g, '#8c3048', -6, -54, 14, 4);
    box(g, '#6b4228', -2, -58, 10, 5);
    box(g, '#e6c56a', 2, -56, 2, 2);
  }
}

function paintBlanket(g, found) {
  box(g, '#d98b8b', -16, -14, 32, 12);
  box(g, '#f2c2c2', -16, -14, 32, 3);
  box(g, '#f6e7a8', -10, -10, 6, 4);
  box(g, '#3d6ea8', 2, -9, 6, 4);
  box(g, '#fff8ef', -4, -8, 5, 3);
  if (!found) {
    box(g, '#f4d2dc', -10, -40, 7, 28);
    box(g, '#f4d2dc', 3, -38, 7, 26);
    box(g, '#f7a8b8', -8, -36, 3, 16);
    box(g, '#f7a8b8', 5, -34, 3, 14);
    box(g, '#241610', -6, -30, 2, 2);
  }
}

function paintBlocks(g) {
  box(g, '#d6453c', -14, -12, 12, 12);
  box(g, '#f6e7a8', -11, -9, 3, 3);
  box(g, '#3d6ea8', -2, -16, 12, 12);
  box(g, '#fff8ef', 1, -13, 3, 3);
  box(g, '#f5c20e', -8, -26, 12, 12);
  box(g, '#6b4228', -5, -22, 3, 3);
  box(g, '#3d8a55', 6, -10, 10, 10);
}

function paintSorter(g, open) {
  box(g, '#6b4228', -18, -24, 36, 22);
  box(g, '#a56b3a', -16, -22, 32, 18);
  hole(g, -14, -18, 'circle');
  hole(g, -4, -18, 'square');
  hole(g, 6, -18, 'triangle');
  hole(g, -4, -10, 'star');
  if (open) {
    box(g, '#c48a4a', -16, -40, 32, 8);
    box(g, '#6b4228', 12, -36, 3, 12);
    box(g, '#f3ead4', -3, -36, 6, 12);
    box(g, '#f6e7a8', -2, -42, 4, 6);
    box(g, '#fff6d0', -1, -46, 2, 4);
    box(g, '#e6c56a', -6, -44, 2, 2);
    box(g, '#e6c56a', 4, -40, 2, 2);
  } else {
    box(g, '#8a5a32', -16, -28, 32, 5);
    box(g, '#e6c56a', -2, -26, 4, 2);
  }
}

function hole(g, x, y, kind) {
  box(g, '#3a2a1a', x, y, 8, 8);
  if (kind === 'circle') box(g, '#f3ead4', x + 2, y + 2, 4, 4);
  if (kind === 'square') box(g, '#3d6ea8', x + 2, y + 2, 4, 4);
  if (kind === 'triangle') {
    box(g, '#3d8a55', x + 3, y + 2, 2, 2);
    box(g, '#3d8a55', x + 2, y + 4, 4, 2);
  }
  if (kind === 'star') {
    box(g, '#f5c20e', x + 3, y + 1, 2, 6);
    box(g, '#f5c20e', x + 1, y + 3, 6, 2);
  }
}

function paintRobot(g) {
  box(g, '#8aa0b8', -8, -34, 16, 14);
  box(g, '#d7e2ee', -6, -32, 12, 8);
  box(g, '#241610', -5, -29, 3, 3);
  box(g, '#241610', 2, -29, 3, 3);
  box(g, '#fff8ef', -4, -28, 1, 1);
  box(g, '#d6453c', -2, -24, 4, 2);
  box(g, '#6b4228', 6, -30, 6, 3);
  box(g, '#e6c56a', 10, -32, 3, 6);
  box(g, '#8aa0b8', -6, -20, 12, 12);
  box(g, '#e6c56a', -2, -16, 4, 4);
  box(g, '#5c6b7a', -8, -10, 4, 8);
  box(g, '#5c6b7a', 4, -10, 4, 8);
}

function paintBunny(g) {
  box(g, '#f4d2dc', -10, -36, 6, 16);
  box(g, '#f4d2dc', 4, -36, 6, 16);
  box(g, '#f7a8b8', -8, -32, 2, 10);
  box(g, '#f7a8b8', 6, -32, 2, 10);
  box(g, '#f4d2dc', -10, -24, 20, 16);
  box(g, '#241610', -6, -18, 2, 3);
  box(g, '#241610', 3, -18, 2, 3);
  box(g, '#f29682', -2, -14, 3, 2);
  box(g, '#fff8ef', -6, -12, 12, 6);
  box(g, '#e7b7c8', -8, -8, 16, 8);
}

function paintDoll(g) {
  box(g, '#6b4228', -8, -36, 16, 5);
  box(g, '#8c3048', -10, -32, 20, 4);
  box(g, '#f6c8aa', -6, -28, 12, 10);
  box(g, '#241610', -4, -24, 2, 2);
  box(g, '#241610', 2, -24, 2, 2);
  box(g, '#d6453c', -2, -20, 4, 1);
  box(g, '#3d6ea8', -8, -18, 16, 12);
  box(g, '#e6c56a', -2, -14, 4, 3);
  box(g, '#6b4228', -8, -8, 4, 6);
  box(g, '#6b4228', 4, -8, 4, 6);
}

function paintHorse(g) {
  box(g, '#c48a4a', -12, -20, 22, 10);
  box(g, '#a56b3a', 6, -32, 8, 14);
  box(g, '#6b4228', 8, -30, 3, 4);
  box(g, '#241610', 10, -27, 2, 2);
  box(g, '#8c3048', -4, -24, 8, 4);
  box(g, '#6b4228', -12, -12, 6, 6);
  box(g, '#6b4228', 6, -12, 6, 6);
  box(g, '#f3ead4', -10, -10, 2, 2);
  box(g, '#f3ead4', 8, -10, 2, 2);
}

function paintDuck(g) {
  box(g, '#f5c20e', -10, -22, 18, 14);
  box(g, '#f5c20e', -4, -30, 12, 12);
  box(g, '#241610', 2, -26, 2, 2);
  box(g, '#e07a20', 6, -24, 7, 4);
  box(g, '#fff6d0', -6, -16, 6, 4);
  box(g, '#e07a20', -8, -8, 4, 3);
  box(g, '#e07a20', 2, -8, 4, 3);
}

function paintDino(g) {
  box(g, '#3d8a55', -8, -28, 16, 12);
  box(g, '#6fbf7a', -4, -34, 8, 8);
  box(g, '#241610', 0, -30, 2, 2);
  box(g, '#f29682', 2, -26, 4, 2);
  box(g, '#2f6b3a', -10, -32, 4, 4);
  box(g, '#2f6b3a', -2, -36, 4, 4);
  box(g, '#3d8a55', -12, -16, 22, 10);
  box(g, '#2f6b3a', 8, -20, 8, 4);
  box(g, '#6b4228', -10, -8, 4, 6);
  box(g, '#6b4228', 4, -8, 4, 6);
}

function paintNightlight(g) {
  box(g, '#e6c56a', -6, -8, 12, 6);
  box(g, '#6b4228', -2, -14, 4, 6);
  box(g, '#fff1c4', -8, -28, 16, 14);
  box(g, '#fffef4', -2, -24, 4, 6);
  box(g, '#f6e7a8', -10, -22, 2, 4);
  box(g, '#f6e7a8', 8, -22, 2, 4);
}

function paintPot(g) {
  box(g, '#c48a4a', -8, -12, 16, 10);
  box(g, '#8a5a32', -6, -14, 12, 3);
  box(g, '#3d8a55', -10, -28, 20, 16);
  box(g, '#6fbf7a', -4, -36, 8, 10);
  box(g, '#d6453c', 4, -32, 4, 4);
  box(g, '#f5c20e', -8, -30, 3, 3);
}

function paintNurseryDoor(g, open) {
  box(g, '#6b4228', -14, -40, 28, 40);
  box(g, '#a56b3a', -11, -36, 22, 34);
  box(g, '#c4a070', -11, -24, 22, 2);
  box(g, '#e6c56a', 6, -18, 3, 3);
  if (!open) {
    box(g, '#f6c8aa', -6, -34, 12, 10);
    box(g, '#3a2418', -7, -38, 14, 6);
    box(g, '#241610', -4, -30, 2, 2);
    box(g, '#241610', 2, -30, 2, 2);
    box(g, '#fff8ef', -8, -24, 16, 8);
  } else {
    box(g, '#f7d5e1', -8, -32, 16, 26);
  }
}

export function drawFloatingCandle(ctx, x, y) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.fillStyle = '#f6e7a8';
  ctx.fillRect(-2, -16, 4, 6);
  ctx.fillStyle = '#fff6d0';
  ctx.fillRect(-1, -20, 2, 4);
  ctx.fillStyle = '#f3ead4';
  ctx.fillRect(-4, -12, 8, 16);
  ctx.fillStyle = '#e0a050';
  ctx.fillRect(-4, 2, 8, 3);
  ctx.fillStyle = '#e6c56a';
  for (const [dx, dy] of [[-12, -8], [12, -4], [-8, 10], [14, 8], [0, -26]]) {
    ctx.fillRect(dx, dy, 3, 3);
  }
  ctx.restore();
}
