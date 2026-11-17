/** Top-down 16px interiors. Integer scale, no smoothing. Walls carry the decoration. */

import { ROOMS } from '../data/rooms.js';
import { FRAME_H, drawCharacter, PLAYER_LOOK } from './character.js';

export const TILE = 16;

let sheet = null;
function spriteSheet() {
  if (!sheet && typeof Image !== 'undefined') {
    sheet = new Image();
    sheet.src = new URL('../../sprites/wife.png', import.meta.url).href;
  }
  return sheet;
}

function scaleFor(viewW) {
  if (viewW < 520) return 3;
  if (viewW < 900) return 4;
  return 5;
}

export function createScene() {
  const cache = new Map();
  let last = 0;
  return {
    draw(ctx, view, state, time) {
      const dt = Math.min(0.05, Math.max(0, time - (last || time)));
      last = time;
      const room = ROOMS[state.roomId];
      const cam = camera(view, state, room, dt);
      const dpr = view.dpr || 1;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = room.id === 'tower' ? '#1a2030' : '#2a211c';
      ctx.fillRect(0, 0, view.w, view.h);

      drawFrieze(ctx, cache, room, cam);
      const rows = room.map.length;
      const cols = room.map[0].length;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          blitTile(ctx, cache, room, x, y, cam);
        }
      }
      drawLights(ctx, room, cam, time);

      const sprites = [];
      for (const deco of decos(room)) {
        sprites.push({
          y: deco.y,
          draw: () => drawDeco(ctx, deco, cam, time),
        });
      }
      for (const prop of room.props) {
        sprites.push({
          y: prop.y + (prop.h || 1) - 0.15,
          draw: () => drawProp(ctx, prop, cam, state),
        });
      }
      sprites.push({
        y: state.player.y,
        draw: () => drawPlayer(ctx, state.player, cam),
      });
      sprites.sort((a, b) => a.y - b.y);
      for (const sprite of sprites) sprite.draw();

      if (state.fade > 0.01) {
        ctx.fillStyle = `rgba(20, 14, 10, ${Math.min(1, state.fade)})`;
        ctx.fillRect(0, 0, view.w, view.h);
      }
      state._cam = cam;
    },
  };
}

function camera(view, state, room, dt) {
  const scale = scaleFor(view.w);
  const cols = room.map[0].length;
  const rows = room.map.length;
  const roomW = cols * TILE * scale;
  const roomH = rows * TILE * scale;
  let tx = state.player.x;
  let ty = state.player.y;
  if (!state._look) state._look = { x: tx, y: ty };
  if (state.camSnap) {
    state._look.x = tx;
    state._look.y = ty;
    state.camSnap = false;
  } else {
    const ease = 1 - Math.exp(-8 * Math.max(0.001, dt || 0.016));
    state._look.x += (tx - state._look.x) * ease;
    state._look.y += (ty - state._look.y) * ease;
  }
  let ox = Math.round(view.w / 2 - state._look.x * TILE * scale);
  if (roomW + 12 < view.w) ox = Math.round((view.w - roomW) / 2);
  else ox = Math.max(view.w - roomW - 4, Math.min(4, ox));
  const toolbar = 88;
  const topHud = 54;
  const frieze = 32 * scale;
  // The whole room fits on a phone, so sit it on the toolbar instead of leaving a dark band.
  let oy = Math.round(view.h - toolbar - roomH);
  if (oy - frieze < topHud) oy = topHud + frieze;
  const follow = Math.round(view.h * 0.62 - state._look.y * TILE * scale);
  if (roomH + frieze > view.h - toolbar - topHud) {
    oy = Math.max(topHud, Math.min(view.h - toolbar - 4 * TILE * scale, follow));
  }
  void rows;
  return { scale, ox, oy, tx: state._look.x, ty: state._look.y };
}

export function projectTile(state, view, tileX, tileY) {
  const cam = state._cam;
  if (!cam) return { x: view.w / 2, y: view.h / 2 };
  return {
    x: tileX * TILE * cam.scale + cam.ox,
    y: tileY * TILE * cam.scale + cam.oy,
  };
}

