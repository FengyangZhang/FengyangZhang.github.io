/**
 * Flat character renderer.
 *
 * A look object is enough to make a new person. Future scenes can put one on a
 * prop: { type: 'npc', look: 'xiaozhu' or a look object, facing: 'se', block: true }.
 *
 * look = {
 *   age: 'child' | 'teen' | 'adult',
 *   skin, blush, eyes,
 *   hair: { style: 'bob' | 'long' | 'bun' | 'short' | 'tied', color },
 *   ribbon,          // optional accent
 *   glasses: false,
 *   outfit: { kind: 'robe' | 'dress' | 'casual' | 'coat', outer, inner, trim, shoes, legs },
 *   satchel,         // optional color
 * }
 */

export const LOOKS = {
  xiaozhu: {
    age: 'child',
    skin: '#f3c4a6',
    blush: '#ee9b98',
    eyes: '#2c1c18',
    hair: { style: 'bob', color: '#3a241e' },
    ribbon: '#d24b62',
    outfit: {
      kind: 'robe',
      outer: '#1d6a64',
      inner: '#f6ecdf',
      trim: '#e3c27a',
      shoes: '#2a2420',
      legs: '#f6ecdf',
    },
    satchel: '#7a4b34',
  },
};

export const PLAYER_LOOK = LOOKS.xiaozhu;

const AGE = {
  child: { head: 11, neck: -43, hem: -12, hip: 8.4, leg: 13, arm: 14 },
  teen: { head: 11.2, neck: -44, hem: -12, hip: 7.8, leg: 17, arm: 15.5 },
  adult: { head: 10.6, neck: -48, hem: -13, hip: 8.2, leg: 19, arm: 16.5 },
};

function rgb(hex) {
  const n = hex.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function shade(hex, amount) {
  const [r, g, b] = rgb(hex);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

function paint(ctx, color, width = 1.7) {
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = shade(color, 0.22);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawCharacter(ctx, look, pose) {
  const m = AGE[look.age] || AGE.child;
  const moving = !!pose.moving;
  const swing = moving ? Math.sin(pose.walkPhase * Math.PI * 2) : 0;
  const bob = moving
    ? Math.abs(Math.sin(pose.walkPhase * Math.PI * 2)) * -2.6
    : Math.sin(pose.idlePhase * 1.5) * -1.1;
  const back = pose.facing === 'ne' || pose.facing === 'nw';
  const flip = pose.facing === 'sw' || pose.facing === 'nw';
  const blink = pose.idlePhase % 4.6 > 4.38;

  ctx.save();
  ctx.scale((flip ? -1 : 1) * 1.2, 1.2);
  ctx.translate(0, bob);

  ctx.fillStyle = 'rgba(16, 14, 28, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 15, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

  drawLegs(ctx, look, m, swing);
  drawOutfit(ctx, look, m, back);
  if (look.satchel && !back) drawSatchel(ctx, look, m);
  drawArms(ctx, look, m, swing, back);
  drawHead(ctx, look, m, back, blink, swing);

  ctx.restore();
}

function drawLegs(ctx, look, m, swing) {
  const color = look.outfit.legs || look.skin;
  const shoe = look.outfit.shoes || '#2a2420';
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 4.3, m.hem + 2);
    ctx.rotate(swing * side * 0.55);
    roundRect(ctx, -2.5, 0, 5, m.leg, 2.2);
    paint(ctx, color, 1.4);
    roundRect(ctx, -3, m.leg - 2.2, 6.4, 4.2, 1.6);
    paint(ctx, shoe, 1.3);
    ctx.restore();
  }
}

function drawOutfit(ctx, look, m, back) {
  const o = look.outfit;
  const kind = o.kind || 'robe';
  if (kind === 'casual') {
    roundRect(ctx, -m.hip, m.neck + 2, m.hip * 2, 16, 3);
    paint(ctx, o.outer, 1.5);
    roundRect(ctx, -m.hip + 1, m.neck + 14, m.hip * 2 - 2, Math.max(8, m.hem - (m.neck + 12)), 2);
    paint(ctx, o.inner || o.legs || o.outer, 1.4);
    return;
  }
  const hemW = kind === 'coat' ? m.hip + 7 : m.hip + 6;
  const topW = m.hip + 1.5;
  ctx.beginPath();
  ctx.moveTo(-topW, m.neck + 4);
  ctx.lineTo(topW, m.neck + 4);
  ctx.lineTo(hemW, m.hem);
  ctx.quadraticCurveTo(0, m.hem + 5, -hemW, m.hem);
  ctx.closePath();
  paint(ctx, o.outer, 1.7);
  if (!back) {
    ctx.beginPath();
    ctx.moveTo(-topW + 3.5, m.neck + 6);
    ctx.lineTo(topW - 3.5, m.neck + 6);
    ctx.lineTo(topW - 2.5, m.hem + 1);
    ctx.lineTo(-topW + 2.5, m.hem + 1);
    ctx.closePath();
    ctx.fillStyle = o.inner;
    ctx.fill();
  } else if (o.trim) {
    ctx.fillStyle = o.trim;
    ctx.beginPath();
    ctx.moveTo(0, m.neck + 12);
    ctx.lineTo(4, m.neck + 17);
    ctx.lineTo(0, m.neck + 22);
    ctx.lineTo(-4, m.neck + 17);
    ctx.closePath();
    ctx.fill();
  }
  if (o.trim && kind !== 'casual') {
    ctx.strokeStyle = o.trim;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-hemW + 2, m.hem - 1);
    ctx.quadraticCurveTo(0, m.hem + 3, hemW - 2, m.hem - 1);
    ctx.stroke();
  }
}

