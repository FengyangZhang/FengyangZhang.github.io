/** Procedural art. No images. Everything here is drawn with canvas paths. */

import { BOOKS, CANDLES } from '../data/world.js';
import { iso, leftFace, poly, rightFace, topFace } from '../engine/iso.js';

const SANS = '"PingFang SC", "WenQuanYi Micro Hei", "Droid Sans Fallback", sans-serif';

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function fillStar(ctx, x, y, r, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawGlyph(ctx, name, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.25, s * 0.09);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const u = s * 0.42;
  if (name === 'sun') {
    ctx.beginPath();
    ctx.arc(0, 0, u * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, u * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (name === 'moon') {
    ctx.beginPath();
    ctx.arc(u * 0.12, 0, u * 0.78, 0.6, Math.PI * 2 - 0.6);
    ctx.arc(-u * 0.05, 0, u * 0.55, Math.PI * 2 - 0.7, 0.7, true);
    ctx.closePath();
    ctx.fill();
  } else if (name === 'ring') {
    roundRect(ctx, -u, -u, u * 2, u * 2, u * 0.25);
    ctx.stroke();
  } else if (name === 'fork') {
    ctx.beginPath();
    ctx.moveTo(0, u);
    ctx.lineTo(0, -u * 0.2);
    ctx.moveTo(0, -u * 0.15);
    ctx.lineTo(-u * 0.7, -u);
    ctx.moveTo(0, -u * 0.15);
    ctx.lineTo(0, -u);
    ctx.moveTo(0, -u * 0.15);
    ctx.lineTo(u * 0.7, -u);
    ctx.stroke();
  } else if (name === 'feather') {
    ctx.beginPath();
    ctx.moveTo(0, u);
    ctx.quadraticCurveTo(u * 0.1, 0, 0, -u);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, u * 0.45);
    ctx.quadraticCurveTo(u * 0.9, u * 0.1, u * 0.2, -u * 0.55);
    ctx.moveTo(0, u * 0.1);
    ctx.quadraticCurveTo(-u * 0.85, -u * 0.15, -u * 0.15, -u * 0.7);
    ctx.stroke();
  } else if (name === 'key') {
    ctx.beginPath();
    ctx.arc(0, -u * 0.45, u * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -u * 0.05);
    ctx.lineTo(0, u);
    ctx.moveTo(0, u * 0.55);
    ctx.lineTo(u * 0.38, u * 0.55);
    ctx.moveTo(0, u * 0.85);
    ctx.lineTo(u * 0.28, u * 0.85);
    ctx.stroke();
  } else if (name === 'flame') {
    ctx.beginPath();
    ctx.moveTo(0, -u);
    ctx.bezierCurveTo(u, -u * 0.2, u * 0.7, u * 0.2, 0, u);
    ctx.bezierCurveTo(-u * 0.7, u * 0.2, -u, -u * 0.2, 0, -u);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBox(ctx, x, y, w, h, z, height, top, left, right) {
  poly(ctx, leftFace(x, y, w, h, z, z + height));
  ctx.fillStyle = left;
  ctx.fill();
  poly(ctx, rightFace(x, y, w, h, z, z + height));
  ctx.fillStyle = right;
  ctx.fill();
  poly(ctx, topFace(x, y, w, h, z + height));
  ctx.fillStyle = top;
  ctx.fill();
}

export function drawFloorTile(ctx, x, y, color, theme) {
  poly(ctx, topFace(x, y, 1, 1, 0));
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,236,200,0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const n = (x * 3 + y * 5) % 11;
  if (n === 0) {
    const c = iso(x + 0.5, y + 0.5, 1);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, 0.5);
    ctx.strokeStyle = 'rgba(226, 196, 130, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  void theme;
}

export function drawLip(ctx, x, y, side, color) {
  const z0 = 0;
  const z1 = -24;
  const face = side === 'south'
    ? [iso(x, y + 1, z0), iso(x + 1, y + 1, z0), iso(x + 1, y + 1, z1), iso(x, y + 1, z1)]
    : [iso(x + 1, y, z0), iso(x + 1, y + 1, z0), iso(x + 1, y + 1, z1), iso(x + 1, y, z1)];
  poly(ctx, face);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawWall(ctx, x, y, tall, theme) {
  const height = tall ? 108 : 30;
  drawBox(ctx, x, y, 1, 1, 0, height, theme.wallTop, theme.wall, theme.wallDark);
  if (tall && (x + y) % 3 === 0) {
    const glassTop = 62;
    const glassH = 28;
    poly(ctx, leftFace(x + 0.18, y + 0.55, 0.64, 0.08, glassTop, glassTop + glassH));
    ctx.fillStyle = 'rgba(126, 200, 195, 0.35)';
    ctx.fill();
    poly(ctx, rightFace(x + 0.72, y + 0.18, 0.08, 0.64, glassTop, glassTop + glassH));
    ctx.fillStyle = 'rgba(240, 215, 162, 0.28)';
    ctx.fill();
  }
}

function atTile(ctx, x, y, z, fn) {
  const p = iso(x, y, z);
  ctx.save();
  ctx.translate(p.x, p.y);
  fn(ctx);
  ctx.restore();
}

export function drawProp(ctx, prop, time, state) {
  const t = time;
  switch (prop.type) {
    case 'candle':
      drawCandle(ctx, prop, t);
      break;
    case 'portrait':
      drawPortrait(ctx, prop, t);
      break;
    case 'banner':
      drawBanner(ctx, prop, t);
      break;
    case 'plaque':
      drawPlaque(ctx, prop);
      break;
    case 'brazier':
      drawBrazier(ctx, prop, t, state);
      break;
    case 'stairs':
      drawStairs(ctx, prop, t, state);
      break;
    case 'crane':
      drawCrane(ctx, prop, t);
      break;
    case 'star':
      drawStarTile(ctx, prop, t);
      break;
    case 'brick':
      drawBrick(ctx, prop, state);
      break;
    case 'door':
      drawDoor(ctx, prop, state);
      break;
    case 'bookshelf':
      drawBookshelf(ctx, prop);
      break;
    case 'book':
      drawBook(ctx, prop, state);
      break;
    case 'note':
      drawNote(ctx, prop, t);
      break;
    case 'lectern':
      drawLectern(ctx, prop, t);
      break;
    case 'window':
      drawWindow(ctx, prop, t);
      break;
    case 'bottle':
      drawBottle(ctx, prop, state);
      break;
    case 'tablet':
      drawTablet(ctx, prop);
      break;
    case 'chart':
      drawChart(ctx, prop);
      break;
    case 'cauldron':
      drawCauldron(ctx, prop, t);
      break;
    case 'bell':
      drawBell(ctx, prop, t, state);
      break;
    case 'dial':
      drawDial(ctx, prop, t, state);
      break;
    default:
      break;
  }
}

function drawCandle(ctx, prop, time) {
  const spec = CANDLES.find((c) => c.id === prop.candle);
  drawBox(ctx, prop.x + 0.22, prop.y + 0.22, 0.56, 0.56, 0, 16, '#6d6458', '#4a433c', '#3a342e');
  const flick = 0.82 + Math.sin(time * 9 + prop.x * 2) * 0.12 + Math.sin(time * 13) * 0.06;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 18, (c) => {
    c.fillStyle = spec.metal;
    roundRect(c, -2, -16, 4, 16, 1);
    c.fill();
    c.fillStyle = '#f6ead8';
    c.fillRect(-3, -20, 6, 5);
    c.save();
    c.scale(1, flick);
    c.fillStyle = spec.flame;
    c.beginPath();
    c.moveTo(0, -36);
    c.bezierCurveTo(7, -24, 5, -18, 0, -16);
    c.bezierCurveTo(-5, -18, -7, -24, 0, -36);
    c.fill();
    c.fillStyle = '#fff6d8';
    c.beginPath();
    c.moveTo(0, -30);
    c.bezierCurveTo(3, -24, 2, -20, 0, -18);
    c.bezierCurveTo(-2, -20, -3, -24, 0, -30);
    c.fill();
    c.restore();
    drawGlyph(c, spec.rune, 0, -8, 16, '#2a241c');
  });
}

function drawPortrait(ctx, prop, time) {
  drawBox(ctx, prop.x + 0.15, prop.y + 0.28, 0.7, 0.5, 0, 10, '#5c4a32', '#3d3226', '#2c241c');
  const blink = Math.sin(time * 1.7 + prop.x) > 0.97;
  atTile(ctx, prop.x + 0.5, prop.y + 0.48, 12, (c) => {
    c.fillStyle = '#8a6a3a';
    roundRect(c, -20, -78, 40, 70, 4);
    c.fill();
    c.fillStyle = '#e6c98a';
    roundRect(c, -16, -74, 32, 62, 3);
    c.strokeStyle = '#e6c98a';
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = prop.who === 'young' ? '#243044' : '#1a2030';
    c.fillRect(-14, -72, 28, 52);
    // face
    c.fillStyle = prop.who === 'young' ? '#f0c2a8' : '#e4b898';
    c.beginPath();
    c.ellipse(0, -50, 9, 11, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = prop.who === 'young' ? '#3a241c' : '#d9dde8';
    c.beginPath();
    if (prop.who === 'young') {
      c.arc(0, -56, 9.5, Math.PI, Math.PI * 2);
      c.fill();
      c.fillRect(-9, -56, 18, 6);
    } else {
      c.ellipse(-7, -58, 4, 3, 0, 0, Math.PI * 2);
      c.ellipse(7, -58, 4, 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    if (!blink) {
      c.fillStyle = '#241816';
      c.beginPath();
      c.arc(-3.2, -50, 1, 0, Math.PI * 2);
      c.arc(3.2, -50, 1, 0, Math.PI * 2);
      c.fill();
    } else {
      c.strokeStyle = '#241816';
      c.beginPath();
      c.moveTo(-5, -50);
      c.lineTo(-1.5, -50);
      c.moveTo(1.5, -50);
      c.lineTo(5, -50);
      c.stroke();
    }
    c.strokeStyle = '#a85a52';
    c.lineWidth = 0.8;
    c.beginPath();
    c.arc(0, -46, 2.4, 0.1 * Math.PI, 0.9 * Math.PI);
    c.stroke();
    c.fillStyle = prop.who === 'young' ? '#7ec8c3' : '#3d4e6a';
    c.fillRect(-12, -36, 24, 14);
    c.fillStyle = '#e6c98a';
    c.font = '9px ' + SANS;
    c.textAlign = 'center';
    c.fillText(prop.who === 'young' ? '简疏桐' : '裴照微', 0, -8);
  });
}

function drawBanner(ctx, prop, time) {
  const sway = Math.sin(time * 1.3) * 2;
  atTile(ctx, prop.x + 0.5, prop.y + 0.55, 8, (c) => {
    c.fillStyle = '#6b2d3c';
    c.beginPath();
    c.moveTo(-16, -70);
    c.lineTo(16, -70);
    c.lineTo(14 + sway, -8);
    c.quadraticCurveTo(0, 0, -14 + sway, -8);
    c.closePath();
    c.fill();
    c.fillStyle = '#e6c98a';
    fillStar(c, sway * 0.2, -40, 8, 3.4);
    c.fill();
    c.fillStyle = 'rgba(255,236,200,0.8)';
    c.font = '10px ' + SANS;
    c.textAlign = 'center';
    c.fillText('星烛', sway * 0.3, -18);
  });
}

function drawPlaque(ctx, prop) {
  drawBox(ctx, prop.x + 0.18, prop.y + 0.25, 0.64, 0.5, 0, 22, '#8d7344', '#5c4a2e', '#3e321f');
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 24, (c) => {
    c.fillStyle = '#e6c98a';
    c.font = '11px ' + SANS;
    c.textAlign = 'center';
    c.fillText('碑', 0, 4);
  });
}

function drawBrazier(ctx, prop, time, state) {
  drawBox(ctx, prop.x + 0.12, prop.y + 0.12, 0.76, 0.76, 0, 18, '#5a4038', '#3a2a26', '#2a1e1c');
  const solved = state.flags.candle_solved;
  const flick = 0.8 + Math.sin(time * 8) * 0.2;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 20, (c) => {
    c.fillStyle = '#2a1c18';
    c.beginPath();
    c.ellipse(0, -2, 14, 6, 0, 0, Math.PI * 2);
    c.fill();
    if (solved && !state.inv.includes('star_ash') && !state.flags.tookAsh) {
      c.fillStyle = '#d7e6ff';
      c.globalAlpha = 0.85 + Math.sin(time * 4) * 0.15;
      fillStar(c, 0, -6, 6, 2.5);
      c.fill();
      c.globalAlpha = 1;
    }
    c.save();
    c.scale(1, flick);
    c.fillStyle = solved ? '#ffb15a' : '#8a4030';
    c.beginPath();
    c.moveTo(0, -28);
    c.bezierCurveTo(10, -14, 8, -6, 0, -2);
    c.bezierCurveTo(-8, -6, -10, -14, 0, -28);
    c.fill();
    c.restore();
  });
}

function drawStairs(ctx, prop, time, state) {
  const amp = state.flags.ending ? 8 : 1.4;
  const shift = Math.sin(time * (state.flags.ending ? 1.6 : 0.7)) * amp;
  for (let i = 0; i < 4; i++) {
    const inset = i * 0.08;
    drawBox(
      ctx,
      prop.x + inset,
      prop.y + 0.08,
      (prop.w || 1) - inset * 2,
      (prop.h || 1) - 0.1,
      i * 12 + Math.max(0, shift) * (i / 4),
      12,
      i % 2 ? '#6d6458' : '#7d7364',
      '#4e463c',
      '#3a342c',
    );
  }
}

function drawCrane(ctx, prop, time) {
  const bob = Math.sin(time * 1.6 + prop.x) * 8;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 36 + bob, (c) => {
    c.rotate(Math.sin(time * 0.8) * 0.12);
    c.fillStyle = '#f4efe4';
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(16, -2);
    c.lineTo(2, -2);
    c.lineTo(0, -14);
    c.lineTo(-2, -2);
    c.lineTo(-16, -2);
    c.closePath();
    c.fill();
    c.fillStyle = '#e6c98a';
    c.fillRect(-1, -2, 2, 8);
  });
}

function drawStarTile(ctx, prop, time) {
  const pulse = 0.35 + Math.sin(time * 2) * 0.1;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 2, (c) => {
    c.save();
    c.scale(1, 0.52);
    c.strokeStyle = `rgba(230, 201, 138, ${0.45 + pulse})`;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, 22, 0, Math.PI * 2);
    c.stroke();
    c.restore();
    c.fillStyle = `rgba(230, 201, 138, ${0.8 + pulse})`;
    fillStar(c, 0, -2, 9, 4);
    c.fill();
  });
}

function drawBrick(ctx, prop, state) {
  const taken = state.inv.includes('key_tooth') || state.flags.tookTooth;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 2, (c) => {
    c.save();
    c.scale(1, 0.52);
    c.fillStyle = taken ? '#3a342c' : '#5a4638';
    c.fillRect(-16, -16, 32, 32);
    c.strokeStyle = 'rgba(0,0,0,0.35)';
    c.beginPath();
    c.moveTo(-10, -14);
    c.lineTo(4, 12);
    c.moveTo(8, -12);
    c.lineTo(-6, 8);
    c.stroke();
    c.restore();
    if (!taken) {
      c.fillStyle = '#e6c98a';
      c.globalAlpha = 0.8;
      fillStar(c, 8, -6, 3, 1.3);
      c.fill();
      c.globalAlpha = 1;
    }
  });
}

