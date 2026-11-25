/**
 * Pixel character. Future NPCs add a spritesheet and a LOOKS entry.
 * `down` faces the camera. `up` is the back: hair, braid, visor band, no face.
 * The sheet is 4 columns (idle, step, bob, step) by 4 rows (down, left, right, up).
 */

export const FRAME_W = 40;
export const FRAME_H = 84;

export const LOOKS = {
  xiaozhu: {
    sprite: 'wife',
    sheet: 'sprites/wife.png',
    age: 'child',
    skin: '#f6c8aa',
    blush: '#f2a090',
    eyes: '#241610',
    hair: { style: 'braid', color: '#2a1814' },
    ribbon: '#d6453c',
    outfit: {
      kind: 'casual',
      outer: '#f8f1e4',
      inner: '#f8f1e4',
      trim: '#e6c56a',
      shoes: '#3c342e',
      legs: '#6d7178',
    },
    satchel: '#f5c20e',
  },
  toddler: {
    sprite: 'toddler',
    sheet: 'sprites/toddler.png',
    frameW: 24,
    frameH: 50,
    age: 'toddler',
    skin: '#ffd6ba',
    blush: '#f29682',
    eyes: '#241610',
    hair: { style: 'pigtails', color: '#3a2418' },
    ribbon: '#e23b34',
    outfit: {
      kind: 'dress',
      outer: '#fff8f0',
      inner: '#fff8f0',
      trim: '#e23b34',
      shoes: '#8e9098',
      legs: '#fff8f0',
    },
    satchel: '#ffd020',
  },
};

LOOKS.xiaozhu.frameW = FRAME_W;
LOOKS.xiaozhu.frameH = FRAME_H;

export const PLAYER_LOOK = LOOKS.xiaozhu;

export function playerLook(roomId) {
  return roomId === 'nursery' ? LOOKS.toddler : PLAYER_LOOK;
}

const BACK = new Set(['up', 'ne', 'nw']);
const ROW = { down: 0, left: 1, right: 2, up: 3 };

export function canonFacing(facing) {
  if (facing === 'se') return 'down';
  if (facing === 'sw') return 'left';
  if (facing === 'ne') return 'up';
  if (facing === 'nw') return 'right';
  return facing || 'down';
}

export function showsFace(facing) {
  return !BACK.has(facing) && canonFacing(facing) !== 'up';
}

export function drawCharacter(ctx, look, pose, sheet) {
  if (!sheet || !sheet.complete || !sheet.naturalWidth) return;
  const facing = canonFacing(pose.facing || 'down');
  const row = ROW[facing] ?? 0;
  const frame = pose.moving ? Math.floor((pose.walkPhase || 0) * 4) % 4 : 0;
  const fw = look?.frameW || FRAME_W;
  const fh = look?.frameH || FRAME_H;
  ctx.drawImage(
    sheet,
    frame * fw,
    row * fh,
    fw,
    fh,
    -fw / 2,
    -fh + 4,
    fw,
    fh,
  );
  void look;
}
