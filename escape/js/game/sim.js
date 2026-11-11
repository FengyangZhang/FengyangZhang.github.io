/** Movement, room-edge transitions, dust, dawn. */

import { ROOMS } from '../data/rooms.js';
import { isExitOpen } from './logic.js';

function facingFrom(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'se' : 'nw';
  return dy > 0 ? 'sw' : 'ne';
}

export function step(state, dt, bus) {
  const player = state.player;
  player.idlePhase += dt;

  if (player.path && player.path.length) {
    const target = player.path[0];
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const speed = 2.45 * dt;
    player.moving = true;
    player.walkPhase += dt * 1.85;
    player.facing = facingFrom(dx, dy);
    if (dist <= speed) {
      player.x = target.x;
      player.y = target.y;
      player.path.shift();
      bus.step?.();
      if (!player.path.length) {
        player.moving = false;
        const done = player.arrive;
        player.arrive = null;
        if (done) done();
        enteredExit(state, bus);
      }
    } else {
      player.x += (dx / dist) * speed;
      player.y += (dy / dist) * speed;
    }
  } else {
    player.moving = false;
  }

  if (state.fade > 0) state.fade = Math.max(0, state.fade - dt * 1.7);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 1.5);
  if (state.mode === 'play') state.playMs += dt * 1000;

  if (state.flags.ending) {
    state.dawn = Math.min(1, (state.dawn || 0) + dt * 0.16);
  }
  if (state.endingDelay > 0) {
    state.endingDelay -= dt;
    if (state.endingDelay <= 0) bus.showEnding();
  }

  spawnMotes(state, dt);
}

function enteredExit(state, bus) {
  const room = ROOMS[state.roomId];
  const tx = Math.floor(state.player.x);
  const ty = Math.floor(state.player.y);
  for (const exit of room.exits) {
    if (exit.x === tx && exit.y === ty && isExitOpen(state, exit)) {
      bus.enter(exit);
      return;
    }
  }
}

function spawnMotes(state, dt) {
  const room = ROOMS[state.roomId];
  if (!state.motes) state.motes = [];
  const cap = 36;
  if (state.motes.length < cap && Math.random() < dt * 10) {
    const lit = room.lights[Math.floor(Math.random() * room.lights.length)];
    state.motes.push({
      x: lit.x + (Math.random() - 0.5) * 0.5,
      y: lit.y + (Math.random() - 0.5) * 0.5,
      z: 18 + Math.random() * 16,
      vz: 10 + Math.random() * 16,
      life: 1.1 + Math.random() * 0.8,
      max: 1.8,
      color: lit.color,
      size: 1.1 + Math.random() * 1.3,
    });
  }
  for (const mote of state.motes) {
    mote.z += mote.vz * dt;
    mote.x += Math.sin(mote.z * 0.1) * dt * 0.05;
    mote.life -= dt;
  }
  state.motes = state.motes.filter((mote) => mote.life > 0);
}
