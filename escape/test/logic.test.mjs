import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { ROOMS } from '../js/data/rooms.js';
import { ALPHABET, CANDLE_ALIAS, INGREDIENTS, SOLUTIONS } from '../js/data/world.js';
import { findPath } from '../js/engine/path.js';
import { buildWalkGrid, footprintTiles, standTiles } from '../js/game/grid.js';
import { LOOKS, PLAYER_LOOK } from '../js/render/character.js';
import { nearestFloor, pickProp, propAnchor } from '../js/game/pick.js';
import {
  checkBooks,
  checkCandles,
  checkCipherKey,
  checkDial,
  checkPotion,
  decryptWithKey,
  encryptWithKey,
  potionReaction,
  shiftChar,
} from '../js/game/logic.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function perms(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    for (const rest of perms(arr.slice(0, i).concat(arr.slice(i + 1)))) out.push([arr[i], ...rest]);
  }
  return out;
}

test('maps are rectangular and exits sit on door tiles', () => {
  for (const room of Object.values(ROOMS)) {
    assert.equal(room.map.length, 12, room.id);
    for (const row of room.map) assert.equal(row.length, 12, room.id + ' ' + row);
    for (const exit of room.exits) {
      assert.equal(room.map[exit.y][exit.x], '+', room.id + ' exit ' + exit.id);
      assert.ok(ROOMS[exit.to], exit.to);
    }
  }
});

test('props stay inside the room and do not pile onto the same tile', () => {
  for (const room of Object.values(ROOMS)) {
    const used = new Set();
    for (const prop of room.props) {
      for (const tile of footprintTiles(prop)) {
        assert.ok(tile.x >= 0 && tile.y >= 0 && tile.x < 12 && tile.y < 12, prop.id);
        const ch = room.map[tile.y][tile.x];
        if (prop.exit) assert.equal(ch, '+', prop.id);
        else assert.ok(ch === '.' || ch === ',', prop.id + ' on ' + ch);
        if (prop.block) {
          const key = tile.x + ',' + tile.y;
          assert.equal(used.has(key), false, room.id + ' overlap ' + key);
          used.add(key);
        }
      }
    }
  }
});

test('every prop can be walked up to', () => {
  const open = {
    flags: { candle_solved: true, books_solved: true, cipher_solved: true, inscription: true, ending: true },
    inv: ['copper_key', 'potion', 'star_ash'],
  };
  for (const room of Object.values(ROOMS)) {
    const grid = buildWalkGrid(room, open);
    const sx = room.spawn.x;
    const sy = room.spawn.y;
    assert.equal(grid[sy][sx], 1, room.id + ' spawn blocked');
    for (const prop of room.props) {
      const stands = standTiles(prop, grid);
      const spot = stands.find((tile) => findPath(grid, sx, sy, tile.x, tile.y));
      assert.ok(spot, room.id + ' cannot reach ' + prop.id);
    }
  }
});

test('candle rules have one order', () => {
  const opposite = { 金: '银', 银: '金', 墨: '铜', 铜: '墨' };
  const found = [];
  for (const order of perms(['墨', '银', '金', '铜'])) {
    if (opposite[order[0]] !== order[3]) continue;
    const ink = order.indexOf('墨');
    const copper = order.indexOf('铜');
    if (!(ink < copper && Math.abs(ink - copper) > 1)) continue;
    if (order.indexOf('金') !== order.indexOf('银') + 1) continue;
    if (order[1] === '铜') continue;
    found.push(order.join(''));
  }
  assert.deepEqual(found, [SOLUTIONS.candles.join('')]);
  assert.equal(checkCandles(SOLUTIONS.candles), true);
  assert.equal(checkCandles(['银', '墨', '金', '铜']), false);
});

test('book rules have one subject row', () => {
  const clasps = [2, 3, 4, 1];
  const colors = ['褐', '绛', '青', '白'];
  const found = [];
  for (const subjects of perms(['史录', '星图', '阶咒', '药剂'])) {
    const pos = (name) => subjects.indexOf(name);
    if (colors[pos('药剂')] !== '白') continue;
    if (colors[pos('星图')] === '褐') continue;
    if (pos('星图') !== pos('史录') + 1) continue;
    if (clasps[pos('史录')] !== clasps[pos('星图')] - 1) continue;
    if (clasps[pos('阶咒')] !== clasps[pos('星图')] + 1) continue;
    found.push(subjects.join('-'));
  }
  assert.deepEqual(found, [SOLUTIONS.books.join('-')]);
  assert.equal(checkBooks(SOLUTIONS.books), true);
});

