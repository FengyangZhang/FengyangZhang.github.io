/** DOM shell. The room itself stays on the canvas. */

import {
  ALPHABET,
  BOOKS,
  CANDLES,
  COPY,
  DIALOGUES,
  DIAL_CLUE_CIPHER,
  DIAL_CLUE_POTION,
  DIAL_CLUES_VISIBLE,
  DIAL_GLYPHS,
  HINTS,
  INGREDIENTS,
  ITEMS,
  OBJECTIVES,
  SUBJECTS,
} from '../data/world.js';
import { cipherCiphertext } from './logic.js';
import { currentObjective } from './logic.js';

const TAGS = ['线索', '配方', '星盘', '记事', '闲话'];

function esc(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function paras(text) {
  return esc(text).replace(/\n/g, '<br>');
}

function soundOn() {
  try {
    return localStorage.getItem('xingzhu-escape-sound') === '1';
  } catch {
    return false;
  }
}

function clock(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ' 分 ' + String(s).padStart(2, '0') + ' 秒';
}

function objectiveText(state) {
  const current = currentObjective(state, OBJECTIVES);
  if (!current) return '西翼的锁开了';
  return typeof current.text === 'function' ? current.text(state) : current.text;
}

function hintsUsed(state) {
  return Object.values(state.hints).reduce((sum, n) => sum + (n || 0), 0);
}

export function createUI(root, state) {
  function render() {
    document.body.dataset.mode = state.mode;
    const roomName = state.mode === 'title' ? '星烛学院' : (state.roomId && roomTitle(state));
    root.innerHTML = [
      hud(state, roomName),
      state.useItem ? '<div class="use-banner"><span>澄星液拿在手里</span><button class="btn btn-ghost" data-act="cancelUse">取消</button></div>' : '',
      state.toast ? '<div class="toast" role="status">' + esc(state.toast.text) + '</div>' : '',
      state.mode === 'title' ? titleScreen(state) : '',
      sheet(state),
    ].join('');
  }

  return { render };
}

function roomTitle(state) {
  const names = {
    atrium: ['烛火中庭', '西翼 · 第一扇门'],
    library: ['回响书廊', '西翼 · 第二扇门'],
    cloister: ['药剂回廊', '西翼 · 第三扇门'],
    tower: ['星钟塔', '西翼 · 最后一扇门'],
  };
  return names[state.roomId] || ['', ''];
}

function hud(state, roomName) {
  const pair = Array.isArray(roomName) ? roomName : [roomName, ''];
  return (
    '<header class="hud-top">' +
      '<div class="room-block"><div class="room-name">' + esc(pair[0]) + '</div>' +
      '<div class="room-sub">' + esc(pair[1] || '') + '</div></div>' +
      '<button class="icon-btn" data-act="toggleSound" aria-label="声音">' + (soundOn() ? '声音开' : '声音关') + '</button>' +
      '<button class="icon-btn" data-act="openMenu" aria-label="菜单">菜单</button>' +
    '</header>' +
    '<footer class="hud-bottom">' +
      '<button class="icon-btn" data-act="openJournal">笔记</button>' +
      '<button class="icon-btn" data-act="openInventory">随身物<span class="count">' + state.inv.length + '</span></button>' +
      '<div class="objective">' + esc(state.mode === 'play' ? objectiveText(state) : '点下面开始') + '</div>' +
      '<button class="icon-btn" data-act="openHint">提示</button>' +
    '</footer>'
  );
}

function titleScreen(state) {
  const saved = state.hasSave;
  return (
    '<div class="title-screen">' +
      '<div class="title-card">' +
        '<div class="eyebrow">云海上的学院 · 不考咒语</div>' +
        '<h1>星烛学院</h1>' +
        '<p class="subtitle">缄默夜</p>' +
        '<p class="blurb">一年级的林小烛被关在西翼。活楼梯停了。今夜，门只认想得通的顺序。</p>' +
        '<div class="title-actions">' +
          (saved
            ? '<button class="btn btn-primary" data-act="continueGame">继续未完的夜</button>' +
              '<button class="btn btn-ghost" data-act="askRestart">从头再走</button>'
            : '<button class="btn btn-primary" data-act="startNew">进入西翼</button>') +
          '<button class="btn btn-ghost" data-act="openHelp">怎么走</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function sheet(state) {
  const current = state.sheet;
  if (!current) return '';
  if (current.type === 'dialogue') return dialogue(state);
  if (current.type === 'ending') return ending(state);
  if (current.type === 'confirm') {
    return panel('重新开始？', '<p>这一夜的笔记、随身物和谜题进度都会清掉。</p>',
      '<button class="btn btn-primary" data-act="doRestart">清掉，从头走</button><button class="btn btn-ghost" data-act="closeSheet">再想想</button>',
      false);
  }
  const closable = current.type !== 'puzzle';
  let title = '';
  let body = '';
  let foot = '';
  if (current.type === 'read') {
    const copy = current.custom || COPY[current.key];
    title = copy.title;
    body = '<p>' + paras(copy.body) + '</p>';
    foot = '<button class="btn btn-primary" data-act="closeSheet">记下了</button>';
  } else if (current.type === 'help') {
    title = '怎么走';
    body = helpBody();
    foot = '<button class="btn btn-primary" data-act="closeSheet">知道了</button>';
  } else if (current.type === 'menu') {
    title = '菜单';
    body = menuBody(state);
    foot = '<button class="btn btn-ghost" data-act="closeSheet">回到夜里</button>';
  } else if (current.type === 'journal') {
    title = '笔记';
    body = journalBody(state);
    foot = '<button class="btn btn-ghost" data-act="closeSheet">合上</button>';
  } else if (current.type === 'inventory') {
    title = '随身物';
    body = inventoryBody(state);
    foot = '<button class="btn btn-ghost" data-act="closeSheet">收起</button>';
  } else if (current.type === 'hints') {
    title = '提示';
    body = hintBody(state, current.puzzle);
    foot = '<button class="btn btn-ghost" data-act="closeSheet">先自己想想</button>';
  } else if (current.type === 'slate') {
    title = '星盘石面';
    body = slateBody(state);
    foot = '<button class="btn btn-primary" data-act="openDial">去转动星盘</button><button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  } else if (current.type === 'puzzle') {
    const built = puzzle(state, current.puzzle);
    title = built.title;
    body = built.body;
    foot = built.foot;
  }
  return panel(title, body, foot, closable);
}

function panel(title, body, foot, backdropCloses) {
  const back = backdropCloses ? '<div class="sheet-back" data-act="closeSheet"></div>' : '<div class="sheet-back"></div>';
  return (
    '<div class="sheet-layer">' + back +
      '<section class="sheet" role="dialog">' +
        '<div class="sheet-handle"></div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<div class="sheet-body scroll">' + body + '</div>' +
        (foot ? '<div class="sheet-actions">' + foot + '</div>' : '') +
      '</section>' +
    '</div>'
  );
}

function dialogue(state) {
  const line = DIALOGUES[state.dialogue.id][state.dialogue.i];
  return (
    '<div class="sheet-layer">' +
      '<div class="sheet-back" data-act="dialogNext"></div>' +
      '<section class="dialogue-card" role="dialog" data-act="dialogNext">' +
        (line.who ? '<div class="who">' + esc(line.who) + '</div>' : '') +
        '<p>' + esc(line.text) + '</p>' +
        '<div class="dialog-actions">' +
          '<button class="btn btn-primary" data-act="dialogNext">下一句</button>' +
          '<button class="btn btn-ghost" data-act="dialogSkip">跳过</button>' +
        '</div>' +
      '</section>' +
    '</div>'
  );
}

function helpBody() {
  return (
    '<ul class="plain">' +
      '<li>点地面，小烛会寻路走过去。</li>' +
      '<li>点蜡烛、书、石板，她会先走到跟前，再打开。</li>' +
      '<li>读过的东西收在笔记里。材料在随身物里，有的能拼在一起。</li>' +
      '<li>每个谜题有三层提示。第三层会把答案说透，卡住时再用。</li>' +
      '<li>进度记在这台手机上。菜单里可以从头再走。</li>' +
    '</ul>'
  );
}

function menuBody(state) {
  return (
    '<p class="meta">这一夜走了 ' + clock(state.playMs) + ' · 提示用了 ' + hintsUsed(state) + ' 次</p>' +
    '<div class="menu-list">' +
      '<button class="btn btn-ghost" data-act="toggleSound">' + (soundOn() ? '关掉声音' : '打开声音') + '</button>' +
      '<button class="btn btn-ghost" data-act="openHelp">怎么走</button>' +
      (state.flags.ending ? '<button class="btn btn-ghost" data-act="showEndingCard">再看一遍结局</button>' : '') +
      '<button class="btn btn-ghost" data-act="askRestart">重新开始</button>' +
    '</div>'
  );
}

function journalBody(state) {
  if (!state.journal.length) return '<p>还没有记下什么。先去看看挂毯和青铜碑。</p>';
  const chunks = [];
  for (const tag of TAGS) {
    const items = state.journal.filter((entry) => entry.tag === tag);
    if (!items.length) continue;
    chunks.push('<h3>' + esc(tag) + '</h3>');
    for (const entry of items) {
      chunks.push('<article class="note-card"><h4>' + esc(entry.title) + '</h4><p>' + paras(entry.body) + '</p></article>');
    }
  }
  return chunks.join('');
}

function inventoryBody(state) {
  if (!state.inv.length) return '<p>身上还是空的。</p>';
  const canCraft = state.inv.includes('key_tooth') && state.inv.includes('key_handle');
  const slots = state.inv.map((id) => {
    const item = ITEMS[id];
    const on = state.selectedItem === id ? ' on' : '';
    return (
      '<button class="slot' + on + '" data-act="selectItem" data-id="' + esc(id) + '">' +
        '<strong>' + esc(item.name) + '</strong>' +
        '<span>' + esc(item.desc) + '</span>' +
      '</button>'
    );
  }).join('');
  return (
    (canCraft ? '<button class="btn btn-primary wide" data-act="combineKeys">拼合钥匙齿和钥匙柄</button>' : '') +
    (state.selectedItem === 'potion' ? '<button class="btn btn-primary wide" data-act="armItem" data-id="potion">使用澄星液</button>' : '') +
    (state.selectedItem && state.selectedItem !== 'potion' ? '<p class="meta">再点另一件，看它们能不能拼在一起。</p>' : '') +
    '<div class="inv-list">' + slots + '</div>'
  );
}

function hintBody(state, puzzle) {
  const list = HINTS[puzzle] || [];
  const seen = state.hints[puzzle] || 0;
  if (!list.length) return '<p>这一步没有更多提示。</p>';
  const shown = list.slice(0, seen).map((line, i) => '<p><b>第 ' + (i + 1) + ' 层。</b> ' + esc(line) + '</p>').join('');
  const more = seen < list.length
    ? '<button class="btn btn-primary wide" data-act="revealHint" data-puzzle="' + puzzle + '">看第 ' + (seen + 1) + ' 层提示</button>'
    : '<p class="meta">三层都看过了。</p>';
  return (shown || '<p>还没看提示。谜题本身是公平的，线索都在屋子里。</p>') + more;
}

function slateBody(state) {
  const lines = dialLines(state);
  const pour = !state.flags.inscription && state.inv.includes('potion')
    ? '<button class="btn btn-primary wide" data-act="pourPotion">把澄星液浇在隐去的那一行上</button>'
    : '';
  return '<div class="slate-lines">' + lines.map((line) => '<p>' + esc(line) + '</p>').join('') + '</div>' + pour;
}

function dialLines(state) {
  const lines = DIAL_CLUES_VISIBLE.slice();
  lines.push(state.flags.cipher_solved ? DIAL_CLUE_CIPHER : '（还有一句在书廊残页上，你还没读通。）');
  lines.push(state.flags.inscription ? DIAL_CLUE_POTION : '（石面下方有一行被隐去了。）');
  return lines;
}

function puzzle(state, id) {
  if (id === 'candles') return candlePuzzle(state);
  if (id === 'books') return bookPuzzle(state);
  if (id === 'cipher') return cipherPuzzle(state);
  if (id === 'potion') return potionPuzzle(state);
  return dialPuzzle(state);
}

function candlePuzzle(state) {
  const order = state.drafts.candles;
  const byId = Object.fromEntries(CANDLES.map((c) => [c.id, c]));
  const button = (id) => {
    const candle = byId[id];
    const used = order.includes(id) ? ' used' : '';
    return '<button class="candle-btn' + used + '" data-act="candleAdd" data-id="' + id + '">' +
      esc(candle.dir) + '<b>' + esc(id) + '</b></button>';
  };
  const body =
    '<p>按你认定的苏醒顺序点。点过的不能重复。北金对南银，西墨对东铜。</p>' +
    '<div class="candle-grid">' + button('金') + button('墨') + button('铜') + button('银') + '</div>' +
    '<p class="seq">顺序：' + (order.length ? esc(order.join(' → ')) : '还没点') + '</p>' +
    hintInline(state, 'candles');
  const foot =
    '<button class="btn btn-ghost" data-act="candleClear">重来</button>' +
    '<button class="btn btn-primary" data-act="candleSubmit">点亮</button>' +
    '<button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  return { title: '点烛', body, foot };
}

function bookPuzzle(state) {
  const notes = ['noteA', 'noteB', 'noteC', 'noteD'].filter((id) => state.flags['read_' + id]).length;
  const cards = BOOKS.map((book, index) => {
    const seen = state.flags['book_' + book.id];
    const options = ['<option value="">题目未定</option>'].concat(SUBJECTS.map((subject) => {
      const sel = state.drafts.books[index] === subject ? ' selected' : '';
      return '<option value="' + subject + '"' + sel + '>' + subject + '</option>';
    })).join('');
    const facts = seen
      ? book.colorName + '封面 · ' + book.emblem + '纹 · ' + book.clasps + ' 扣'
      : '还没走近看';
    return (
      '<article class="book-card" style="--cover:' + book.color + '">' +
        '<header><b>' + book.id + '</b><span>' + esc(facts) + '</span></header>' +
        '<select data-act="bookSet" data-i="' + index + '" aria-label="' + book.id + '的题目">' + options + '</select>' +
      '</article>'
    );
  }).join('');
  const body =
    '<p>从左到右是甲、乙、丙、丁。外表看得到，题目要推。笔记读了 ' + notes + ' / 4。</p>' +
    '<div class="book-list">' + cards + '</div>' +
    '<p class="meta">对上之后，讲阶咒的那一本会松开夹层。</p>' +
    hintInline(state, 'books');
  const foot =
    '<button class="btn btn-primary" data-act="bookSubmit">对上题目</button>' +
    '<button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  return { title: '对题台', body, foot };
}

function cipherPuzzle(state) {
  const alphabet = ALPHABET.map((ch, i) => '<span><i>' + i + '</i>' + esc(ch) + '</span>').join('');
  const cipher = cipherCiphertext().split('').join(' ');
  const options = ['羽', '月', '烛', '钟'];
  const selects = [0, 1, 2, 3].map((i) => {
    const opts = ['<option value="">第 ' + (i + 1) + ' 字</option>'].concat(options.map((ch) => {
      const sel = state.drafts.cipher[i] === ch ? ' selected' : '';
      return '<option value="' + ch + '"' + sel + '>' + ch + '</option>';
    })).join('');
    return '<select data-act="cipherSet" data-i="' + i + '" aria-label="钥匙第' + (i + 1) + '字">' + opts + '</select>';
  }).join('');
  const preview = state.cipherPreview ? '<p class="seq">读出来：' + esc(state.cipherPreview) + '</p>' : '';
  const body =
    '<p>把密文沿星律环往回退。钥匙是四支烛的别名，按苏醒顺序，四个字循环用。</p>' +
    '<div class="cipher-alpha">' + alphabet + '</div>' +
    '<p class="cipher-text">' + esc(cipher) + '</p>' +
    '<div class="key-row">' + selects + '</div>' +
    preview +
    '<p class="meta">例子：明文「端」配钥匙「月」，密文是「不」。别名写在彩窗上。</p>' +
    hintInline(state, 'cipher');
  const foot =
    '<button class="btn btn-primary" data-act="cipherSubmit">往回退</button>' +
    '<button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  return { title: '残页', body, foot };
}

function potionPuzzle(state) {
  const slots = [0, 1, 2].map((i) => {
    const id = state.drafts.potion[i];
    const name = id ? ITEMS[id].name : '空';
    return '<div class="slot-pill">' + (i + 1) + ' · ' + esc(name) + '</div>';
  }).join('');
  const owned = INGREDIENTS.filter((item) => state.inv.includes(item.id) && !state.drafts.potion.includes(item.id));
  const buttons = owned.length
    ? owned.map((item) => (
      '<button class="btn btn-ghost" data-act="potionAdd" data-id="' + item.id + '">' +
        esc(item.name) + ' · ' + item.heat +
      '</button>'
    )).join('')
    : '<p class="meta">架子上的材料要先拿起来。星烬在中庭壁炉里。</p>';
  const body =
    '<p>按放入的先后排三种。炼错了材料会还你，颜色会告诉你偏了哪里。</p>' +
    '<div class="slot-row">' + slots + '</div>' +
    '<div class="ing-list">' + buttons + '</div>' +
    hintInline(state, 'potion');
  const foot =
    '<button class="btn btn-ghost" data-act="potionClear">倒掉重来</button>' +
    '<button class="btn btn-primary" data-act="potionSubmit">炼</button>' +
    '<button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  return { title: '坩埚', body, foot };
}

function dialPuzzle(state) {
  const slots = state.drafts.dial.map((glyph, i) => (
    '<div class="slot-pill">' + (i + 1) + '<b>' + esc(glyph || '·') + '</b></div>'
  )).join('');
  const used = new Set(state.drafts.dial);
  const bank = DIAL_GLYPHS.map((glyph) => (
    '<button class="btn btn-ghost" data-act="dialAdd" data-glyph="' + glyph + '"' +
      (used.has(glyph) ? ' disabled' : '') + '>' + glyph + '</button>'
  )).join('');
  const lines = dialLines(state).map((line) => '<p>' + esc(line) + '</p>').join('');
  const body =
    '<div class="slate-lines">' + lines + '</div>' +
    '<div class="slot-row">' + slots + '</div>' +
    '<div class="ing-list">' + bank + '</div>' +
    hintInline(state, 'dial');
  const foot =
    '<button class="btn btn-ghost" data-act="dialClear">清空</button>' +
    '<button class="btn btn-primary" data-act="dialSubmit">转动</button>' +
    '<button class="btn btn-ghost" data-act="closeSheet">离开</button>';
  return { title: '归名星盘', body, foot };
}

function hintInline(state, puzzle) {
  const list = HINTS[puzzle] || [];
  const seen = state.hints[puzzle] || 0;
  const shown = list.slice(0, seen).map((line, i) => '<p class="hint-line"><b>提示 ' + (i + 1) + '.</b> ' + esc(line) + '</p>').join('');
  const button = seen < list.length
    ? '<button class="btn btn-ghost wide" data-act="revealHint" data-puzzle="' + puzzle + '">要一层提示（' + seen + '/3）</button>'
    : '';
  return '<div class="hint-box">' + shown + button + '</div>';
}

function ending(state) {
  const clean = hintsUsed(state) === 0;
  return (
    '<div class="sheet-layer">' +
      '<div class="sheet-back"></div>' +
      '<section class="ending-card" role="dialog">' +
        '<div class="eyebrow">归名</div>' +
        '<h2>钟 · 钥 · 烛 · 月 · 羽</h2>' +
        '<p>天光从云海的缝里漫上来。停住的楼梯轻轻响了一格，像很远的地方有人把一页书翻过去。</p>' +
        '<p>裴照微没有再说话。他今夜的真话已经用完，只是看着你。门开了，是因为你把顺序想通了。</p>' +
        '<p>面包香从下面的院子飘上来。缄默夜结束了。</p>' +
        '<p class="meta">走了 ' + clock(state.playMs) + ' · 提示 ' + hintsUsed(state) + ' 次' +
          (clean ? ' · 一次都没用，漂亮。' : '') + '</p>' +
        '<div class="sheet-actions">' +
          '<button class="btn btn-primary" data-act="closeSheet">在塔上站一会儿</button>' +
          '<button class="btn btn-ghost" data-act="askRestart">再走一遍</button>' +
        '</div>' +
      '</section>' +
    '</div>'
  );
}
