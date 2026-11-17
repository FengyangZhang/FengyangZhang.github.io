/**
 * Flat chibi character.
 *
 * Facings used by the walker (see sim.js):
 *   se, sw  — toward the camera. Face is drawn. sw is se mirrored.
 *   ne, nw  — away from the camera. Hair only. No eyes, mouth, or blush.
 *
 * A future NPC is a prop `{ type: 'npc', look: 'xiaozhu' | {…}, facing }`.
 *
 * look = {
 *   age: 'child' | 'teen' | 'adult',
 *   skin, blush, eyes,
 *   hair: { style: 'bob' | 'long' | 'bun' | 'short' | 'tied', color },
 *   ribbon, glasses,
 *   outfit: { kind: 'robe' | 'dress' | 'casual' | 'coat', outer, inner, trim, shoes, legs },
 *   satchel,
 * }
 */

export const LOOKS = {
  xiaozhu: {
    age: 'child',
    skin: '#f6c7ad',
    blush: '#f09998',
    eyes: '#2a1a16',
    hair: { style: 'bob', color: '#4a2c24' },
    ribbon: '#e45470',
    outfit: {
      kind: 'robe',
      outer: '#1f736c',
      inner: '#fff4e6',
      trim: '#e7c56e',
      shoes: '#2c2622',
      legs: '#fff4e6',
    },
    satchel: '#8a5340',
  },
};

export const PLAYER_LOOK = LOOKS.xiaozhu;

/** True only for the two camera-facing directions. Back views must not use this. */
export function showsFace(facing) {
  return facing === 'se' || facing === 'sw';
}

const AGE = {
  child: { scale: 1.42, head: 17, bodyTop: -40, hem: -15, hip: 9, leg: 12, arm: 13 },
  teen: { scale: 1.48, head: 15.5, bodyTop: -44, hem: -16, hip: 8.6, leg: 15, arm: 15 },
  adult: { scale: 1.52, head: 14.5, bodyTop: -48, hem: -17, hip: 9, leg: 17, arm: 16 },
};