test('potion rules have one ordered recipe', () => {
  const recipes = [];
  for (const a of INGREDIENTS) {
    for (const b of INGREDIENTS) {
      if (b === a) continue;
      for (const c of INGREDIENTS) {
        if (c === a || c === b) continue;
        const seq = [a, b, c];
        if (seq.some((item) => item.id === 'salt_bloom')) continue;
        if (seq.filter((item) => item.mineral).length > 1) continue;
        if (seq.reduce((sum, item) => sum + item.heat, 0) !== 0) continue;
        if (!seq.some((item) => item.id === 'copper_rust')) continue;
        if (seq[0].heat >= 0) continue;
        if (seq[1].mineral) continue;
        const ids = seq.map((item) => item.id);
        if (ids.includes('feather_ash') && ids.includes('honey_crystal')) continue;
        recipes.push(ids.join('>'));
      }
    }
  }
  assert.deepEqual(recipes, [SOLUTIONS.potion.join('>')]);
  assert.equal(checkPotion(SOLUTIONS.potion), true);
  assert.match(potionReaction(['salt_bloom', 'moon_dew', 'candle_tear']), /盐花/);
});

test('dial clues narrow to one phrase, and the last line is required', () => {
  const glyphs = ['月', '烛', '羽', '钥', '钟'];
  function solve(useMid, useFeather) {
    const out = [];
    for (const row of perms(glyphs)) {
      const at = (name) => row.indexOf(name);
      if (at('月') === 0 || at('月') === 4) continue;
      if (!(at('烛') < at('羽') && at('羽') - at('烛') === 2)) continue;
      if (!(at('钥') > at('钟'))) continue;
      if (useMid && !(row[2] === '烛' || row[2] === '钟')) continue;
      if (useFeather && Math.abs(at('羽') - at('钥')) === 1) continue;
      out.push(row.join(''));
    }
    return out;
  }
  assert.equal(solve(false, false).length, 5);
  assert.equal(solve(true, false).length, 2);
  assert.deepEqual(solve(true, true), [SOLUTIONS.dial.join('')]);
  assert.equal(checkDial(SOLUTIONS.dial), true);
});

test('cipher key is the candle aliases and the worked example holds', () => {
  assert.deepEqual(
    SOLUTIONS.candles.map((metal) => CANDLE_ALIAS[metal]),
    SOLUTIONS.cipherKey,
  );
  assert.equal(shiftChar('端', alphabetDelta('月')), '不');
  const cipher = encryptWithKey(SOLUTIONS.cipherPlain, SOLUTIONS.cipherKey);
  assert.equal(decryptWithKey(cipher, SOLUTIONS.cipherKey), SOLUTIONS.cipherPlain);
  assert.equal(checkCipherKey(SOLUTIONS.cipherKey), true);
  assert.equal(checkCipherKey(['月', '羽', '烛', '钟']), false);
  assert.equal(ALPHABET.length, 12);
});

test('taps hit the prop body and near-misses still find a floor', () => {
  const cam = { scale: 1, ox: 40, oy: 60 };
  const candle = { id: 'candle', type: 'candle', x: 4, y: 5, hit: 0.8 };
  const book = { id: 'book', type: 'book', x: 4, y: 5, hit: 0.7, pick: 3 };
  const at = propAnchor(candle, cam);
  assert.equal(pickProp([candle], cam, at.x + 8, at.y - 6).id, 'candle');
  assert.equal(pickProp([candle], cam, at.x + 180, at.y), null);
  assert.equal(pickProp([candle, book], cam, at.x, at.y).id, 'book');
  const grid = [
    [0, 0, 0],
    [0, 1, 1],
    [0, 1, 0],
  ];
  assert.deepEqual(nearestFloor(grid, 1.2, 1.4), { x: 1, y: 1 });
  assert.deepEqual(nearestFloor(grid, 0.6, 1.2), { x: 1, y: 1 });
  assert.equal(nearestFloor(grid, 0.1, 0.1, 0.4), null);
});

test('player look can be swapped for another age and hair', () => {
  assert.equal(PLAYER_LOOK, LOOKS.xiaozhu);
  assert.equal(LOOKS.xiaozhu.age, 'child');
  assert.equal(LOOKS.xiaozhu.hair.style, 'bob');
  assert.ok(LOOKS.xiaozhu.outfit.outer);
  const adult = {
    ...LOOKS.xiaozhu,
    age: 'adult',
    hair: { style: 'tied', color: '#2a1814' },
    ribbon: null,
    outfit: { ...LOOKS.xiaozhu.outfit, kind: 'coat' },
  };
  assert.equal(adult.age, 'adult');
  assert.equal(adult.hair.style, 'tied');
});

function alphabetDelta(ch) {
  return ALPHABET.indexOf(ch);
}

test('service worker lists every file the page needs', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const needed = [
    'index.html',
    'manifest.webmanifest',
    'css/game.css',
    'js/game/main.js',
    'js/game/pick.js',
    'js/render/character.js',
    'js/data/world.js',
    'js/data/rooms.js',
    'icons/apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
  ];
  assert.match(sw, /xingzhu-escape-v2/);
  for (const file of needed) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
    assert.match(sw, new RegExp(file.replace('.', '\\.')));
  }
});
