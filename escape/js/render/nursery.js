/** Age-2 bedroom props. Coordinates are source pixels, feet at (0, 0), y grows up. */

function box(g, color, x, y, w, h) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function nurseryRug(x, y) {
  return x >= 1 && x <= 10 && y >= 2 && y <= 10;
}

export function paintNurseryTile(g, kind, x, y, rug, edge) {
  if (kind === 'wall') paintWall32(g, x, edge);
  else if (kind === 'door') paintDoor32(g);
  else paintFloor32(g, x, y, rug);
}

function paintFloor32(g, x, y, rug) {
  for (let i = 0; i < 8; i++) {
    const yy = i * 4;
    g.fillStyle = (x + y + i) % 2 ? '#e8c49a' : '#f4d8b4';
    g.fillRect(0, yy, 32, 4);
    g.fillStyle = '#c4925a';
    g.fillRect(0, yy, 32, 1);
    const seam = (6 + ((y * 5 + i * 7) % 14));
    g.fillStyle = '#b07a45';
    g.fillRect(seam, yy + 1, 1, 3);
    g.fillRect((seam + 16) % 32, yy + 1, 1, 3);
  }
  if (!rug) return;
  g.fillStyle = '#f6d3c4';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#fbe4d4';
  g.fillRect(4, 8, 3, 2);
  g.fillRect(18, 22, 3, 2);
  g.fillStyle = '#e7b7c8';
  if (!nurseryRug(x - 1, y)) g.fillRect(0, 0, 4, 32);
  if (!nurseryRug(x + 1, y)) g.fillRect(28, 0, 4, 32);
  if (!nurseryRug(x, y - 1)) g.fillRect(0, 0, 32, 4);
  if (!nurseryRug(x, y + 1)) g.fillRect(0, 28, 32, 4);
  g.fillStyle = '#f2a0b8';
  if ((x + y) % 2 === 0) {
    g.fillRect(14, 13, 4, 4);
    g.fillRect(12, 15, 8, 1);
    g.fillRect(15, 12, 2, 8);
  } else {
    g.fillStyle = '#fff8ef';
    g.fillRect(8, 8, 3, 3);
    g.fillRect(20, 18, 2, 2);
  }
}

function paintWall32(g, x, edge) {
  g.fillStyle = '#f6d0de';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#fff8ef';
  g.fillRect(3, 8, 10, 5);
  g.fillRect(5, 6, 6, 9);
  g.fillRect(18, 16, 8, 4);
  g.fillRect(20, 14, 4, 8);
  g.fillStyle = '#f6e7a8';
  g.fillRect(22, 6, 5, 1);
  g.fillRect(24, 4, 1, 5);
  g.fillRect(8, 20, 5, 1);
  g.fillRect(10, 18, 1, 5);
  g.fillStyle = '#e8c9a4';
  g.fillRect(0, 26, 32, 6);
  g.fillStyle = '#c48a5a';
  g.fillRect(0, 26, 32, 2);
  if (edge === 'n' && x >= 4 && x <= 7) {
    g.fillStyle = '#6b4228';
    g.fillRect(0, 2, 32, 22);
    g.fillStyle = '#8ec8e6';
    g.fillRect(2, 4, 28, 18);
    g.fillStyle = '#fff6d0';
    g.fillRect(4, 6, 8, 6);
    g.fillStyle = '#6b4228';
    g.fillRect(15, 4, 2, 18);
    g.fillRect(2, 12, 28, 2);
    if (x === 4) {
      g.fillStyle = '#e7b7c8';
      g.fillRect(0, 2, 8, 22);
      g.fillStyle = '#f4c2d0';
      g.fillRect(2, 4, 3, 18);
    }
    if (x === 7) {
      g.fillStyle = '#e7b7c8';
      g.fillRect(24, 2, 8, 22);
      g.fillStyle = '#f4c2d0';
      g.fillRect(27, 4, 3, 18);
    }
  } else if (edge === 'n' && (x === 2 || x === 10)) {
    g.fillStyle = '#6b4228';
    g.fillRect(6, 4, 20, 18);
    g.fillStyle = '#e6c56a';
    g.fillRect(8, 6, 16, 14);
    g.fillStyle = x === 2 ? '#f6c8aa' : '#9fd4ee';
    g.fillRect(10, 8, 12, 6);
    g.fillStyle = '#3d8a55';
    g.fillRect(10, 14, 12, 4);
    g.fillStyle = '#d6453c';
    g.fillRect(18, 9, 3, 3);
  } else if (edge === 'n' && x === 8) {
    const colors = ['#d6453c', '#f5c20e', '#3d6ea8', '#3d8a55', '#f4efe6'];
    g.fillStyle = '#6b4228';
    g.fillRect(4, 6, 24, 16);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = colors[i];
      g.fillRect(6 + i * 4, 8, 3, 12);
    }
  }
}

