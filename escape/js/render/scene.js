/** Frame renderer: sky, floating platform, y-sorted props, candle light. */

import { ROOMS } from '../data/rooms.js';
import { iso, topFace, poly } from '../engine/iso.js';
import { tileChar } from '../game/grid.js';
import {
  actorDepth,
  drawActor,
  drawFloorTile,
  drawLip,
  drawProp,
  drawWall,
  propDepth,
} from './art.js';

const FLOOR = new Set(['.', ',', '+']);

function mixHex(a, b, t) {
  const pa = hex(a);
  const pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function hex(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}

function makeStars(n) {
  const stars = [];
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.72,
      r: Math.random() < 0.08 ? 1.7 : 0.6 + Math.random() * 0.7,
      p: Math.random() * Math.PI * 2,
      tw: 0.6 + Math.random() * 1.6,
      par: 6 + Math.random() * 16,
    });
  }
  return stars;
}

function makeClouds() {
  const clouds = [];
  for (let i = 0; i < 7; i++) {
    clouds.push({
      x: Math.random(),
      y: 0.55 + Math.random() * 0.4,
      w: 80 + Math.random() * 140,
      h: 18 + Math.random() * 16,
      par: 18 + Math.random() * 30,
      a: 0.08 + Math.random() * 0.1,
    });
  }
  return clouds;
}

export function createScene() {
  const stars = makeStars(70);
  const clouds = makeClouds();
  const islands = [
    { x: 0.12, y: 0.58, s: 1 },
    { x: 0.78, y: 0.62, s: 0.7 },
    { x: 0.5, y: 0.7, s: 0.45 },
  ];
  let light = null;
  return {
    stars,
    clouds,
    islands,
    draw(ctx, view, state, time) {
      const room = ROOMS[state.roomId];
      const cam = camera(view, state, time);
      const dpr = view.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSky(ctx, view, room, state, time);
      drawStars(ctx, view, stars, cam, time, state);
      drawIslands(ctx, view, islands, cam, state);
      drawCloudLayer(ctx, view, clouds, cam, time, room, state);

      ctx.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, dpr * cam.ox, dpr * cam.oy);
      drawPlatform(ctx, room);
      const items = [];
      const rows = room.map.length;
      const cols = room.map[0].length;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = room.map[y][x];
          if (ch === '#' || ch === '=') {
            items.push({
              depth: x + 1 + y + 1,
              draw: () => drawWall(ctx, x, y, ch === '#', room.theme),
            });
          }
        }
      }
      for (const prop of room.props) {
        if (prop.type === 'note' || prop.type === 'star' || prop.type === 'brick') {
          items.push({
            depth: prop.x + prop.y + 0.05,
            draw: () => drawProp(ctx, prop, time, state),
          });
        } else {
          items.push({
            depth: propDepth(prop),
            draw: () => drawProp(ctx, prop, time, state),
          });
        }
      }
      items.push({
        depth: actorDepth(state.player),
        draw: () => drawActor(ctx, state.player),
      });
      if (state.roomId === 'atrium') drawCandleLines(ctx);
      items.sort((a, b) => a.depth - b.depth);
      for (const item of items) item.draw();
      drawMotes(ctx, state, time);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      light = drawLighting(ctx, view, room, cam, time, state, light);
      drawVignette(ctx, view);
      if (state.fade > 0.01) {
        ctx.fillStyle = `rgba(6, 7, 14, ${Math.min(1, state.fade)})`;
        ctx.fillRect(0, 0, view.w, view.h);
      }
      state._cam = cam;
    },
  };
}

function camera(view, state, time) {
  const tilesWide = view.w < 520 ? 5.5 : view.w < 900 ? 8.2 : 10.5;
  const scale = view.w / (tilesWide * 78);
  let tx = state.player.x;
  let ty = state.player.y;
  if (state.mode === 'title') {
    tx += Math.sin(time * 0.18) * 0.55;
    ty += Math.cos(time * 0.14) * 0.35;
  }
  if (!state._look) state._look = { x: tx, y: ty };
  if (state.camSnap) {
    state._look.x = tx;
    state._look.y = ty;
    state.camSnap = false;
  } else {
    const k = 1 - Math.pow(0.0015, 1 / 60);
    state._look.x += (tx - state._look.x) * 0.08;
    state._look.y += (ty - state._look.y) * 0.08;
    void k;
  }
  const focus = iso(state._look.x, state._look.y, 0);
  let ox = view.w / 2 - focus.x * scale;
  let oy = view.h * 0.44 - focus.y * scale;
  if (state.shake > 0) {
    ox += Math.sin(time * 42) * state.shake * 7;
    oy += Math.cos(time * 37) * state.shake * 4;
  }
  return { scale, ox, oy, tx: state._look.x, ty: state._look.y };
}