export function viewToTile(state, view, px, py) {
  const cam = state._cam;
  if (!cam) return { x: 0, y: 0 };
  return {
    x: (px - cam.ox) / (TILE * cam.scale),
    y: (py - cam.oy) / (TILE * cam.scale),
  };
}

function origin(cam, x, y) {
  return {
    x: Math.round(cam.ox + x * TILE * cam.scale),
    y: Math.round(cam.oy + y * TILE * cam.scale),
  };
}

function blitTile(ctx, cache, room, x, y, cam) {
  const ch = room.map[y][x];
  const kind = ch === '#' || ch === '=' ? 'wall' : ch === '+' ? 'door' : 'floor';
  const rug = kind === 'floor' && inRug(room.id, x, y);
  const rugKey = rug
    ? [inRug(room.id, x - 1, y), inRug(room.id, x + 1, y), inRug(room.id, x, y - 1), inRug(room.id, x, y + 1)].join('')
    : '';
  const key = kind + ':' + room.id + ':' + (kind === 'floor' ? (rug ? 'rug' + rugKey : 'wood' + (y % 2) + (x % 3)) : edgeKind(room, x, y));
  let canvas = cache.get(key);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = TILE;
    canvas.height = TILE;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    if (kind === 'wall') paintWall(g, room, x, y);
    else if (kind === 'door') paintDoorTile(g, room.id);
    else paintFloor(g, room.id, x, y, rug);
    cache.set(key, canvas);
  }
  const dx = Math.round(cam.ox + x * TILE * cam.scale);
  const dy = Math.round(cam.oy + y * TILE * cam.scale);
  ctx.drawImage(canvas, dx, dy, TILE * cam.scale, TILE * cam.scale);
}

function edgeKind(room, x, y) {
  const rows = room.map.length;
  const cols = room.map[0].length;
  if (y === 0) return 'n';
  if (y === rows - 1) return 's';
  if (x === 0) return 'w';
  if (x === cols - 1) return 'e';
  return 'm';
}

function inRug(roomId, x, y) {
  if (roomId === 'tower') return x >= 4 && x <= 7 && y >= 5 && y <= 8;
  if (roomId === 'library') return x >= 3 && x <= 8 && y >= 5 && y <= 8;
  if (roomId === 'cloister') return x >= 3 && x <= 8 && y >= 5 && y <= 8;
  return x >= 3 && x <= 8 && y >= 4 && y <= 8;
}

function paintFloor(g, roomId, x, y, rug) {
  if (roomId === 'tower') {
    const alt = (x + y) % 2;
    g.fillStyle = alt ? '#6a7388' : '#5d667a';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a5366';
    g.fillRect(0, 15, 16, 1);
    g.fillRect(15, 0, 1, 16);
    g.fillStyle = '#808aa0';
    g.fillRect(1, 1, 2, 1);
  } else if (roomId === 'cloister') {
    g.fillStyle = (x + y) % 2 ? '#8a7356' : '#7d684c';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6b5640';
    g.fillRect(0, 0, 16, 1);
    g.fillRect((x * 5) % 16, 0, 1, 16);
  } else {
    g.fillStyle = y % 2 ? '#c4925a' : '#b8884e';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#8d6238';
    g.fillRect(0, 0, 16, 1);
    g.fillStyle = '#e2bc84';
    g.fillRect(0, 1, 16, 1);
    if (x % 3 === 0) {
      g.fillStyle = '#8d6238';
      g.fillRect(0, 0, 1, 16);
    }
    if ((x * 2 + y) % 5 === 0) {
      g.fillStyle = '#a56b3a';
      g.fillRect(6, 5, 2, 2);
    }
  }
  if (!rug) return;
  const color = roomId === 'library' ? '#2f5a45' : roomId === 'tower' ? '#3d4a78' : roomId === 'cloister' ? '#6e4a38' : '#8d3b3b';
  const edge = roomId === 'library' ? '#1d3d2e' : roomId === 'tower' ? '#2a3458' : '#5c2a28';
  g.fillStyle = color;
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = edge;
  if (!inRug(roomId, x - 1, y)) g.fillRect(0, 0, 2, 16);
  if (!inRug(roomId, x + 1, y)) g.fillRect(14, 0, 2, 16);
  if (!inRug(roomId, x, y - 1)) g.fillRect(0, 0, 16, 2);
  if (!inRug(roomId, x, y + 1)) g.fillRect(0, 14, 16, 2);
  g.fillStyle = '#e6c56a';
  if ((x + y) % 4 === 0) g.fillRect(7, 7, 2, 2);
}