function drawDoor(ctx, prop, state) {
  const exit = prop.exit;
  const open = exit ? isOpen(state, prop) : false;
  drawBox(ctx, prop.x + 0.08, prop.y + 0.08, 0.84, 0.84, 0, open ? 8 : 36, open ? '#6d6458' : '#4a3428', '#3a2a22', '#2a1e18');
  if (!open) {
    atTile(ctx, prop.x + 0.5, prop.y + 0.5, 28, (c) => {
      c.fillStyle = '#2a1c16';
      roundRect(c, -10, -28, 20, 32, 8);
      c.fill();
      c.strokeStyle = '#e6c98a';
      c.lineWidth = 1.4;
      c.stroke();
      c.fillStyle = '#e6c98a';
      c.beginPath();
      c.arc(4, -10, 1.6, 0, Math.PI * 2);
      c.fill();
    });
  } else {
    atTile(ctx, prop.x + 0.5, prop.y + 0.5, 10, (c) => {
      c.strokeStyle = 'rgba(230,201,138,0.9)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, -6, 10, Math.PI, 0);
      c.stroke();
    });
  }
}

function isOpen(state, prop) {
  if (prop.exit === 'east' && prop.name === '东门') return !!state.flags.candle_solved;
  if (prop.exit === 'north') return state.inv.includes('copper_key');
  return true;
}

