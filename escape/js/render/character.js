/**
 * Pixel character. Future NPCs: add a sprite set and a LOOKS entry with `sprite`.
 * Directions: down and the old front facings show a face. up / ne / nw are the back.
 */

import { DOWN, drawSprite, frameRows } from './sprites.js';

export const LOOKS = {
  xiaozhu: {
    sprite: 'wife',
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

export function drawCharacter(ctx, look, pose) {
  const facing = canonFacing(pose.facing || 'down');
  const moving = !!pose.moving;
  const frame = moving ? Math.floor((pose.walkPhase || 0) * 4) % 4 : 0;
  const rows = frameRows(facing, frame);
  const flip = facing === 'left';
  drawSprite(ctx, rows, -8, -30, 1, flip);
  void look;
}

export function paintPortrait(canvas) {
  const g = canvas.getContext('2d');
  const scale = 4;
  canvas.width = 16 * scale;
  canvas.height = 16 * scale;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#f3e0b8';
  g.fillRect(0, 0, canvas.width, canvas.height);
  const head = DOWN.slice(1, 15);
  drawSprite(g, head, 0, 0, scale, false);
}