function paintWall(g, room, x, y) {
  const edge = edgeKind(room, x, y);
  const stone = room.id === 'tower';
  g.fillStyle = stone ? '#3e4658' : '#6b4228';
  g.fillRect(0, 0, 16, 16);
  if (edge === 'n') {
    g.fillStyle = stone ? '#6a758c' : '#efe0c4';
    g.fillRect(0, 0, 16, 8);
    g.fillStyle = stone ? '#2c3344' : '#5c4030';
    g.fillRect(0, 8, 16, 8);
    g.fillStyle = '#e6c56a';
    g.fillRect(0, 8, 16, 2);
  } else if (edge === 's') {
    g.fillStyle = stone ? '#5a6478' : '#8a5a32';
    g.fillRect(1, 2, 14, 10);
    g.fillStyle = '#e6c56a';
    if (x % 3 === 0) g.fillRect(6, 0, 4, 16);
  } else {
    g.fillStyle = stone ? '#4a5366' : '#6b4228';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = stone ? '#5c677c' : '#8a5a32';
    g.fillRect(1, 0, 14, 11);
    g.fillStyle = stone ? '#7d879c' : '#c4a070';
    g.fillRect(2, 1, 5, 4);
    g.fillStyle = stone ? '#2c3344' : '#4a2c18';
    g.fillRect(0, 11, 16, 5);
    g.fillStyle = '#e6c56a';
    g.fillRect(0, 11, 16, 1);
    g.fillStyle = stone ? '#2c3344' : '#5c3828';
    g.fillRect(0, 0, 1, 16);
    g.fillRect(15, 0, 1, 16);
  }
}

function paintDoorTile(g, roomId) {
  g.fillStyle = roomId === 'tower' ? '#5d667a' : '#c4925a';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#4a2c18';
  g.fillRect(2, 0, 12, 16);
  g.fillStyle = '#8a5a32';
  g.fillRect(3, 1, 10, 14);
  g.fillStyle = '#e6c56a';
  g.fillRect(10, 8, 2, 2);
  g.fillStyle = '#6b4228';
  g.fillRect(4, 3, 8, 1);
  g.fillRect(4, 6, 8, 1);
}

function drawFrieze(ctx, cache, room, cam) {
  const cols = room.map[0].length;
  const srcH = 32;
  const key = 'frieze:' + room.id + ':' + srcH;
  let canvas = cache.get(key);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = cols * TILE;
    canvas.height = srcH;
    paintFrieze(canvas.getContext('2d'), room, srcH);
    cache.set(key, canvas);
  }
  const dw = cols * TILE * cam.scale;
  const dh = srcH * cam.scale;
  ctx.drawImage(canvas, cam.ox, cam.oy - dh, dw, dh);
}

function paintFrieze(g, room, height) {
  const cols = room.map[0].length;
  const width = cols * TILE;
  const stone = room.id === 'tower';
  const paper = stone ? '#5c677c' : room.id === 'cloister' ? '#cbb892' : '#f0ddb4';
  g.fillStyle = paper;
  g.fillRect(0, 0, width, height);
  g.fillStyle = stone ? '#515c72' : '#e4cd9e';
  for (let x = 2; x < width; x += 8) g.fillRect(x, 6, 2, 2);
  g.fillStyle = '#4a2c18';
  g.fillRect(0, 0, width, 3);
  g.fillStyle = '#e6c56a';
  g.fillRect(0, 3, width, 1);
  g.fillStyle = stone ? '#2c3344' : '#6b4228';
  g.fillRect(0, height - 8, width, 8);
  g.fillStyle = '#c4a882';
  g.fillRect(0, height - 8, width, 2);
  for (let col = 1; col < cols - 1; col++) {
    const feature = friezeFeature(room.id, col);
    const px = col * TILE + 1;
    if (feature === 'window') drawWindow(g, px, 5, 16);
    else if (feature === 'books') drawWallBooks(g, px, 6, 22);
    else if (feature === 'painting') drawPainting(g, px, 5, room.id);
    else drawSconce(g, px + 3, 6);
  }
}

