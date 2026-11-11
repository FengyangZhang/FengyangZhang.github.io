/**
 * Pure puzzle rules. UI and tests both use these.
 * Solutions live in ../data/world.js — change clues, solution, and
 * escape/test/logic.test.mjs together.
 */

import {
  ALPHABET,
  CANDLE_ALIAS,
  SOLUTIONS,
} from '../data/world.js';

export function sameSeq(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function checkCandles(order) {
  return sameSeq(order, SOLUTIONS.candles);
}

export function checkBooks(subjects) {
  return sameSeq(subjects, SOLUTIONS.books);
}

export function checkPotion(ids) {
  return sameSeq(ids, SOLUTIONS.potion);
}

export function checkDial(glyphs) {
  return sameSeq(glyphs, SOLUTIONS.dial);
}

export function alphabetIndex(ch) {
  const i = ALPHABET.indexOf(ch);
  if (i < 0) throw new Error('字不在星律环上: ' + ch);
  return i;
}

/** Caesar step on the star ring: positive shift moves forward through the ring. */
export function shiftChar(ch, delta) {
  const n = ALPHABET.length;
  const i = alphabetIndex(ch);
  return ALPHABET[((i + delta) % n + n) % n];
}

export function encryptWithKey(plain, keyChars) {
  const out = [];
  for (let i = 0; i < plain.length; i++) {
    out.push(shiftChar(plain[i], alphabetIndex(keyChars[i % keyChars.length])));
  }
  return out.join('');
}

export function decryptWithKey(cipher, keyChars) {
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    out.push(shiftChar(cipher[i], -alphabetIndex(keyChars[i % keyChars.length])));
  }
  return out.join('');
}

export function candleKeyFromOrder(order) {
  return order.map((metal) => CANDLE_ALIAS[metal]);
}

export function cipherCiphertext() {
  return encryptWithKey(SOLUTIONS.cipherPlain, SOLUTIONS.cipherKey);
}

export function checkCipherKey(keyChars) {
  if (!keyChars || keyChars.some((c) => !c)) return false;
  try {
    return decryptWithKey(cipherCiphertext(), keyChars) === SOLUTIONS.cipherPlain;
  } catch {
    return false;
  }
}

export function previewCipher(keyChars) {
  if (!keyChars || keyChars.length !== 4 || keyChars.some((c) => !c)) return '';
  try {
    return decryptWithKey(cipherCiphertext(), keyChars);
  } catch {
    return '';
  }
}

/** Inventory combination. Returns the recipe or null. */
export function matchRecipe(selectedIds, recipes) {
  const have = [...selectedIds].sort().join('+');
  return recipes.find((r) => [...r.needs].sort().join('+') === have) || null;
}

export function currentObjective(state, objectives) {
  return objectives.find((o) => !o.done(state)) || null;
}

export function isExitOpen(state, exit) {
  if (exit.needFlag && !state.flags[exit.needFlag]) return false;
  if (exit.needItem && !state.inv.includes(exit.needItem)) return false;
  return true;
}

export function doorMessage(state, exit) {
  if (exit.lock === 'candleDoor') {
    return '东门还是暗的。四支烛的次序没对，它不认你。';
  }
  if (exit.lock === 'libraryDoor') {
    const tooth = state.inv.includes('key_tooth');
    const handle = state.inv.includes('key_handle');
    if (handle && !tooth) return '柄能伸进锁孔，可还缺一截齿。回中庭，看看南栏旁边那块裂开的地砖。';
    if (tooth && !handle) return '你有齿，没有柄。柄在书廊里，讲阶咒的那本书夹层是松的。';
    return '北门锁着。它要一枚完整的铜钥：一截齿，再加一截柄。';
  }
  return '这扇门还关着。';
}

/** What the cauldron shows when the recipe is wrong. Fair feedback, not the answer. */
export function potionReaction(ids) {
  const has = (id) => ids.includes(id);
  if (has('salt_bloom')) return '盐花沉下去，星光灭了。这不是澄星液。';
  if (has('feather_ash') && has('honey_crystal')) return '鸦羽灰碰上蜜晶，结了一层不能喝的膜。';
  if (has('copper_rust') && has('honey_crystal')) return '两种矿物搅在一起，坩埚糊住了。';
  if (has('honey_crystal') && !has('copper_rust')) return '炼出来是金色的。澄星液应该是青色。';
  if (!has('copper_rust')) return '液体是白的，里面没有星光。青色得靠铜锈。';
  if (checkPotion(ids)) return '';
  return '颜色倒是青了，可它摇两下就散。次序或冷热还不对。';
}