function drawBookshelf(ctx, prop) {
  const h = prop.h || 1;
  drawBox(ctx, prop.x, prop.y, 1, h, 0, 78, '#6b422c', '#4a2e20', '#3a2418');
  atTile(ctx, prop.x + 0.72, prop.y + h * 0.5, 40, (c) => {
    const colors = ['#8c3048', '#1d6a64', '#e6c98a', '#314e8a', '#f4efe4'];
    for (let i = 0; i < 5; i++) {
      c.fillStyle = colors[i];
      c.fillRect(-16 + i * 6, -18, 5, 22);
    }
  });
}

function drawBook(ctx, prop, state) {
  const book = BOOKS.find((b) => b.id === prop.book);
  drawBox(ctx, prop.x + 0.18, prop.y + 0.22, 0.64, 0.56, 0, 14, '#5c4636', '#3e2e24', '#2e221c');
  atTile(ctx, prop.x + 0.5, prop.y + 0.48, 16, (c) => {
    c.fillStyle = book.color;
    roundRect(c, -12, -26, 24, 22, 2);
    c.fill();
    c.fillStyle = book.colorName === '白' ? '#2a241c' : '#f6ead8';
    c.font = 'bold 12px ' + SANS;
    c.textAlign = 'center';
    c.fillText(book.id, 0, -12);
    drawGlyph(c, book.rune, 8, -6, 12, book.colorName === '白' ? '#2a241c' : '#f6ead8');
    c.fillStyle = '#e6c98a';
    for (let i = 0; i < book.clasps; i++) {
      c.fillRect(-10 + i * 5, -6, 3, 2);
    }
  });
}