function friezeFeature(roomId, col) {
  if (roomId === 'library') return col % 2 === 0 ? 'books' : 'window';
  if (roomId === 'tower') return col % 3 === 0 ? 'window' : 'sconce';
  if (roomId === 'cloister') return col % 3 === 1 ? 'window' : 'painting';
  if (col % 5 === 2) return 'window';
  if (col % 5 === 4) return 'books';
  if (col % 5 === 0) return 'painting';
  return 'sconce';
}

function drawWindow(g, x, y, h) {
  g.fillStyle = '#4a2c18';
  g.fillRect(x, y, 14, h);
  g.fillStyle = '#8ec4e0';
  g.fillRect(x + 2, y + 2, 10, h - 4);
  g.fillStyle = '#d8f2ff';
  g.fillRect(x + 3, y + 3, 3, Math.max(2, h - 8));
  g.fillStyle = '#4a2c18';
  g.fillRect(x + 6, y + 2, 2, h - 4);
  g.fillRect(x + 2, y + Math.floor(h / 2), 10, 2);
}

function drawWallBooks(g, x, y, bottom) {
  g.fillStyle = '#4a2c18';
  g.fillRect(x, y, 14, bottom - y);
  const colors = ['#8c3048', '#1d6a64', '#e6c98a', '#314e8a', '#c47a32', '#6b8f71'];
  let by = y + 2;
  while (by < bottom - 6) {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = colors[(i + by) % colors.length];
      g.fillRect(x + 2 + i * 3, by, 2, 6);
    }
    g.fillStyle = '#6b4228';
    g.fillRect(x + 1, by + 6, 12, 2);
    by += 9;
  }
}

function drawPainting(g, x, y, roomId) {
  g.fillStyle = '#e6c56a';
  g.fillRect(x, y, 14, 16);
  g.fillStyle = roomId === 'cloister' ? '#6a8f6a' : '#7eb0c8';
  g.fillRect(x + 2, y + 2, 10, 12);
  g.fillStyle = '#3d6b4f';
  g.fillRect(x + 2, y + 9, 10, 5);
  g.fillStyle = '#f6e7c4';
  g.fillRect(x + 6, y + 4, 2, 4);
}

function drawSconce(g, x, y) {
  g.fillStyle = '#6b4228';
  g.fillRect(x + 2, y + 6, 4, 8);
  g.fillStyle = '#f6e7a8';
  g.fillRect(x + 2, y + 2, 4, 5);
  g.fillStyle = '#fff6d0';
  g.fillRect(x + 3, y, 2, 3);
}