function paintDoor32(g) {
  paintFloor32(g, 5, 11, false);
  g.fillStyle = '#6b4228';
  g.fillRect(6, 0, 20, 32);
  g.fillStyle = '#a56b3a';
  g.fillRect(8, 2, 16, 28);
  g.fillStyle = '#c4a070';
  g.fillRect(8, 14, 16, 2);
  g.fillStyle = '#e6c56a';
  g.fillRect(18, 16, 3, 3);
}

export function paintNurseryFrieze(g, width, height) {
  g.fillStyle = '#f6d0de';
  g.fillRect(0, 0, width, height);
  g.fillStyle = '#fff8ef';
  for (let x = 2; x < width; x += 14) g.fillRect(x, 2, 4, 2);
  g.fillStyle = '#f6e7a8';
  for (let x = 8; x < width; x += 18) {
    g.fillRect(x, 3, 3, 1);
    g.fillRect(x + 1, 2, 1, 3);
  }
  g.fillStyle = '#c48a5a';
  g.fillRect(0, height - 2, width, 2);
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
    { kind: 'mobile', x: 2.55, y: 1.35 },
    { kind: 'plant', x: 10.4, y: 1.45 },
    { kind: 'plant', x: 1.25, y: 9.55 },
    { kind: 'drawing', x: 6.35, y: 2.55 },
    { kind: 'ball', x: 5.4, y: 3.55 },
    { kind: 'crayons', x: 7.45, y: 7.35 },
    { kind: 'rattle', x: 3.4, y: 6.55 },
    { kind: 'blocks2', x: 3.45, y: 7.45 },
    { kind: 'drawing', x: 9.45, y: 9.35 },
    { kind: 'ball', x: 4.55, y: 9.45 },
    { kind: 'blocks2', x: 7.4, y: 9.25 },
    { kind: 'crayons', x: 6.55, y: 8.45 },
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
    box(g, '#fff8ef', 5, 4, 1, 1);
    return true;
  }
  if (kind === 'mobile') {
    box(g, '#6b4228', 2, 0, 12, 2);
    box(g, '#c48a5a', 4, 2, 1, 6);
    box(g, '#c48a5a', 8, 2, 1, 8);
    box(g, '#c48a5a', 12, 2, 1, 5);
    box(g, '#f5c20e', 2, 7, 5, 5);
    box(g, '#d6453c', 6, 9, 5, 5);
    box(g, '#3d6ea8', 10, 6, 5, 5);
    return true;
  }
  if (kind === 'drawing') {
    box(g, '#6b4228', 2, 2, 12, 12);
    box(g, '#fff8ef', 3, 3, 10, 10);
    box(g, '#9fd4ee', 4, 4, 8, 4);
    box(g, '#3d8a55', 4, 8, 8, 4);
    box(g, '#f5c20e', 8, 5, 2, 2);
    return true;
  }
  return false;
}