function drawNote(ctx, prop, time) {
  const wobble = Math.sin(time * 2 + prop.x) * 1.5;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 4, (c) => {
    c.rotate(wobble * 0.02);
    c.fillStyle = '#f3ead4';
    c.strokeStyle = 'rgba(90,70,40,0.35)';
    roundRect(c, -11, -14, 22, 26, 2);
    c.fill();
    c.stroke();
    c.strokeStyle = 'rgba(90,70,40,0.45)';
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      c.moveTo(-7, -6 + i * 4);
      c.lineTo(7, -6 + i * 4);
    }
    c.stroke();
  });
}

function drawLectern(ctx, prop, time) {
  drawBox(ctx, prop.x + 0.2, prop.y + 0.25, 0.6, 0.5, 0, 28, '#6b422c', '#4a2e20', '#3a2418');
  const glow = prop.tint || '#f0d7a2';
  atTile(ctx, prop.x + 0.5, prop.y + 0.45, 30, (c) => {
    c.fillStyle = '#f3ead4';
    c.save();
    c.transform(1, 0.15, -0.2, 0.55, 0, 0);
    c.fillRect(-14, -18, 28, 20);
    c.fillStyle = glow;
    c.globalAlpha = 0.35 + Math.sin(time * 3) * 0.1;
    c.fillRect(-14, -18, 28, 20);
    c.restore();
  });
}