export function projectTile(state, view, tileX, tileY) {
  const cam = state._cam;
  if (!cam) return { x: view.w / 2, y: view.h / 2 };
  const p = iso(tileX, tileY, 0);
  return { x: p.x * cam.scale + cam.ox, y: p.y * cam.scale + cam.oy };
}

export function viewToTile(state, view, px, py) {
  const cam = state._cam;
  if (!cam) return { x: 0, y: 0 };
  const sx = (px - cam.ox) / cam.scale;
  const sy = (py - cam.oy) / cam.scale;
  const hx = 78 / 2;
  const hy = 39 / 2;
  return {
    x: (sx / hx + sy / hy) / 2,
    y: (sy / hy - sx / hx) / 2,
  };
}

function drawSky(ctx, view, room, state, time) {
  const dawn = state.dawn || 0;
  const top = mixHex(room.theme.skyTop, '#f3d2ae', dawn);
  const mid = mixHex(room.theme.skyMid, '#e7b7a8', dawn);
  const bot = mixHex(room.theme.skyBot, '#8ea6c8', dawn);
  const g = ctx.createLinearGradient(0, 0, 0, view.h);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, view.w, view.h);
  const moonX = view.w * (0.78 - camPar(state, 10) * 0.0008);
  const moonY = view.h * (0.16 + (state.roomId === 'tower' ? 0 : 0.02));
  const moonR = state.roomId === 'tower' ? 36 : 22;
  ctx.save();
  ctx.globalAlpha = 1 - dawn * 0.85;
  ctx.fillStyle = '#f4f0e2';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mixHex(room.theme.skyMid, '#d7deee', 0.2);
  ctx.beginPath();
  ctx.arc(moonX + moonR * 0.28, moonY - moonR * 0.1, moonR * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (dawn > 0.05) {
    const sun = ctx.createRadialGradient(view.w * 0.5, view.h * 0.92, 10, view.w * 0.5, view.h * 0.92, view.h * 0.55);
    sun.addColorStop(0, `rgba(255, 214, 170, ${0.35 * dawn})`);
    sun.addColorStop(1, 'rgba(255, 214, 170, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, view.w, view.h);
  }
  void time;
}

function camPar(state, amount) {
  if (!state._look) return 0;
  return (state._look.x - state._look.y) * amount;
}

function drawStars(ctx, view, stars, cam, time, state) {
  const dawn = state.dawn || 0;
  ctx.save();
  ctx.globalAlpha = 1 - dawn * 0.9;
  for (const s of stars) {
    const tw = 0.35 + Math.abs(Math.sin(time * s.tw + s.p)) * 0.65;
    const x = (s.x * view.w + cam.tx * s.par * -0.15) % view.w;
    const y = s.y * view.h * 0.7;
    ctx.globalAlpha = tw * (1 - dawn * 0.9);
    ctx.fillStyle = '#f7f4ea';
    ctx.beginPath();
    ctx.arc(x < 0 ? x + view.w : x, y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawIslands(ctx, view, islands, cam, state) {
  ctx.save();
  for (const isl of islands) {
    const x = isl.x * view.w - cam.tx * 8;
    const y = view.h * isl.y;
    ctx.fillStyle = state.dawn > 0.4 ? 'rgba(90, 70, 80, 0.35)' : 'rgba(18, 20, 36, 0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y, 70 * isl.s, 16 * isl.s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 8 * isl.s, y - 36 * isl.s, 16 * isl.s, 28 * isl.s);
    ctx.fillStyle = state.dawn > 0.5 ? '#f0d7a2' : '#f0d7a2';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - 2, y - 28 * isl.s, 3, 4);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawCloudLayer(ctx, view, clouds, cam, time, room, state) {
  for (const c of clouds) {
    const x = ((c.x * view.w + time * 6 + cam.tx * c.par * -0.2) % (view.w + 200)) - 100;
    const y = c.y * view.h;
    ctx.fillStyle = state.dawn > 0.3 ? `rgba(255, 236, 220, ${c.a + state.dawn * 0.12})` : room.theme.cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, c.w, c.h, 0, 0, Math.PI * 2);
    ctx.ellipse(x + c.w * 0.35, y + 4, c.w * 0.6, c.h * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatform(ctx, room) {
  const rows = room.map.length;
  const cols = room.map[0].length;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = tileChar(room, x, y);
      if (ch === ' ') continue;
      if (x === cols - 1) drawLip(ctx, x, y, 'east', room.theme.lip);
      if (y === rows - 1) drawLip(ctx, x, y, 'south', room.theme.lip);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = room.map[y][x];
      if (!FLOOR.has(ch) && ch !== '#' && ch !== '=') continue;
      const n = (x * 13 + y * 7) % 5;
      const color = n === 0 ? room.theme.floorC : (x + y) % 2 === 0 ? room.theme.floorA : room.theme.floorB;
      if (FLOOR.has(ch)) drawFloorTile(ctx, x, y, color, room.theme);
      else {
        poly(ctx, topFace(x, y, 1, 1, 0));
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }
}

function drawCandleLines(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(230, 201, 138, 0.28)';
  ctx.lineWidth = 2;
  const a = iso(6.5, 3.5, 2);
  const b = iso(6.5, 8.5, 2);
  const c = iso(2.5, 5.5, 2);
  const d = iso(9.5, 5.5, 2);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.stroke();
  ctx.restore();
}

function drawMotes(ctx, state, time) {
  if (!state.motes) return;
  for (const m of state.motes) {
    const p = iso(m.x, m.y, m.z);
    ctx.globalAlpha = Math.max(0, m.life / m.max);
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, m.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  void time;
}

function drawLighting(ctx, view, room, cam, time, state, light) {
  const lw = Math.max(2, view.w >> 1);
  const lh = Math.max(2, view.h >> 1);
  if (!light || light.width !== lw || light.height !== lh) {
    light = document.createElement('canvas');
    light.width = lw;
    light.height = lh;
  }
  const g = light.getContext('2d');
  const darkness = room.theme.darkness * (1 - (state.dawn || 0) * 0.82);
  g.clearRect(0, 0, lw, lh);
  g.fillStyle = `rgba(5, 7, 16, ${darkness})`;
  g.fillRect(0, 0, lw, lh);
  g.globalCompositeOperation = 'destination-out';
  for (const lit of room.lights) {
    paintLight(g, lit, cam, time, 1);
  }
  if ((state.dawn || 0) > 0.2) {
    g.fillStyle = `rgba(0,0,0,${(state.dawn - 0.2) * 0.55})`;
    g.fillRect(0, 0, lw, lh);
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(light, 0, 0, view.w, view.h);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const lit of room.lights) {
    const world = iso(lit.x, lit.y, 20);
    const sx = world.x * cam.scale + cam.ox;
    const sy = world.y * cam.scale + cam.oy;
    const flick = 0.75 + Math.sin(time * 6 + lit.phase) * 0.25;
    const r = lit.radius * cam.scale * 0.55 * flick;
    const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    grd.addColorStop(0, hexAlpha(lit.color, 0.28));
    grd.addColorStop(1, hexAlpha(lit.color, 0));
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return light;
}

function paintLight(g, lit, cam, time, alpha) {
  const flick = 0.88 + Math.sin(time * 6 + lit.phase) * 0.12;
  const world = iso(lit.x, lit.y, 24);
  const sx = (world.x * cam.scale + cam.ox) / 2;
  const sy = (world.y * cam.scale + cam.oy) / 2;
  const r = (lit.radius * cam.scale * flick) / 2;
  const grd = g.createRadialGradient(sx, sy, r * 0.05, sx, sy, r);
  grd.addColorStop(0, `rgba(0,0,0,${0.95 * alpha})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.beginPath();
  g.arc(sx, sy, r, 0, Math.PI * 2);
  g.fill();
}

function hexAlpha(h, a) {
  const [r, g, b] = hex(h);
  return `rgba(${r},${g},${b},${a})`;
}

function drawVignette(ctx, view) {
  const g = ctx.createRadialGradient(
    view.w * 0.5,
    view.h * 0.45,
    view.h * 0.2,
    view.w * 0.5,
    view.h * 0.5,
    view.h * 0.72,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, view.w, view.h);
}
