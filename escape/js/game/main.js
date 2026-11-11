/** Boot, input, and the frame loop. */

import { OBJECTIVES } from '../data/world.js';
import { createAudio } from '../engine/audio.js';
import { createScene, projectTile, viewToTile } from '../render/scene.js';
import { createActions } from './actions.js';
import { currentObjective } from './logic.js';
import { step } from './sim.js';
import { createState, persist } from './state.js';
import { createUI } from './ui.js';

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d', { alpha: false });
const view = { w: 1, h: 1, dpr: 1 };

function resize() {
  view.w = window.innerWidth;
  view.h = window.innerHeight;
  view.dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(view.w * view.dpr);
  canvas.height = Math.floor(view.h * view.dpr);
}

resize();
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

const state = createState();
const audio = createAudio();
const scene = createScene();
const app = document.getElementById('app');

let ui;
const actions = createActions(state, {
  audio,
  refresh() {
    if (state.mode === 'play') persist(state);
    ui.render();
  },
  markDirty() {
    if (state.mode === 'play') persist(state);
  },
  puzzleForHint() {
    const current = currentObjective(state, OBJECTIVES);
    if (!current) return 'dial';
    return current.puzzle || current.id;
  },
});
ui = createUI(app, state);
ui.render();

app.addEventListener('click', (event) => {
  const el = event.target.closest('[data-act]');
  if (!el || el.tagName === 'SELECT') return;
  const fn = actions[el.dataset.act];
  if (typeof fn !== 'function') return;
  fn.call(actions, el.dataset);
});

app.addEventListener('change', (event) => {
  const el = event.target.closest('[data-act]');
  if (!el) return;
  const fn = actions[el.dataset.act];
  if (typeof fn === 'function') fn.call(actions, el.dataset, el.value);
});

let pointer = null;
canvas.addEventListener('pointerdown', (event) => {
  if (state.sheet || state.mode !== 'play') return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
canvas.addEventListener('pointerup', (event) => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  pointer = null;
  if (dx * dx + dy * dy > 16 * 16) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  const tile = viewToTile(state, view, sx, sy);
  actions.tapWorld(tile.x, tile.y, { x: sx, y: sy });
});
canvas.addEventListener('pointercancel', () => {
  pointer = null;
});

document.addEventListener('touchmove', (event) => {
  if (event.target.closest('.scroll, .sheet-body, select')) return;
  event.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (event) => event.preventDefault());

let last = performance.now();
let saveAcc = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(state, dt, {
    step: () => actions.footstep(),
    enter: (exit) => actions.enter(exit),
    showEnding: () => actions.showEnding(),
  });
  if (state.toast && now > state.toast.until) {
    state.toast = null;
    ui.render();
  }
  if (state.pendingUpdate && state.mode !== 'play') {
    state.pendingUpdate = false;
    location.reload();
    return;
  }
  scene.draw(ctx, view, state, now / 1000);
  if (state.mode === 'play') {
    saveAcc += dt;
    if (saveAcc > 2.5) {
      persist(state);
      saveAcc = 0;
    }
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    if (state.mode === 'play') {
      state.pendingUpdate = true;
      return;
    }
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    navigator.serviceWorker.getRegistration().then((reg) => reg?.update()).catch(() => {});
    if (state.pendingUpdate && state.mode !== 'play') location.reload();
  });
}

const params = new URLSearchParams(location.search);
if (params.has('dev')) {
  window.__game = {
    state,
    actions,
    project: (x, y) => projectTile(state, view, x, y),
    tileAt: (px, py) => viewToTile(state, view, px, py),
  };
}
