/** Save data. Runtime fields (path, sheet, motes) are not written to disk. */

import { ROOMS } from '../data/rooms.js';

export const SAVE_KEY = 'xingzhu-escape-v1';

export function blankState() {
  return {
    v: 1,
    mode: 'title',
    roomId: 'atrium',
    player: {
      x: 6.5,
      y: 9.5,
      facing: 'se',
      path: [],
      arrive: null,
      moving: false,
      walkPhase: 0,
      idlePhase: 0,
    },
    flags: {},
    inv: [],
    journal: [],
    hints: { candles: 0, books: 0, cipher: 0, potion: 0, dial: 0, key: 0 },
    drafts: {
      candles: [],
      books: ['', '', '', ''],
      cipher: ['', '', '', ''],
      potion: [],
      dial: ['', '', '', '', ''],
    },
    entered: {},
    sheet: null,
    dialogue: null,
    useItem: null,
    selectedItem: null,
    cipherPreview: '',
    fade: 0,
    shake: 0,
    dawn: 0,
    playMs: 0,
    endingDelay: 0,
    camSnap: true,
    motes: [],
    toast: null,
    hasSave: false,
  };
}

export function serialize(state) {
  return {
    v: 1,
    roomId: state.roomId,
    player: {
      x: state.player.x,
      y: state.player.y,
      facing: state.player.facing,
    },
    flags: state.flags,
    inv: state.inv,
    journal: state.journal,
    hints: state.hints,
    drafts: state.drafts,
    entered: state.entered,
    playMs: state.playMs,
  };
}

export function persist(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(state)));
  } catch {
    /* private mode or full storage */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

function readRaw() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) return null;
    const data = JSON.parse(text);
    if (!data || data.v !== 1 || !ROOMS[data.roomId]) return null;
    return data;
  } catch {
    return null;
  }
}

export function createState() {
  const data = readRaw();
  if (!data) return blankState();
  const state = blankState();
  state.roomId = data.roomId;
  state.player.x = data.player?.x ?? state.player.x;
  state.player.y = data.player?.y ?? state.player.y;
  state.player.facing = data.player?.facing || 'se';
  state.flags = data.flags || {};
  state.inv = Array.isArray(data.inv) ? data.inv : [];
  state.journal = Array.isArray(data.journal) ? data.journal : [];
  state.hints = { ...state.hints, ...(data.hints || {}) };
  state.drafts = {
    candles: data.drafts?.candles || [],
    books: data.drafts?.books?.length === 4 ? data.drafts.books : ['', '', '', ''],
    cipher: data.drafts?.cipher?.length === 4 ? data.drafts.cipher : ['', '', '', ''],
    potion: data.drafts?.potion || [],
    dial: data.drafts?.dial?.length === 5 ? data.drafts.dial : ['', '', '', '', ''],
  };
  state.entered = data.entered || {};
  state.playMs = data.playMs || 0;
  state.dawn = state.flags.ending ? 1 : 0;
  state.hasSave = state.playMs > 400 || Object.keys(state.flags).length > 0;
  state.mode = 'title';
  state.camSnap = true;
  return state;
}

export function replaceState(state, next) {
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, next);
}