function drawLights(ctx, room, cam, time) {
  const flick = 0.55 + Math.sin(time * 6) * 0.15;
  ctx.save();
  for (const deco of decos(room)) {
    if (deco.kind !== 'lamp') continue;
    const p = origin(cam, deco.x, deco.y + 0.4);
    ctx.fillStyle = `rgba(255, 210, 120, ${0.16 * flick})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 22 * cam.scale / 2, 12 * cam.scale / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const prop of room.props) {
    if (prop.type !== 'candle' && prop.type !== 'brazier') continue;
    const p = origin(cam, prop.x + 0.5, prop.y + 0.8);
    ctx.fillStyle = `rgba(255, 196, 90, ${0.18 * flick})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 28 * cam.scale / 2, 14 * cam.scale / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function decos(room) {
  const cols = room.map[0].length;
  const rows = room.map.length;
  const list = [
    { kind: 'plant', x: 1.15, y: 1.2 },
    { kind: 'plant', x: cols - 2.15, y: 1.2 },
    { kind: 'plant', x: 1.15, y: rows - 2.25 },
    { kind: 'plant', x: cols - 2.15, y: rows - 2.25 },
  ];
  list.push(
    { kind: 'chair', x: 3.3, y: 3.5 },
    { kind: 'lamp', x: 1.35, y: 4.4 },
    { kind: 'shelf', x: cols - 1.85, y: 3.3 },
    { kind: 'plants', x: cols - 2.4, y: rows - 2.4 },
  );
  if (room.id === 'library') {
    list.push({ kind: 'shelf', x: 1.05, y: 4.2 }, { kind: 'table', x: 4.2, y: 8.3 });
  }
  if (room.id === 'atrium') {
    list.push({ kind: 'table', x: 2.3, y: 3.4 }, { kind: 'papers', x: 8.5, y: 7.5 });
  }
  if (room.id === 'cloister') {
    list.push({ kind: 'crate', x: 8.3, y: 7.4 });
  }
  if (room.id === 'tower') {
    list.push({ kind: 'chair', x: 8.4, y: 6.5 });
  }
  return list.filter((item) => {
    const tx = Math.floor(item.x);
    const ty = Math.floor(item.y);
    const ch = room.map[ty]?.[tx];
    if (ch !== '.') return false;
    return !room.props.some((prop) => {
      const w = prop.w || 1;
      const h = prop.h || 1;
      return tx >= prop.x && tx < prop.x + w && ty >= prop.y && ty < prop.y + h;
    });
  });
}

function drawDeco(ctx, deco, cam, time) {
  const p = origin(cam, deco.x, deco.y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-8, -16);
  if (deco.kind === 'plant' || deco.kind === 'plants') paintPlant(ctx, deco.kind === 'plants');
  else if (deco.kind === 'shelf') paintShelf(ctx);
  else if (deco.kind === 'table') paintTable(ctx);
  else if (deco.kind === 'chair') paintChair(ctx);
  else if (deco.kind === 'lamp') paintLamp(ctx);
  else if (deco.kind === 'papers') {
    ctx.fillStyle = '#f3ead4';
    ctx.fillRect(2, 8, 10, 7);
    ctx.fillStyle = '#8a623c';
    ctx.fillRect(4, 10, 6, 1);
  } else if (deco.kind === 'crate') {
    ctx.fillStyle = '#8a5a32';
    ctx.fillRect(1, 6, 14, 10);
    ctx.fillStyle = '#6b4228';
    ctx.fillRect(1, 10, 14, 2);
  }
  ctx.restore();
  void time;
}

function paintPlant(g, cluster) {
  const pots = cluster ? [[1, 0], [6, 2], [11, 0]] : [[4, 0]];
  for (const [ox, oy] of pots) {
    g.fillStyle = '#6b4228';
    g.fillRect(ox, 12 + oy, 6, 4);
    g.fillStyle = '#2f6b3a';
    g.fillRect(ox - 1, 7 + oy, 8, 6);
    g.fillStyle = '#3f8a48';
    g.fillRect(ox + 1, 3 + oy, 4, 5);
  }
}

function paintChair(g) {
  g.fillStyle = '#6b4228';
  g.fillRect(3, 2, 10, 8);
  g.fillStyle = '#8a5a32';
  g.fillRect(2, 10, 12, 3);
  g.fillStyle = '#4a2c18';
  g.fillRect(3, 13, 2, 4);
  g.fillRect(11, 13, 2, 4);
}

function paintLamp(g) {
  g.fillStyle = '#6b4228';
  g.fillRect(6, 10, 4, 8);
  g.fillStyle = '#e6c56a';
  g.fillRect(4, 8, 8, 3);
  g.fillStyle = '#fff1c4';
  g.fillRect(5, 2, 6, 6);
  g.fillStyle = '#fffef4';
  g.fillRect(7, 3, 2, 3);
}

function paintShelf(g) {
  g.fillStyle = '#4a2c18';
  g.fillRect(0, 0, 16, 20);
  const colors = ['#8c3048', '#e6c98a', '#1d6a64', '#314e8a'];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = colors[i];
    g.fillRect(2 + i * 3, 3, 2, 6);
    g.fillRect(2 + ((i + 1) % 4) * 3, 12, 2, 5);
  }
}

function paintTable(g) {
  g.fillStyle = '#6b4228';
  g.fillRect(1, 8, 14, 8);
  g.fillStyle = '#8a5a32';
  g.fillRect(2, 6, 12, 4);
  g.fillStyle = '#f3ead4';
  g.fillRect(4, 5, 5, 3);
  g.fillStyle = '#8c3048';
  g.fillRect(10, 4, 3, 4);
}

function drawPlayer(ctx, player, cam) {
  const p = origin(cam, player.x, player.y + 0.42);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(cam.scale, cam.scale);
  drawCharacter(ctx, PLAYER_LOOK, player, spriteSheet());
  ctx.restore();
}

function drawProp(ctx, prop, cam, state) {
  if (prop.type === 'bottle' && state.inv.includes(prop.item)) return;
  const p = origin(cam, prop.x + (prop.w || 1) / 2, prop.y + (prop.h || 1));
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-8, -20);
  paintProp(ctx, prop, state);
  ctx.restore();
}