function drawWindow(ctx, prop, time) {
  drawBox(ctx, prop.x + 0.08, prop.y + 0.2, 0.84, 0.45, 0, 12, '#3e4a5c', '#2c3544', '#222833');
  atTile(ctx, prop.x + 0.5, prop.y + 0.4, 14, (c) => {
    const colors = ['#1d4e6e', '#e6c98a', '#7ec8c3', '#8c3048'];
    for (let i = 0; i < 4; i++) {
      c.fillStyle = colors[i];
      c.globalAlpha = 0.85;
      c.beginPath();
      c.moveTo(0, -62);
      c.lineTo(i < 2 ? -18 : 18, -20);
      c.lineTo(0, -28 - (i % 2) * 8);
      c.closePath();
      c.fill();
    }
    c.globalAlpha = 0.55 + Math.sin(time * 1.5) * 0.15;
    c.fillStyle = '#f4f7ff';
    c.beginPath();
    c.arc(6, -48, 5, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = '#e6c98a';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, -44, 16, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
  });
}

function drawBottle(ctx, prop, state) {
  const taken = state.inv.includes(prop.item);
  drawBox(ctx, prop.x + 0.2, prop.y + 0.25, 0.6, 0.5, 0, 16, '#5c5146', '#3e3832', '#2e2a26');
  if (taken) return;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 18, (c) => {
    c.fillStyle = prop.tint || '#9fd7e8';
    c.globalAlpha = 0.9;
    roundRect(c, -6, -22, 12, 18, 3);
    c.fill();
    c.globalAlpha = 1;
    c.fillStyle = '#f6ead8';
    c.fillRect(-2, -26, 4, 5);
    c.fillStyle = '#2a241c';
    c.font = '9px ' + SANS;
    c.textAlign = 'center';
    c.fillText(prop.name.slice(0, 1), 0, -10);
  });
}