function drawSatchel(ctx, look, m) {
  roundRect(ctx, -m.hip - 6, m.neck + 6, 7, 9, 2);
  paint(ctx, look.satchel, 1.3);
  ctx.strokeStyle = shade(look.satchel, 0.05);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-m.hip - 5, m.neck + 8);
  ctx.lineTo(-m.hip + 0.5, m.neck + 8);
  ctx.stroke();
}

function drawArms(ctx, look, m, swing, back) {
  const sleeve = look.outfit.outer;
  const skin = look.skin;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * (m.hip + 1.2), m.neck + 6);
    ctx.rotate(-swing * side * 0.6);
    roundRect(ctx, -2.6, 0, 5.2, m.arm, 2.4);
    paint(ctx, back ? sleeve : (side < 0 ? sleeve : skin), 1.4);
    if (!back && side > 0) {
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, m.arm, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shade(skin, 0.18);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawHead(ctx, look, m, back, blink, swing) {
  const headY = m.neck - m.head * 0.72;
  ctx.fillStyle = look.outfit.inner || look.skin;
  ctx.beginPath();
  ctx.ellipse(0, m.neck + 1, 5.2, 3.4, 0, 0, Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, headY, m.head, 0, Math.PI * 2);
  paint(ctx, look.skin, 1.6);

  ctx.save();
  ctx.translate(swing * 0.6, 0);
  drawHair(ctx, look, m, headY, back);
  ctx.restore();

  if (!back) drawFace(ctx, look, m, headY, blink);
}

function drawHair(ctx, look, m, headY, back) {
  const style = look.hair?.style || 'bob';
  const color = look.hair?.color || '#3a241e';
  const r = m.head + 1.1;
  ctx.fillStyle = color;
  ctx.strokeStyle = shade(color, 0.2);
  ctx.lineWidth = 1.5;

  if (style === 'short') {
    ctx.beginPath();
    ctx.arc(0, headY - 1, r, Math.PI * 1.05, Math.PI * 1.95);
    ctx.quadraticCurveTo(r * 0.4, headY - r * 0.2, 0, headY - r * 0.15);
    ctx.quadraticCurveTo(-r * 0.4, headY - r * 0.2, -r * 0.95, headY - r * 0.15);
    ctx.fill();
    ctx.stroke();
  } else if (style === 'bun') {
    drawBob(ctx, color, r, headY, back, 0.55);
    ctx.beginPath();
    ctx.arc(0, headY - r - 1, r * 0.42, 0, Math.PI * 2);
    paint(ctx, color, 1.4);
  } else if (style === 'long' || style === 'tied') {
    ctx.beginPath();
    ctx.arc(0, headY - 1, r, Math.PI * 0.95, Math.PI * 2.05);
    ctx.lineTo(r * 0.72, headY + r * 1.55);
    ctx.quadraticCurveTo(0, headY + r * 1.9, -r * 0.72, headY + r * 1.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (!back) drawBangs(ctx, color, r, headY);
    if (style === 'tied') {
      ctx.beginPath();
      ctx.ellipse(r * 0.85, headY + r * 0.9, r * 0.28, r * 0.7, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    drawBob(ctx, color, r, headY, back, 1);
  }
  if (look.ribbon) drawRibbon(ctx, look, m, headY);
}

function drawBob(ctx, color, r, headY, back, length) {
  ctx.beginPath();
  ctx.arc(0, headY - 1, r, Math.PI * 0.98, Math.PI * 2.02);
  ctx.quadraticCurveTo(r * 0.95, headY + r * 0.35 * length, r * 0.62, headY + r * 0.85 * length);
  ctx.lineTo(-r * 0.62, headY + r * 0.85 * length);
  ctx.quadraticCurveTo(-r * 0.95, headY + r * 0.35 * length, -r, headY - 1);
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.2);
  ctx.stroke();
  if (!back) drawBangs(ctx, color, r, headY);
  if (back) {
    ctx.beginPath();
    ctx.arc(0, headY, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBangs(ctx, color, r, headY) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-r * 0.82, headY - r * 0.35);
  ctx.quadraticCurveTo(-r * 0.4, headY + r * 0.02, 0, headY - r * 0.12);
  ctx.quadraticCurveTo(r * 0.4, headY + r * 0.02, r * 0.82, headY - r * 0.35);
  ctx.quadraticCurveTo(0, headY - r * 0.95, -r * 0.82, headY - r * 0.35);
  ctx.fill();
}

function drawRibbon(ctx, look, m, headY) {
  const y = headY + m.head * 0.15;
  ctx.fillStyle = look.ribbon;
  ctx.beginPath();
  ctx.ellipse(m.head * 0.78, y, 2.8, 1.8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(m.head * 0.7, y);
  ctx.lineTo(m.head * 0.7 + 5.5, y + 3.2);
  ctx.lineTo(m.head * 0.7 + 4.2, y - 2.4);
  ctx.closePath();
  ctx.fill();
}

function drawFace(ctx, look, m, headY, blink) {
  const y = headY + 2.2;
  if (!blink) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-3.7, y, 3.15, 3.7, 0, 0, Math.PI * 2);
    ctx.ellipse(3.7, y, 3.15, 3.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shade(look.skin, 0.2);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = look.eyes;
    ctx.beginPath();
    ctx.ellipse(-3.3, y + 0.45, 1.7, 2.15, 0, 0, Math.PI * 2);
    ctx.ellipse(4.1, y + 0.45, 1.7, 2.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-2.7, y - 0.7, 0.85, 0, Math.PI * 2);
    ctx.arc(4.7, y - 0.7, 0.85, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = look.eyes;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5.4, y);
    ctx.quadraticCurveTo(-3.4, y + 1.2, -1.6, y);
    ctx.moveTo(1.6, y);
    ctx.quadraticCurveTo(3.6, y + 1.2, 5.4, y);
    ctx.stroke();
  }
  ctx.fillStyle = look.blush || 'rgba(232,140,140,0.7)';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(-6.3, y + 3.3, 2.3, 1.25, 0, 0, Math.PI * 2);
  ctx.ellipse(6.3, y + 3.3, 2.3, 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = shade(look.skin, 0.25);
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, y + 4.6, 2.5, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
  if (look.glasses) {
    ctx.strokeStyle = '#3a342c';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(-3.6, y, 3.4, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(3.6, y, 3.4, 3.2, 0, 0, Math.PI * 2);
    ctx.moveTo(-0.2, y);
    ctx.lineTo(0.2, y);
    ctx.stroke();
  }
}
