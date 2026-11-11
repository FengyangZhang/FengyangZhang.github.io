/** Player verbs. Puzzles and items are data-driven; this file is the wiring. */

import { ROOMS } from '../data/rooms.js';
import {
  BOOKS,
  CANDLES,
  COPY,
  DIALOGUES,
  DIAL_GLYPHS,
  HINTS,
  ITEMS,
  RECIPES,
  SOLUTIONS,
} from '../data/world.js';
import { findPath, nearestWalkable } from '../engine/path.js';
import { buildWalkGrid, standTiles } from './grid.js';
import {
  checkBooks,
  checkCandles,
  checkCipherKey,
  checkDial,
  checkPotion,
  doorMessage,
  isExitOpen,
  matchRecipe,
  potionReaction,
  previewCipher,
} from './logic.js';
import { blankState, clearSave, replaceState } from './state.js';

export function createActions(state, hooks) {
  function refresh() {
    hooks.refresh();
  }

  function toast(text) {
    state.toast = { text, until: performance.now() + 2800 };
    refresh();
  }

  function journal(entry) {
    if (state.journal.some((item) => item.id === entry.id)) return;
    state.journal.push(entry);
  }

  function addItem(id) {
    if (!state.inv.includes(id)) state.inv.push(id);
  }

  function removeItem(id) {
    state.inv = state.inv.filter((item) => item !== id);
  }

  function openRead(key) {
    const copy = COPY[key];
    journal({ id: 'copy-' + key, tag: copy.tag, title: copy.title, body: copy.body });
    state.flags['read_' + key] = true;
    state.sheet = { type: 'read', key };
    refresh();
  }

  function startDialogue(id, focus) {
    state.dialogue = { id, i: 0, focus: focus || null };
    state.sheet = { type: 'dialogue' };
    refresh();
  }

  function finishDialogue() {
    const id = state.dialogue?.id;
    state.dialogue = null;
    state.sheet = null;
    if (id === 'intro') {
      state.flags.introDone = true;
      journal({
        id: 'intro',
        tag: '记事',
        title: '缄默夜',
        body: '西翼锁上了。裴照微说：中庭四支烛有苏醒的次序，次序对了，东门才认你。',
      });
    }
    if (id === 'portrait2') {
      journal({
        id: 'truth2',
        tag: '线索',
        title: '第二句真话',
        body: '东门认了次序之后，壁炉里会落下星烬。炼药用得着。',
      });
    }
    if (id === 'librarian') {
      state.flags.librarian = true;
      journal({
        id: 'method',
        tag: '线索',
        title: '星律环的用法',
        body: '加密是往前走，解密是往回退。钥匙四个字，循环使用。例子：明文「端」，钥匙「月」，密文是「不」。钥匙来自四支烛的别名，按苏醒顺序。',
      });
    }
    refresh();
  }

  function changeRoom(id, spawn) {
    state.roomId = id;
    state.player.x = spawn.x + 0.5;
    state.player.y = spawn.y + 0.5;
    state.player.path = [];
    state.player.arrive = null;
    state.player.moving = false;
    state.fade = 1;
    state.camSnap = true;
    state.motes = [];
    const room = ROOMS[id];
    if (!state.entered[id]) {
      state.entered[id] = true;
      state.toast = { text: room.name, until: performance.now() + 2200 };
    }
    refresh();
  }

  function walkTo(tx, ty, done) {
    const room = ROOMS[state.roomId];
    const grid = buildWalkGrid(room, state);
    const sx = Math.floor(state.player.x);
    const sy = Math.floor(state.player.y);
    const path = findPath(grid, sx, sy, tx, ty);
    if (!path) {
      toast('那边走不过去');
      return false;
    }
    state.player.path = path.slice(1).map((tile) => ({ x: tile.x + 0.5, y: tile.y + 0.5 }));
    state.player.arrive = done || null;
    if (!state.player.path.length && done) done();
    return true;
  }

  function tryUseOn(prop) {
    if (state.useItem === 'potion' && (prop.action === 'slate' || prop.action === 'dial')) {
      pourPotion();
      return;
    }
    toast('澄星液在这里没有反应。');
  }

  function pourPotion() {
    if (state.flags.inscription) {
      toast('那一行已经显出来了。');
      state.useItem = null;
      refresh();
      return;
    }
    if (!state.inv.includes('potion')) {
      toast('你还没有澄星液。');
      return;
    }
    removeItem('potion');
    state.flags.inscription = true;
    state.useItem = null;
    journal({
      id: 'copy-slateHidden',
      tag: '星盘',
      title: COPY.slateHidden.title,
      body: COPY.slateHidden.body,
    });
    hooks.audio.success();
    state.sheet = { type: 'slate' };
    state.toast = { text: '浅青色沿着凹槽走了一遍。', until: performance.now() + 2600 };
    refresh();
  }

  function runProp(prop) {
    if (state.useItem) {
      tryUseOn(prop);
      return;
    }
    const room = ROOMS[state.roomId];
    switch (prop.action) {
      case 'read':
        openRead(prop.read);
        break;
      case 'portrait': {
        const focus = { x: prop.x + 0.5, y: prop.y + 0.5 };
        if (!state.flags.candle_solved) startDialogue('portraitRemind', focus);
        else if (!state.flags.truth2) {
          state.flags.truth2 = true;
          startDialogue('portrait2', focus);
        } else if (!state.flags.truth3) {
          state.flags.truth3 = true;
          startDialogue('portrait3', focus);
        } else startDialogue('portraitSleep', focus);
        break;
      }
      case 'librarian':
        startDialogue('librarian', { x: prop.x + 0.5, y: prop.y + 0.5 });
        break;
      case 'readCandle': {
        const candle = CANDLES.find((item) => item.id === prop.candle);
        state.sheet = {
          type: 'read',
          custom: {
            title: candle.dir + ' · ' + candle.id + '烛',
            body: '这是' + candle.dir + '边的' + candle.id + '烛。它和正对面的那一支是一对。\n次序不写在烛上，写在青铜碑上。想好了就去厅心的星形砖。',
          },
        };
        refresh();
        break;
      }
      case 'brazier':
        if (!state.flags.candle_solved) openRead('brazierBefore');
        else if (!state.flags.tookAsh) {
          state.flags.tookAsh = true;
          addItem('star_ash');
          hooks.audio.tick();
          openRead('brazierAsh');
        } else openRead('brazierEmpty');
        break;
      case 'brick':
        if (!state.flags.tookTooth) {
          state.flags.tookTooth = true;
          addItem('key_tooth');
          hooks.audio.tick();
          openRead('brick');
        } else openRead('brickEmpty');
        break;
      case 'candles':
        state.sheet = { type: 'puzzle', puzzle: 'candles' };
        refresh();
        break;
      case 'books':
        state.sheet = { type: 'puzzle', puzzle: 'books' };
        refresh();
        break;
      case 'cipher':
        state.sheet = { type: 'puzzle', puzzle: 'cipher' };
        refresh();
        break;
      case 'potion':
        state.sheet = { type: 'puzzle', puzzle: 'potion' };
        refresh();
        break;
      case 'dial':
        state.sheet = { type: 'puzzle', puzzle: 'dial' };
        refresh();
        break;
      case 'slate':
        journal({
          id: 'copy-slateVisible',
          tag: '星盘',
          title: COPY.slateVisible.title,
          body: COPY.slateVisible.body,
        });
        if (state.flags.inscription) {
          journal({
            id: 'copy-slateHidden',
            tag: '星盘',
            title: COPY.slateHidden.title,
            body: COPY.slateHidden.body,
          });
        }
        state.sheet = { type: 'slate' };
        refresh();
        break;
      case 'door': {
        const exit = room.exits.find((item) => item.id === prop.exit);
        if (!exit) return;
        if (!isExitOpen(state, exit)) {
          toast(doorMessage(state, exit));
          return;
        }
        changeRoom(exit.to, exit.spawn);
        break;
      }
      case 'inspectBook': {
        const book = BOOKS.find((item) => item.id === prop.book);
        state.flags['book_' + book.id] = true;
        const body =
          book.id +
          '册。封面是' +
          book.colorName +
          '色，压着' +
          book.emblem +
          '纹，搭扣 ' +
          book.clasps +
          ' 枚。书脊上的题目被撕掉了。';
        journal({ id: 'book-' + book.id, tag: '线索', title: book.id + '册', body });
        state.sheet = { type: 'read', custom: { title: book.id + '册', body } };
        refresh();
        break;
      }
      case 'shelfFlavor':
        toast('这些书都锁着。被人抽出来的只有当中那四本。');
        break;
      case 'stairs':
        toast(state.flags.ending ? '楼梯轻轻动了一格，又像是在等人。' : '楼梯停在半空，像一句说到一半的话。');
        break;
      case 'bell':
        toast(state.flags.ending ? '钟自己响起来，又很快停了。' : '现在敲它没有用。归名在星盘上。');
        break;
      case 'pickup':
        if (state.inv.includes(prop.item)) toast(prop.name + '已经在随身物里。');
        else {
          addItem(prop.item);
          const info = ITEMS[prop.item];
          journal({ id: 'item-' + prop.item, tag: '配方', title: info.name, body: info.desc });
          hooks.audio.tick();
          toast('拿起了' + info.name + '。');
        }
        break;
      default:
        break;
    }
  }

  function interact(prop) {
    if (state.mode !== 'play' || state.sheet) return;
    const room = ROOMS[state.roomId];
    const grid = buildWalkGrid(room, state);
    const stands = standTiles(prop, grid);
    const sx = Math.floor(state.player.x);
    const sy = Math.floor(state.player.y);
    const spot = nearestWalkable(grid, stands, sx, sy);
    if (!spot) {
      toast('你靠不近。');
      return;
    }
    const go = () => runProp(prop);
    if (sx === spot.x && sy === spot.y) go();
    else walkTo(spot.x, spot.y, go);
  }

  const api = {
    tapWorld(wx, wy) {
      if (state.mode !== 'play' || state.sheet) return;
      const room = ROOMS[state.roomId];
      const hits = [];
      for (const prop of room.props) {
        const cx = prop.x + (prop.w || 1) / 2;
        const cy = prop.y + (prop.h || 1) / 2;
        const dx = wx - cx;
        const dy = wy - cy;
        const radius = prop.hit || 0.72;
        if (dx * dx + dy * dy <= radius * radius) hits.push(prop);
      }
      if (hits.length) {
        hits.sort((a, b) => (b.pick || 0) - (a.pick || 0) || b.x + b.y - (a.x + a.y));
        interact(hits[0]);
        return;
      }
      const tx = Math.floor(wx);
      const ty = Math.floor(wy);
      const grid = buildWalkGrid(room, state);
      if (!grid[ty] || grid[ty][tx] !== 1) {
        toast('那边走不过去。');
        return;
      }
      walkTo(tx, ty, null);
    },

    enter(exit) {
      changeRoom(exit.to, exit.spawn);
    },

    showEnding() {
      state.sheet = { type: 'ending' };
      refresh();
    },

    footstep() {
      hooks.audio.step();
    },

    startNew() {
      replaceState(state, blankState());
      clearSave();
      state.mode = 'play';
      state.camSnap = true;
      hooks.audio.unlock();
      startDialogue('intro');
    },

    continueGame() {
      state.mode = 'play';
      state.camSnap = true;
      state.sheet = null;
      hooks.audio.unlock();
      if (!state.flags.introDone) startDialogue('intro');
      else refresh();
    },

    openHelp() {
      state.sheet = { type: 'help' };
      refresh();
    },

    openMenu() {
      state.sheet = { type: 'menu' };
      refresh();
    },

    closeSheet() {
      if (state.sheet?.type === 'dialogue') return;
      state.sheet = null;
      state.selectedItem = null;
      refresh();
    },

    toggleSound() {
      const on = hooks.audio.toggle();
      toast(on ? '声音开了。' : '声音关了。');
    },

    openJournal() {
      state.sheet = { type: 'journal' };
      refresh();
    },

    openInventory() {
      state.sheet = { type: 'inventory' };
      state.selectedItem = null;
      refresh();
    },

    openHint() {
      const puzzle = hooks.puzzleForHint();
      state.sheet = { type: 'hints', puzzle };
      refresh();
    },

    revealHint(ds) {
      const puzzle = ds.puzzle;
      const list = HINTS[puzzle] || [];
      const seen = state.hints[puzzle] || 0;
      if (seen < list.length) state.hints[puzzle] = seen + 1;
      refresh();
    },

    dialogNext() {
      if (!state.dialogue) return;
      const lines = DIALOGUES[state.dialogue.id];
      if (state.dialogue.i < lines.length - 1) {
        state.dialogue.i += 1;
        refresh();
      } else finishDialogue();
    },

    dialogSkip() {
      if (state.dialogue) finishDialogue();
    },

    askRestart() {
      state.sheet = { type: 'confirm' };
      refresh();
    },

    doRestart() {
      replaceState(state, blankState());
      clearSave();
      state.camSnap = true;
      refresh();
    },

    showEndingCard() {
      state.sheet = { type: 'ending' };
      refresh();
    },

    selectItem(ds) {
      const id = ds.id;
      if (state.selectedItem && state.selectedItem !== id) {
        const recipe = matchRecipe([state.selectedItem, id], RECIPES);
        if (recipe) {
          api.craft(recipe);
          return;
        }
      }
      state.selectedItem = state.selectedItem === id ? null : id;
      refresh();
    },

    craft(recipe) {
      const found = recipe || matchRecipe(['key_tooth', 'key_handle'], RECIPES);
      if (!found) return;
      if (!found.needs.every((id) => state.inv.includes(id))) {
        toast('还缺一半。');
        return;
      }
      for (const id of found.needs) removeItem(id);
      addItem(found.result);
      state.selectedItem = null;
      journal({ id: 'key-made', tag: '线索', title: '铜钥', body: found.text + '书廊北门会认它。' });
      hooks.audio.success();
      toast(found.text);
    },

    combineKeys() {
      api.craft(RECIPES[0]);
    },

    armItem(ds) {
      const id = ds.id || state.selectedItem;
      if (id !== 'potion') {
        toast('这件东西先收着。钥匙在随身物里就能拼。');
        return;
      }
      state.useItem = 'potion';
      state.sheet = null;
      toast('走到星钟塔的石面，点一下。');
    },

    cancelUse() {
      state.useItem = null;
      refresh();
    },

    candleAdd(ds) {
      const list = state.drafts.candles;
      if (list.includes(ds.id) || list.length >= 4) return;
      list.push(ds.id);
      refresh();
    },

    candleClear() {
      state.drafts.candles = [];
      refresh();
    },

    candleSubmit() {
      const order = state.drafts.candles;
      if (order.length < 4) {
        toast('四支都要点到。');
        return;
      }
      if (checkCandles(order)) {
        const first = !state.flags.candle_solved;
        state.flags.candle_solved = true;
        journal({
          id: 'candle-order',
          tag: '线索',
          title: '四烛的次序',
          body: '苏醒顺序：' + SOLUTIONS.candles.join('、') + '。东门认了这个次序。',
        });
        hooks.audio.success();
        state.sheet = null;
        toast(first ? '四支烛一起亮了一下。东门开了。' : '次序是对的。');
      } else {
        state.shake = 0.7;
        hooks.audio.fail();
        toast('烛火摇了摇，灭了。这次的次序不对。');
      }
    },

    bookSet(ds, value) {
      state.drafts.books[Number(ds.i)] = value;
      hooks.markDirty();
    },

    bookSubmit() {
      if (state.drafts.books.some((item) => !item)) {
        toast('四本都要写上题目。');
        return;
      }
      if (checkBooks(state.drafts.books)) {
        state.flags.books_solved = true;
        if (!state.flags.tookHandle) {
          state.flags.tookHandle = true;
          addItem('key_handle');
        }
        journal({
          id: 'books-solved',
          tag: '线索',
          title: '四本书的题目',
          body: '甲史录，乙星图，丙阶咒，丁药剂。钥匙柄从丙册的夹层里滑出来。',
        });
        hooks.audio.success();
        state.sheet = null;
        toast('丙册的夹层松了，一截铜柄滑到你手里。');
      } else {
        hooks.audio.fail();
        toast('四本书都不肯开。题目对不上。');
      }
    },

    cipherSet(ds, value) {
      state.drafts.cipher[Number(ds.i)] = value;
      hooks.markDirty();
    },

    cipherSubmit() {
      const key = state.drafts.cipher;
      if (key.some((item) => !item)) {
        toast('钥匙要四个字。');
        return;
      }
      state.cipherPreview = previewCipher(key);
      if (checkCipherKey(key)) {
        state.flags.cipher_solved = true;
        journal({
          id: 'cipher-plain',
          tag: '星盘',
          title: '残页读通了',
          body: '正中是烛，或是钟。',
        });
        hooks.audio.success();
        toast('这句是给星盘的。');
      } else {
        hooks.audio.fail();
        toast('退出来的不成一句规矩。钥匙的顺序再看看。');
      }
      refresh();
    },

    potionAdd(ds) {
      if (state.drafts.potion.length >= 3) return;
      if (state.drafts.potion.includes(ds.id)) return;
      if (!state.inv.includes(ds.id)) return;
      state.drafts.potion.push(ds.id);
      refresh();
    },

    potionClear() {
      state.drafts.potion = [];
      refresh();
    },

    potionSubmit() {
      const ids = state.drafts.potion;
      if (ids.length < 3) {
        toast('澄星液要三种材料。');
        return;
      }
      if (checkPotion(ids)) {
        for (const id of ids) removeItem(id);
        state.drafts.potion = [];
        addItem('potion');
        journal({
          id: 'potion-made',
          tag: '配方',
          title: '澄星液',
          body: '星烬、鸦羽灰、铜锈，按这个次序。成品是浅青色。拿到星钟塔，浇在被隐去的那一行上。',
        });
        hooks.audio.success();
        state.sheet = null;
        toast('坩埚里的液体稳住了，浅青色，有碎星在转。');
      } else {
        hooks.audio.fail();
        toast(potionReaction(ids));
      }
    },

    dialAdd(ds) {
      const list = state.drafts.dial;
      if (list.includes(ds.glyph)) return;
      const index = list.findIndex((item) => !item);
      if (index === -1) return;
      list[index] = ds.glyph;
      refresh();
    },

    dialClear() {
      state.drafts.dial = ['', '', '', '', ''];
      refresh();
    },

    dialSubmit() {
      if (state.drafts.dial.some((item) => !item)) {
        toast('五格都要放上符文。');
        return;
      }
      if (checkDial(state.drafts.dial)) {
        state.flags.ending = true;
        state.endingDelay = 2.5;
        state.sheet = null;
        journal({
          id: 'dial-solved',
          tag: '星盘',
          title: '归名',
          body: '从左到右：钟、钥、烛、月、羽。',
        });
        hooks.audio.success();
        refresh();
      } else {
        state.shake = 1;
        hooks.audio.fail();
        if (!state.flags.cipher_solved || !state.flags.inscription) {
          toast('顺序不对。规矩还没齐：一句在书廊残页里，一句要澄星液才显出来。');
        } else {
          toast('星盘轻轻震了一下，又回到原处。顺序还不对。');
        }
      }
    },

    pourPotion() {
      pourPotion();
    },

    openDial() {
      state.sheet = { type: 'puzzle', puzzle: 'dial' };
      refresh();
    },
  };

  return api;
}

export function hintPuzzleFromState(state) {
  const order = [
    ['candle_solved', 'candles'],
    ['books_solved', 'books'],
    ['copper_key', 'key'],
    ['cipher_solved', 'cipher'],
    ['potion', 'potion'],
    ['inscription', 'dial'],
    ['ending', 'dial'],
  ];
  for (const [flag, puzzle] of order) {
    if (flag === 'copper_key') {
      if (!state.inv.includes('copper_key')) return puzzle;
      continue;
    }
    if (flag === 'potion') {
      if (!state.inv.includes('potion') && !state.flags.inscription) return puzzle;
      continue;
    }
    if (!state.flags[flag]) return puzzle;
  }
  return 'dial';
}

export { DIAL_GLYPHS };
