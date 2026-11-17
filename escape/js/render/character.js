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
};

export const PLAYER_LOOK = LOOKS.xiaozhu;

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
  ctx.drawImage(
    sheet,
    frame * FRAME_W,
    row * FRAME_H,
    FRAME_W,
    FRAME_H,
    -FRAME_W / 2,
    -FRAME_H + 4,
    FRAME_W,
    FRAME_H,
  );
  void look;
}