const NURSERY_TYPES = new Set([
  'crib', 'chest', 'curtain', 'bookshelf', 'blanket', 'blocks', 'sorter',
  'robot', 'bunny', 'doll', 'horse', 'duck', 'dino', 'nightlight', 'plant', 'door', 'rocker',
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
    case 'rocker': return paintRocker(g);
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
  box(g, '#2a241c', -10, -38, 20, 18);
  box(g, '#8aa0b8', -8, -36, 16, 14);
  box(g, '#d7e2ee', -6, -34, 12, 8);
  box(g, '#241610', -5, -31, 3, 3);
  box(g, '#241610', 2, -31, 3, 3);
  box(g, '#fff8ef', -4, -30, 1, 1);
  box(g, '#fff8ef', 3, -30, 1, 1);
  box(g, '#d6453c', -2, -26, 4, 2);
  box(g, '#6b4228', 8, -32, 6, 3);
  box(g, '#e6c56a', 12, -34, 3, 7);
  box(g, '#2a241c', -8, -22, 16, 14);
  box(g, '#9aafc4', -6, -20, 12, 10);
  box(g, '#5c6b7a', -6, -20, 3, 10);
  box(g, '#e6c56a', -2, -16, 4, 4);
  box(g, '#2a241c', -9, -10, 5, 8);
  box(g, '#2a241c', 4, -10, 5, 8);
  box(g, '#5c6b7a', -8, -9, 3, 6);
  box(g, '#5c6b7a', 5, -9, 3, 6);
}

function paintBunny(g) {
  box(g, '#2a241c', -11, -40, 8, 18);
  box(g, '#2a241c', 3, -40, 8, 18);
  box(g, '#f4d2dc', -10, -39, 6, 16);
  box(g, '#f4d2dc', 4, -39, 6, 16);
  box(g, '#f7a8b8', -8, -36, 2, 10);
  box(g, '#f7a8b8', 6, -36, 2, 10);
  box(g, '#2a241c', -12, -26, 24, 18);
  box(g, '#f4d2dc', -10, -24, 20, 14);
  box(g, '#e7b0c0', -10, -14, 6, 4);
  box(g, '#241610', -6, -20, 2, 3);
  box(g, '#241610', 4, -20, 2, 3);
  box(g, '#fff8ef', -6, -20, 1, 1);
  box(g, '#fff8ef', 4, -20, 1, 1);
  box(g, '#f29682', -2, -16, 4, 2);
  box(g, '#fff8ef', -6, -12, 12, 5);
  box(g, '#241610', -2, -10, 1, 1);
  box(g, '#e7b7c8', -8, -8, 16, 8);
  box(g, '#d7a0b0', -8, -4, 16, 3);
}

function paintDoll(g) {
  box(g, '#2a241c', -9, -40, 18, 8);
  box(g, '#6b4228', -8, -38, 16, 5);
  box(g, '#8c3048', -11, -34, 22, 4);
  box(g, '#e6c56a', -2, -37, 3, 2);
  box(g, '#2a241c', -7, -30, 14, 12);
  box(g, '#f6c8aa', -6, -28, 12, 9);
  box(g, '#f0b090', -6, -20, 12, 2);
  box(g, '#241610', -4, -24, 2, 2);
  box(g, '#241610', 2, -24, 2, 2);
  box(g, '#fff8ef', -4, -24, 1, 1);
  box(g, '#fff8ef', 2, -24, 1, 1);
  box(g, '#f29682', -5, -21, 2, 1);
  box(g, '#f29682', 3, -21, 2, 1);
  box(g, '#d6453c', -2, -20, 4, 1);
  box(g, '#2a241c', -9, -18, 18, 14);
  box(g, '#3d6ea8', -8, -17, 16, 11);
  box(g, '#2c507f', -8, -17, 3, 11);
  box(g, '#e6c56a', -2, -13, 4, 3);
  box(g, '#6b4228', -8, -7, 4, 6);
  box(g, '#6b4228', 4, -7, 4, 6);
}

function paintHorse(g) {
  box(g, '#2a241c', -14, -22, 26, 14);
  box(g, '#c48a4a', -12, -20, 22, 10);
  box(g, '#a56b3a', -12, -14, 22, 4);
  box(g, '#2a241c', 6, -36, 10, 18);
  box(g, '#c48a4a', 7, -34, 8, 14);
  box(g, '#6b4228', 8, -32, 4, 5);
  box(g, '#241610', 11, -28, 2, 2);
  box(g, '#fff8ef', 11, -28, 1, 1);
  box(g, '#8c3048', -6, -24, 10, 4);
  box(g, '#2a241c', -14, -12, 8, 8);
  box(g, '#2a241c', 6, -12, 8, 8);
  box(g, '#6b4228', -12, -10, 5, 5);
  box(g, '#6b4228', 8, -10, 5, 5);
  box(g, '#f3ead4', -11, -9, 2, 2);
  box(g, '#f3ead4', 9, -9, 2, 2);
}

function paintRocker(g) {
  box(g, '#6b4228', -16, -8, 14, 3);
  box(g, '#6b4228', 2, -8, 14, 3);
  box(g, '#8a5a32', -14, -10, 10, 3);
  box(g, '#8a5a32', 4, -10, 10, 3);
  box(g, '#c48a4a', -10, -28, 18, 18);
  box(g, '#a56b3a', -10, -16, 18, 6);
  box(g, '#6b4228', 4, -40, 10, 16);
  box(g, '#c48a4a', 5, -38, 8, 12);
  box(g, '#241610', 9, -32, 2, 2);
  box(g, '#fff8ef', 9, -32, 1, 1);
  box(g, '#8c3048', -4, -32, 8, 4);
  box(g, '#e6c56a', -2, -22, 3, 3);
}

function paintDuck(g) {
  box(g, '#2a241c', -12, -24, 22, 16);
  box(g, '#f5c20e', -10, -22, 18, 12);
  box(g, '#e6a010', -10, -12, 18, 3);
  box(g, '#2a241c', -6, -34, 14, 14);
  box(g, '#f5c20e', -4, -32, 12, 12);
  box(g, '#241610', 2, -28, 2, 2);
  box(g, '#fff8ef', 2, -28, 1, 1);
  box(g, '#e07a20', 6, -26, 8, 4);
  box(g, '#c46210', 6, -23, 8, 1);
  box(g, '#fff6d0', -6, -16, 6, 4);
  box(g, '#e07a20', -8, -8, 4, 3);
  box(g, '#e07a20', 2, -8, 4, 3);
}

function paintDino(g) {
  box(g, '#2a241c', -10, -30, 18, 14);
  box(g, '#3d8a55', -8, -28, 16, 12);
  box(g, '#6fbf7a', -6, -26, 6, 6);
  box(g, '#2f6b3a', -10, -34, 4, 4);
  box(g, '#2f6b3a', -2, -38, 4, 4);
  box(g, '#6fbf7a', 4, -36, 6, 6);
  box(g, '#241610', 2, -24, 2, 2);
  box(g, '#fff8ef', 2, -24, 1, 1);
  box(g, '#f29682', 4, -20, 4, 2);
  box(g, '#2a241c', -14, -18, 26, 12);
  box(g, '#3d8a55', -12, -16, 22, 10);
  box(g, '#2f6b3a', -12, -10, 22, 3);
  box(g, '#6fbf7a', 8, -20, 8, 4);
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