function rgb(hex) {
  const n = String(hex).replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function shade(hex, amount) {
  const [r, g, b] = rgb(hex);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(Math.abs(r), Math.abs(w) / 2, Math.abs(h) / 2);
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
  const facing = pose.facing || 'se';
  const front = showsFace(facing);
  const flip = facing === 'sw' || facing === 'nw';
  const moving = !!pose.moving;
  const swing = moving ? Math.sin((pose.walkPhase || 0) * Math.PI * 2) : 0;
  const bob = moving
    ? Math.abs(Math.sin((pose.walkPhase || 0) * Math.PI * 2)) * -2.2
    : Math.sin((pose.idlePhase || 0) * 1.6) * -1;
  const blink = (pose.idlePhase || 0) % 4.8 > 4.55;

  ctx.save();
  ctx.scale((flip ? -1 : 1) * m.scale, m.scale);
  ctx.translate(0, bob);

  ctx.fillStyle = 'rgba(12, 10, 24, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 16, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  drawLegs(ctx, look, m, swing);
  drawRobe(ctx, look, m, front);
  drawArms(ctx, look, m, swing, front);
  if (front) drawFrontHead(ctx, look, m, blink, swing);
  else drawBackHead(ctx, look, m, swing);

  ctx.restore();
}

function drawLegs(ctx, look, m, swing) {
  const order = swing >= 0 ? [-1, 1] : [1, -1];
  for (const side of order) {
    ctx.save();
    ctx.translate(side * 4.6, m.hem + 1);
    ctx.rotate(swing * side * 0.55);
    roundRect(ctx, -2.6, 0, 5.2, m.leg, 2.4);
    ctx.fillStyle = look.outfit.legs || look.skin;
    ctx.fill();
    roundRect(ctx, -3.1, m.leg - 2, 6.6, 4.4, 1.8);
    ctx.fillStyle = look.outfit.shoes || '#2c2622';
    ctx.fill();
    ctx.restore();
  }
}

function drawRobe(ctx, look, m, front) {
  const o = look.outfit;
  const kind = o.kind || 'robe';
  const top = m.bodyTop;
  const hem = m.hem;
  const topW = m.hip + 1;
  const hemW = m.hip + (kind === 'coat' ? 8 : 7);

  ctx.beginPath();
  ctx.moveTo(-topW, top + 6);
  ctx.quadraticCurveTo(-topW - 1, (top + hem) / 2, -hemW, hem);
  ctx.quadraticCurveTo(0, hem + 6, hemW, hem);
  ctx.quadraticCurveTo(topW + 1, (top + hem) / 2, topW, top + 6);
  ctx.quadraticCurveTo(0, top + 2, -topW, top + 6);
  ctx.closePath();
  ctx.fillStyle = o.outer;
  ctx.fill();

  if (front && kind !== 'casual') {
    ctx.beginPath();
    ctx.moveTo(-topW * 0.45, top + 10);
    ctx.lineTo(topW * 0.45, top + 10);
    ctx.lineTo(topW * 0.62, hem - 1);
    ctx.quadraticCurveTo(0, hem + 3, -topW * 0.62, hem - 1);
    ctx.closePath();
    ctx.fillStyle = o.inner;
    ctx.fill();
    ctx.strokeStyle = o.trim;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-hemW + 2.5, hem - 1.5);
    ctx.quadraticCurveTo(0, hem + 3.5, hemW - 2.5, hem - 1.5);
    ctx.stroke();
    ctx.fillStyle = o.inner;
    ctx.beginPath();
    ctx.moveTo(-4.5, top + 5);
    ctx.lineTo(0, top + 12);
    ctx.lineTo(4.5, top + 5);
    ctx.closePath();
    ctx.fill();
  } else if (o.trim) {
    ctx.fillStyle = o.trim;
    ctx.beginPath();
    ctx.moveTo(0, top + 16);
    ctx.lineTo(3.4, top + 20);
    ctx.lineTo(0, top + 24);
    ctx.lineTo(-3.4, top + 20);
    ctx.closePath();
    ctx.fill();
  }

  if (look.satchel && front) {
    roundRect(ctx, -topW - 5, top + 10, 7, 9, 2);
    ctx.fillStyle = look.satchel;
    ctx.fill();
    ctx.strokeStyle = o.trim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-topW - 4, top + 13);
    ctx.lineTo(-topW + 1, top + 13);
    ctx.stroke();
  }
}