function paintProp(g, prop, state) {
  switch (prop.type) {
    case 'candle':
      g.fillStyle = '#6b4228';
      g.fillRect(3, 14, 10, 6);
      g.fillStyle = '#e7d7bc';
      g.fillRect(6, 6, 4, 9);
      g.fillStyle = '#f6e7a8';
      g.fillRect(6, 2, 4, 5);
      g.fillStyle = '#fff6d0';
      g.fillRect(7, 0, 2, 3);
      break;
    case 'book':
      g.fillStyle = '#6b4228';
      g.fillRect(1, 12, 14, 6);
      g.fillStyle = bookColor(prop);
      g.fillRect(3, 6, 10, 8);
      g.fillStyle = '#f6e7c4';
      g.fillRect(5, 8, 6, 1);
      g.fillStyle = '#e6c56a';
      g.fillRect(4, 6, 8, 1);
      break;
    case 'bookshelf':
      paintShelf(g);
      g.fillStyle = '#4a2c18';
      g.fillRect(0, 18, 16, 4);
      break;
    case 'cauldron':
      g.fillStyle = '#2c3844';
      g.fillRect(1, 8, 14, 10);
      g.fillStyle = '#7ec8a8';
      g.fillRect(3, 5, 10, 5);
      g.fillStyle = '#d8fff0';
      g.fillRect(6, 3, 4, 3);
      g.fillStyle = '#6b4228';
      g.fillRect(0, 16, 4, 4);
      g.fillRect(12, 16, 4, 4);
      break;
    case 'bottle':
      g.fillStyle = prop.tint || '#9fd7e8';
      g.fillRect(5, 6, 6, 10);
      g.fillStyle = '#f6ead8';
      g.fillRect(6, 3, 4, 4);
      g.fillStyle = '#ffffff';
      g.fillRect(6, 8, 2, 4);
      break;
    case 'portrait':
      g.fillStyle = '#e6c56a';
      g.fillRect(2, 0, 12, 16);
      g.fillStyle = '#f6c8aa';
      g.fillRect(4, 3, 8, 7);
      g.fillStyle = '#2a1814';
      g.fillRect(4, 3, 8, 3);
      g.fillStyle = '#f7e8c6';
      g.fillRect(4, 5, 8, 2);
      break;
    case 'door':
      g.fillStyle = '#4a2c18';
      g.fillRect(2, 2, 12, 18);
      g.fillStyle = '#8a5a32';
      g.fillRect(3, 4, 10, 14);
      g.fillStyle = '#6b4228';
      g.fillRect(4, 8, 8, 1);
      g.fillStyle = '#e6c56a';
      g.fillRect(10, 12, 2, 2);
      break;
    case 'note':
      g.fillStyle = '#f3ead4';
      g.fillRect(2, 6, 12, 10);
      g.fillStyle = '#8a623c';
      g.fillRect(4, 8, 8, 1);
      g.fillRect(4, 11, 6, 1);
      break;
    case 'lectern':
      g.fillStyle = '#4a2c18';
      g.fillRect(2, 8, 12, 12);
      g.fillStyle = '#8a5a32';
      g.fillRect(1, 4, 14, 6);
      g.fillStyle = '#f3ead4';
      g.fillRect(3, 2, 10, 5);
      g.fillStyle = '#8c3048';
      g.fillRect(5, 3, 6, 1);
      break;
    case 'tablet':
    case 'plaque':
    case 'chart':
      g.fillStyle = '#d9cbb6';
      g.fillRect(1, 4, 14, 12);
      g.fillStyle = '#6b5344';
      g.fillRect(3, 7, 10, 1);
      g.fillRect(3, 10, 8, 1);
      g.fillStyle = '#e6c56a';
      g.fillRect(1, 4, 14, 2);
      break;
    case 'brazier':
      g.fillStyle = '#4a2c18';
      g.fillRect(2, 12, 12, 8);
      g.fillStyle = '#ffb15a';
      g.fillRect(5, 4, 6, 9);
      g.fillStyle = '#fff6d0';
      g.fillRect(7, 1, 2, 4);
      break;
    case 'bell':
      g.fillStyle = '#e6c56a';
      g.fillRect(4, 2, 8, 10);
      g.fillStyle = '#8a6230';
      g.fillRect(7, 12, 2, 4);
      g.fillStyle = '#fff6d0';
      g.fillRect(6, 4, 2, 3);
      break;
    case 'dial':
      g.fillStyle = '#2a241c';
      g.fillRect(0, 4, 16, 14);
      g.fillStyle = '#e6c56a';
      g.fillRect(2, 6, 12, 10);
      g.fillStyle = '#2a241c';
      g.fillRect(6, 8, 4, 4);
      g.fillStyle = '#8c3048';
      g.fillRect(7, 6, 2, 3);
      break;
    case 'star':
      g.fillStyle = '#f5c20e';
      g.fillRect(6, 4, 4, 4);
      g.fillRect(4, 6, 8, 4);
      g.fillRect(6, 10, 4, 4);
      g.fillStyle = '#2a1814';
      g.fillRect(5, 7, 2, 2);
      g.fillRect(9, 7, 2, 2);
      break;
    case 'brick':
      g.fillStyle = '#8a5a3a';
      g.fillRect(1, 10, 14, 6);
      g.fillStyle = '#5c3828';
      g.fillRect(3, 12, 10, 1);
      break;
    case 'banner':
      g.fillStyle = '#8c3048';
      g.fillRect(3, 0, 10, 16);
      g.fillStyle = '#e6c56a';
      g.fillRect(6, 4, 4, 6);
      break;
    case 'window':
      drawWindow(g, 1, 0, 18);
      break;
    case 'stairs':
      g.fillStyle = '#8a7058';
      g.fillRect(0, 6, 16, 4);
      g.fillRect(1, 10, 14, 4);
      g.fillRect(2, 14, 12, 4);
      g.fillStyle = '#e6c56a';
      g.fillRect(0, 6, 16, 1);
      break;
    case 'crane':
      g.fillStyle = '#f4efe4';
      g.fillRect(4, 6, 8, 8);
      g.fillStyle = '#e6c56a';
      g.fillRect(7, 8, 2, 3);
      break;
    case 'npc':
      drawCharacter(g, PLAYER_LOOK, { facing: prop.facing || 'down', moving: false, walkPhase: 0 }, spriteSheet());
      break;
    default:
      g.fillStyle = '#c4a882';
      g.fillRect(2, 8, 12, 8);
  }
  void state;
  void FRAME_H;
}

function bookColor(prop) {
  if (prop.book === '甲') return '#6b4632';
  if (prop.book === '乙') return '#8c3048';
  if (prop.book === '丙') return '#1d6a64';
  return '#f3ead4';
}
