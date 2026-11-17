/** Top-down 16px tile renderer. Integer scale, no smoothing. */

import { ROOMS } from '../data/rooms.js';
import { drawCharacter, PLAYER_LOOK } from './character.js';

export const TILE = 16;

const SCALE_PHONE = 4;

function scaleFor(viewW) {
  if (viewW < 520) return SCALE_PHONE;
  if (viewW < 900) return 4;
  return 5;
}

export function createScene() {
  const tiles = new Map();
  let last = 0;
  return {
    draw(ctx, view, state, time) {
      const dt = Math.min(0.05, Math.max(0, time - (last || time)));
      last = time;
      const room = ROOMS[state.roomId];
      const cam = camera(view, state, dt);
      const dpr = view.dpr || 1;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintNight(ctx, view, time);

      const rows = room.map.length;
      const cols = room.map[0].length;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = room.map[y][x];
          const kind = ch === '#' || ch === '=' ? 'wall' : ch === '+' ? 'door' : 'floor';
          blitTile(ctx, tiles, kind, x, y, cam, room.id);
        }
      }

      const sprites = [];
      for (const prop of room.props) {
        sprites.push({
          y: prop.y + (prop.h || 1) - 0.2,
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
      void time;
    },
  };
}

function paintNight(ctx, view, time) {
  ctx.fillStyle = '#1b2433';
  ctx.fillRect(0, 0, view.w, view.h);
  ctx.fillStyle = '#f6e7c4';
  const stars = [[40, 80], [120, 36], [210, 110], [300, 54], [70, 180], [250, 160], [160, 220], [330, 200]];
  for (const [x, y] of stars) {
    const tw = (Math.sin(time * 2 + x) + 1) / 2;
    if (tw < 0.2) continue;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.fillStyle = '#243044';
  ctx.fillRect(0, view.h - 80, view.w, 80);
}

function camera(view, state, dt) {
  const scale = scaleFor(view.w);
  let tx = state.player.x;
  let ty = state.player.y;
  if (state.mode === 'title') {
    tx += Math.sin((state.player.idlePhase || 0) * 0.4) * 0.15;
  }
  if (!state._look) state._look = { x: tx, y: ty };
  if (state.camSnap) {
    state._look.x = tx;
    state._look.y = ty;
    state.camSnap = false;
  } else {
    const t = 1 - Math.exp(-8 * Math.max(0.001, dt || 0.016));
    state._look.x += (tx - state._look.x) * t;
    state._look.y += (ty - state._look.y) * t;
  }
  const room = ROOMS[state.roomId];
  const roomW = room.map[0].length * TILE * scale;
  const roomH = room.map.length * TILE * scale;
  const anchorY = state.mode === 'title' ? 0.38 : 0.46;
  let ox = view.w / 2 - state._look.x * TILE * scale;
  let oy = view.h * anchorY - state._look.y * TILE * scale;
  ox = roomW <= view.w ? (view.w - roomW) / 2 : Math.min(0, Math.max(view.w - roomW, ox));
  oy = roomH <= view.h ? (view.h - roomH) / 2 : Math.min(0, Math.max(view.h - roomH, oy));
  return { scale, ox: Math.round(ox), oy: Math.round(oy), tx: state._look.x, ty: state._look.y };
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

function blitTile(ctx, cache, kind, x, y, cam, roomId) {
  const key = kind + (kind === 'floor' ? roomId : '');
  let canvas = cache.get(key);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = TILE;
    canvas.height = TILE;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    if (kind === 'wall') paintWall(g);
    else if (kind === 'door') paintDoor(g);
    else paintFloor(g, roomId);
    cache.set(key, canvas);
  }
  const dx = Math.round(cam.ox + x * TILE * cam.scale);
  const dy = Math.round(cam.oy + y * TILE * cam.scale);
  ctx.drawImage(canvas, dx, dy, TILE * cam.scale, TILE * cam.scale);
}

function paintFloor(g, roomId) {
  const wood = roomId === 'tower' ? '#6d7384' : roomId === 'cloister' ? '#7d6a4e' : '#c4925a';
  const line = roomId === 'tower' ? '#596074' : roomId === 'cloister' ? '#5e4e38' : '#a87440';
  const hi = roomId === 'tower' ? '#8b93a6' : '#e0b878';
  g.fillStyle = wood;
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = line;
  g.fillRect(0, 0, 16, 1);
  g.fillRect(0, 8, 16, 1);
  g.fillStyle = hi;
  g.fillRect(0, 1, 16, 1);
  g.fillRect(0, 9, 16, 1);
  g.fillStyle = line;
  g.fillRect(3, 4, 2, 2);
  g.fillRect(11, 12, 2, 2);
}

function paintWall(g) {
  g.fillStyle = '#6b5344';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#efe0c4';
  g.fillRect(1, 1, 14, 10);
  g.fillStyle = '#e7c98a';
  g.fillRect(2, 2, 12, 8);
  g.fillStyle = '#5c4030';
  g.fillRect(0, 12, 16, 4);
  g.fillStyle = '#c4a882';
  g.fillRect(0, 12, 16, 1);
}

function paintDoor(g) {
  paintFloor(g, 'atrium');
  g.fillStyle = '#6b4228';
  g.fillRect(2, 1, 12, 14);
  g.fillStyle = '#8a5a32';
  g.fillRect(3, 2, 10, 12);
  g.fillStyle = '#e6c56a';
  g.fillRect(10, 8, 2, 2);
}

function origin(cam, x, y) {
  return {
    x: Math.round(cam.ox + x * TILE * cam.scale),
    y: Math.round(cam.oy + y * TILE * cam.scale),
  };
}

function drawPlayer(ctx, player, cam) {
  const p = origin(cam, player.x, player.y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(0, 2);
  drawCharacter(ctx, PLAYER_LOOK, player);
  ctx.restore();
}

function drawProp(ctx, prop, cam, state) {
  const p = origin(cam, prop.x + (prop.w || 1) / 2, prop.y + (prop.h || 1));
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-8, -16);
  paintProp(ctx, prop, state);
  ctx.restore();
}

function paintProp(ctx, prop, state) {
  const g = ctx;
  switch (prop.type) {
    case 'candle':
      box(g, 4, 6, 8, 8, '#d9cbb6', '#8a7058');
      g.fillStyle = '#f6e7a8';
      g.fillRect(6, 2, 4, 5);
      g.fillStyle = '#fff6d0';
      g.fillRect(7, 0, 2, 3);
      break;
    case 'book':
      box(g, 2, 6, 12, 8, propColor(prop), '#3a2418');
      g.fillStyle = '#f6e7c4';
      g.fillRect(5, 8, 6, 1);
      break;
    case 'bookshelf':
      box(g, 1, 0, 14, 16, '#6b4228', '#3a2418');
      for (let i = 0; i < 4; i++) {
        g.fillStyle = ['#8c3048', '#1d6a64', '#e6c98a', '#314e8a'][i];
        g.fillRect(3 + i * 3, 3, 2, 8);
      }
      break;
    case 'cauldron':
      g.fillStyle = '#3a4650';
      g.fillRect(2, 6, 12, 8);
      g.fillStyle = '#7ec8a8';
      g.fillRect(4, 4, 8, 4);
      break;
    case 'bottle':
      if (state.inv.includes(prop.item)) break;
      g.fillStyle = prop.tint || '#9fd7e8';
      g.fillRect(5, 4, 6, 8);
      g.fillStyle = '#f6ead8';
      g.fillRect(6, 2, 4, 2);
      break;
    case 'portrait':
      box(g, 2, 0, 12, 14, '#e6c98a', '#6b4228');
      g.fillStyle = '#f6c8aa';
      g.fillRect(5, 3, 6, 6);
      g.fillStyle = '#2a1814';
      g.fillRect(5, 3, 6, 2);
      break;
    case 'door':
      paintDoorMini(g, prop, state);
      break;
    case 'note':
      g.fillStyle = '#f3ead4';
      g.fillRect(3, 4, 10, 8);
      g.fillStyle = '#8a623c';
      g.fillRect(5, 6, 6, 1);
      g.fillRect(5, 8, 5, 1);
      break;
    case 'lectern':
      box(g, 3, 4, 10, 10, '#6b4228', '#3a2418');
      g.fillStyle = '#f3ead4';
      g.fillRect(4, 2, 8, 5);
      break;
    case 'tablet':
    case 'plaque':
    case 'chart':
      box(g, 2, 3, 12, 10, '#d9cbb6', '#6b5344');
      g.fillStyle = '#5c4030';
      g.fillRect(4, 6, 8, 1);
      g.fillRect(4, 8, 6, 1);
      break;
    case 'brazier':
      box(g, 3, 8, 10, 6, '#6b4228', '#3a2418');
      g.fillStyle = '#ffb15a';
      g.fillRect(6, 2, 4, 6);
      break;
    case 'bell':
      g.fillStyle = '#e6c56a';
      g.fillRect(5, 2, 6, 8);
      g.fillRect(6, 10, 4, 2);
      break;
    case 'dial':
      g.fillStyle = '#2a241c';
      g.fillRect(1, 2, 14, 12);
      g.fillStyle = '#e6c56a';
      g.fillRect(6, 5, 4, 4);
      break;
    case 'star':
      g.fillStyle = '#e6c56a';
      g.fillRect(6, 2, 4, 4);
      g.fillRect(4, 4, 8, 4);
      g.fillRect(6, 8, 4, 4);
      break;
    case 'brick':
      g.fillStyle = '#8a5a3a';
      g.fillRect(2, 6, 12, 6);
      g.fillStyle = '#5c3828';
      g.fillRect(4, 7, 8, 1);
      break;
    case 'banner':
      g.fillStyle = '#8c3048';
      g.fillRect(4, 0, 8, 12);
      g.fillStyle = '#e6c56a';
      g.fillRect(6, 3, 4, 4);
      break;
    case 'window':
      g.fillStyle = '#6b8cae';
      g.fillRect(2, 1, 12, 12);
      g.fillStyle = '#e6c56a';
      g.fillRect(7, 1, 2, 12);
      g.fillRect(2, 6, 12, 2);
      break;
    case 'stairs':
      g.fillStyle = '#8a7058';
      g.fillRect(1, 4, 14, 3);
      g.fillRect(2, 8, 12, 3);
      g.fillRect(3, 12, 10, 3);
      break;
    case 'crane':
      g.fillStyle = '#f4efe4';
      g.fillRect(4, 4, 8, 6);
      g.fillStyle = '#e6c56a';
      g.fillRect(7, 6, 2, 2);
      break;
    case 'npc':
      drawCharacter(g, PLAYER_LOOK, { facing: prop.facing || 'down', moving: false, walkPhase: 0, idlePhase: 0 });
      break;
    default:
      box(g, 3, 4, 10, 8, '#c4a882', '#5c4030');
  }
}

function propColor(prop) {
  const id = prop.book;
  if (id === '甲') return '#6b4632';
  if (id === '乙') return '#8c3048';
  if (id === '丙') return '#1d6a64';
  if (id === '丁') return '#e7e1d4';
  return '#f3ead4';
}

function box(g, x, y, w, h, fill, edge) {
  g.fillStyle = edge;
  g.fillRect(x, y, w, h);
  g.fillStyle = fill;
  g.fillRect(x + 1, y + 1, w - 2, h - 2);
}

function paintDoorMini(g, prop, state) {
  const locked = prop.exit === 'east' && prop.name === '东门' && !state.flags.candle_solved
    || prop.exit === 'north' && !state.inv.includes('copper_key');
  g.fillStyle = locked ? '#4a2c18' : '#8a5a32';
  g.fillRect(3, 1, 10, 14);
  g.fillStyle = '#e6c56a';
  g.fillRect(10, 8, 2, 2);
}