function drawArms(ctx, look, m, swing, front) {
  const top = m.bodyTop + 8;
  const order = swing >= 0 ? [1, -1] : [-1, 1];
  for (const side of order) {
    ctx.save();
    ctx.translate(side * (m.hip + 0.5), top);
    ctx.rotate(-swing * side * 0.62);
    roundRect(ctx, -2.7, 0, 5.4, m.arm, 2.6);
    ctx.fillStyle = look.outfit.outer;
    ctx.fill();
    if (front) {
      ctx.beginPath();
      ctx.arc(0, m.arm + 0.4, 2.7, 0, Math.PI * 2);
      ctx.fillStyle = look.skin;
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawFrontHead(ctx, look, m, blink, swing) {
  const hair = look.hair?.color || '#4a2c24';
  const headY = m.bodyTop - m.head * 0.15;
  const r = m.head;

  ctx.save();
  ctx.translate(swing * 0.4, 0);

  // Hair mass sits behind the face.
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, headY - r * 0.22, r + 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-r * 0.72, headY + r * 0.15, r * 0.38, r * 0.72, 0.2, 0, Math.PI * 2);
  ctx.ellipse(r * 0.72, headY + r * 0.15, r * 0.38, r * 0.72, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Face covers the lower hair so eyes can only land on skin.
  ctx.beginPath();
  ctx.arc(1.4, headY + r * 0.08, r * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = look.skin;
  ctx.fill();

  drawBangs(ctx, hair, headY, r);
  drawFace(ctx, look, headY, r, blink);
  if (look.ribbon) drawBow(ctx, look.ribbon, r * 0.95, headY - r * 0.05);
  if (look.hair?.style === 'bun' || look.hair?.style === 'tied') {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(r * 0.15, headY - r * 1.15, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBangs(ctx, hair, headY, r) {
  const y = headY - r * 0.55;
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, y);
  ctx.quadraticCurveTo(-r * 0.45, headY - r * 0.05, -r * 0.15, headY - r * 0.28);
  ctx.quadraticCurveTo(r * 0.15, headY - r * 0.02, r * 0.55, headY - r * 0.22);
  ctx.quadraticCurveTo(r * 0.9, y - r * 0.15, r * 0.7, y - r * 0.45);
  ctx.quadraticCurveTo(0, y - r * 0.7, -r * 0.85, y);
  ctx.closePath();
  ctx.fill();
}

function drawFace(ctx, look, headY, r, blink) {
  const y = headY + r * 0.18;
  if (!blink) {
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.ellipse(-r * 0.30, y, r * 0.20, r * 0.24, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.34, y, r * 0.20, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.eyes;
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, y + r * 0.04, r * 0.11, r * 0.14, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.36, y + r * 0.04, r * 0.11, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.32, y - r * 0.02, r * 0.045, 0, Math.PI * 2);
    ctx.arc(r * 0.32, y - r * 0.02, r * 0.045, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = look.eyes;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.46, y);
    ctx.quadraticCurveTo(-r * 0.28, y + r * 0.08, -r * 0.12, y);
    ctx.moveTo(r * 0.16, y);
    ctx.quadraticCurveTo(r * 0.34, y + r * 0.08, r * 0.5, y);
    ctx.stroke();
  }
  ctx.fillStyle = look.blush;
  ctx.beginPath();
  ctx.ellipse(-r * 0.48, y + r * 0.22, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
  ctx.ellipse(r * 0.52, y + r * 0.22, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = shade(look.skin, 0.28);
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(r * 0.04, y + r * 0.28, r * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (look.glasses) {
    ctx.strokeStyle = '#3a342c';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, y, r * 0.24, r * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.34, y, r * 0.24, r * 0.2, 0, 0, Math.PI * 2);
    ctx.moveTo(-r * 0.04, y);
    ctx.lineTo(r * 0.1, y);
    ctx.stroke();
  }
}

function drawBackHead(ctx, look, m, swing) {
  const hair = look.hair?.color || '#4a2c24';
  const headY = m.bodyTop - m.head * 0.05;
  const r = m.head + 3;
  ctx.save();
  ctx.translate(swing * 0.35, 0);
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, headY, r * 0.92, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-r * 0.55, headY + r * 0.35, r * 0.34, r * 0.55, 0.15, 0, Math.PI * 2);
  ctx.ellipse(r * 0.55, headY + r * 0.35, r * 0.34, r * 0.55, -0.15, 0, Math.PI * 2);
  ctx.fill();
  if (look.hair?.style === 'long' || look.hair?.style === 'tied') {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, headY);
    ctx.quadraticCurveTo(-r * 0.9, headY + r * 1.3, -r * 0.2, headY + r * 1.5);
    ctx.quadraticCurveTo(r * 0.2, headY + r * 1.2, r * 0.7, headY);
    ctx.fill();
  }
  if (look.ribbon) drawBow(ctx, look.ribbon, r * 0.72, headY + r * 0.05);
  ctx.restore();
}

function drawBow(ctx, color, x, y) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 12, y - 7, x - 12, y + 6, x, y + 0.5);
  ctx.bezierCurveTo(x - 7, y + 3, x - 4, y - 2, x, y);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 12, y - 7, x + 12, y + 6, x, y + 0.5);
  ctx.bezierCurveTo(x + 7, y + 3, x + 4, y - 2, x, y);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 1, y + 1);
  ctx.lineTo(x - 4.5, y + 8);
  ctx.lineTo(x - 0.4, y + 5);
  ctx.closePath();
  ctx.moveTo(x + 1, y + 1);
  ctx.lineTo(x + 4.5, y + 8);
  ctx.lineTo(x + 0.4, y + 5);
  ctx.closePath();
  ctx.fill();
}