function drawTablet(ctx, prop) {
  drawBox(ctx, prop.x + 0.1, prop.y + 0.18, 0.8, 0.64, 0, 20, '#8a8178', '#5c564e', '#3e3a34');
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 22, (c) => {
    c.strokeStyle = 'rgba(42,36,28,0.55)';
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i < 3; i++) {
      c.moveTo(-10, -6 + i * 4);
      c.lineTo(10, -6 + i * 4);
    }
    c.stroke();
  });
}

function drawChart(ctx, prop) {
  drawBox(ctx, prop.x + 0.12, prop.y + 0.2, 0.76, 0.55, 0, 26, '#6b422c', '#4a2e20', '#3a2418');
  atTile(ctx, prop.x + 0.5, prop.y + 0.45, 28, (c) => {
    c.fillStyle = '#f3ead4';
    c.fillRect(-14, -24, 28, 22);
    c.fillStyle = '#2a241c';
    c.font = '8px ' + SANS;
    c.textAlign = 'center';
    c.fillText('冷热', 0, -10);
  });
}

function drawCauldron(ctx, prop, time) {
  drawBox(ctx, prop.x + 0.15, prop.y + 0.2, 0.7, 0.6, 0, 8, '#3e3832', '#2e2a26', '#221e1c');
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 10, (c) => {
    c.fillStyle = '#3a4650';
    c.beginPath();
    c.ellipse(0, -6, 18, 10, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1c2830';
    c.beginPath();
    c.ellipse(0, -10, 14, 7, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#7ec8a8';
    c.globalAlpha = 0.85;
    c.beginPath();
    c.ellipse(0, -12, 10, 4, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = '#8a939c';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(-16, -8, 6, Math.PI * 0.6, Math.PI * 1.4);
    c.arc(16, -8, 6, Math.PI * -0.4, Math.PI * 0.4);
    c.stroke();
    c.fillStyle = 'rgba(200,240,220,0.7)';
    const b1 = Math.sin(time * 3) * 3;
    c.beginPath();
    c.arc(-4, -20 + b1, 2.2, 0, Math.PI * 2);
    c.arc(5, -26 + b1 * 0.5, 1.6, 0, Math.PI * 2);
    c.fill();
  });
}

function drawBell(ctx, prop, time, state) {
  const amp = state.flags.ending ? 0.18 : 0.04;
  const ang = Math.sin(time * (state.flags.ending ? 3 : 1.2) + prop.x) * amp;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 54, (c) => {
    c.rotate(ang);
    c.fillStyle = '#d7c08a';
    c.beginPath();
    c.moveTo(-10, -6);
    c.lineTo(10, -6);
    c.lineTo(6, 12);
    c.lineTo(-6, 12);
    c.closePath();
    c.fill();
    c.fillStyle = '#8a7040';
    c.fillRect(-2, -16, 4, 10);
    c.beginPath();
    c.arc(0, 8, 2, 0, Math.PI * 2);
    c.fill();
  });
}

function drawDial(ctx, prop, time, state) {
  drawBox(ctx, prop.x + 0.05, prop.y + 0.12, 0.9, 0.76, 0, 16, '#6a7088', '#444a60', '#323848');
  const spin = state.flags.ending ? time * 0.4 : time * 0.15;
  atTile(ctx, prop.x + 0.5, prop.y + 0.5, 18, (c) => {
    c.save();
    c.scale(1, 0.62);
    c.fillStyle = '#1a2034';
    c.beginPath();
    c.arc(0, 0, 22, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#e6c98a';
    c.lineWidth = 2;
    c.stroke();
    c.rotate(spin);
    c.fillStyle = '#d7e4ff';
    fillStar(c, 0, 0, 10, 4.5);
    c.fill();
    c.restore();
  });
}

export function drawActor(ctx, player) {
  const p = iso(player.x, player.y, 0);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 13, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const flip = player.facing === 'sw' || player.facing === 'nw';
  const back = player.facing === 'ne' || player.facing === 'nw';
  ctx.scale(flip ? -1 : 1, 1);
  drawGirl(ctx, player, back);
  ctx.restore();
}

function drawGirl(ctx, player, back) {
  const moving = player.moving;
  const swing = moving ? Math.sin(player.walkPhase * Math.PI * 2) : 0;
  const bob = moving ? Math.abs(Math.sin(player.walkPhase * Math.PI * 2)) * -2.4 : Math.sin(player.idlePhase * 1.6) * -0.8;
  ctx.translate(0, bob);

  const leg = (side) => {
    ctx.save();
    ctx.translate(side * 4, -7);
    ctx.rotate(swing * side * 0.5);
    ctx.fillStyle = '#f4e4cc';
    roundRect(ctx, -2.2, 0, 4.4, 9, 2);
    ctx.fill();
    ctx.fillStyle = '#2a2422';
    roundRect(ctx, -2.6, 7.2, 5.4, 3.4, 1.3);
    ctx.fill();
    ctx.restore();
  };
  leg(-1);
  leg(1);

  ctx.fillStyle = '#164e4a';
  ctx.beginPath();
  ctx.moveTo(-9, -30);
  ctx.quadraticCurveTo(-14, -16, -14, -8);
  ctx.quadraticCurveTo(0, -3, 14, -8);
  ctx.quadraticCurveTo(14, -16, 9, -30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e4c27a';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(-12.5, -9.5);
  ctx.quadraticCurveTo(0, -4.5, 12.5, -9.5);
  ctx.stroke();

  ctx.fillStyle = '#f7ecdc';
  ctx.beginPath();
  ctx.moveTo(-5.5, -30);
  ctx.lineTo(5.5, -30);
  ctx.lineTo(6.5, -16);
  ctx.lineTo(-6.5, -16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#6b3e2a';
  roundRect(ctx, -12, -26, 6.5, 8, 2);
  ctx.fill();
  ctx.fillStyle = '#e4c27a';
  ctx.fillRect(-10.6, -22.5, 3.6, 1.2);

  const arm = (side) => {
    ctx.save();
    ctx.translate(side * 9, -28);
    ctx.rotate(-swing * side * 0.55);
    ctx.fillStyle = side < 0 ? '#164e4a' : '#f0c2a0';
    roundRect(ctx, -2.1, 0, 4.2, 12, 2);
    ctx.fill();
    if (side > 0) {
      ctx.fillStyle = '#f0c2a0';
      ctx.beginPath();
      ctx.arc(0, 12, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  arm(-1);
  arm(1);

  ctx.fillStyle = '#f7ecdc';
  ctx.beginPath();
  ctx.ellipse(0, -31, 5, 3.2, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#f0c2a0';
  ctx.beginPath();
  ctx.arc(0, -42, 9.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-9.2, -41, 2, 0, Math.PI * 2);
  ctx.arc(9.2, -41, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2b1c18';
  ctx.beginPath();
  ctx.arc(0, -44.5, 9.8, Math.PI * 0.98, Math.PI * 2.02);
  ctx.quadraticCurveTo(10, -32, 8, -26);
  ctx.lineTo(-8, -26);
  ctx.quadraticCurveTo(-10, -32, -9.6, -44);
  ctx.fill();
  if (!back) {
    ctx.beginPath();
    ctx.moveTo(-8.4, -44);
    ctx.quadraticCurveTo(-4, -36.5, 0, -36.8);
    ctx.quadraticCurveTo(4, -36.5, 8.4, -44);
    ctx.quadraticCurveTo(4, -46, 0, -45.2);
    ctx.quadraticCurveTo(-4, -46, -8.4, -44);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -42, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(0, -20);
    ctx.fillStyle = '#e4c27a';
    fillStar(ctx, 0, 0, 4.2, 1.8);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = '#c4475d';
  ctx.beginPath();
  ctx.ellipse(8.6, -36, 3.3, 2.1, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8.2, -36);
  ctx.lineTo(13, -33);
  ctx.lineTo(12, -38);
  ctx.closePath();
  ctx.fill();

  if (!back) {
    const blink = Math.sin(player.idlePhase * 0.7) > 0.96;
    ctx.fillStyle = '#241816';
    if (!blink) {
      ctx.beginPath();
      ctx.ellipse(-3.3, -41.2, 1.15, 1.4, 0, 0, Math.PI * 2);
      ctx.ellipse(3.3, -41.2, 1.15, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2.8, -42, 0.9, 0.9);
      ctx.fillRect(3.8, -42, 0.9, 0.9);
    } else {
      ctx.strokeStyle = '#241816';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4.6, -41);
      ctx.lineTo(-2, -41);
      ctx.moveTo(2, -41);
      ctx.lineTo(4.6, -41);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(224, 120, 120, 0.5)';
    ctx.beginPath();
    ctx.ellipse(-5.6, -38.2, 2, 1.05, 0, 0, Math.PI * 2);
    ctx.ellipse(5.6, -38.2, 2, 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a85a52';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, -37.4, 2.3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

export function propDepth(prop) {
  const w = prop.w || 1;
  const h = prop.h || 1;
  return prop.x + w + prop.y + h + (prop.depthBias || 0);
}

export function actorDepth(player) {
  return player.x + player.y + 0.2;
}
