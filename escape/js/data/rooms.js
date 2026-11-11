/**
 * 房间地图与物件。
 * 地图字符：
 *   # 高墙（不可走）
 *   = 矮栏（不可走）
 *   . 地面
 *   + 门洞（上锁时不可走，打开后可走，踩上去会换房间）
 * 北 / 里侧是 y 小的一侧，南 / 近侧是 y 大的一侧，西是 x 小，东是 x 大。
 * 改完布局跑一次 node --test escape/test/logic.test.mjs，它会检查能不能走到每个物件。
 *
 * 加一个会说话的人：type 用 'npc'，look 用 js/render/character.js 里的名字
 * （或直接写一份 look），facing 用 se / sw / ne / nw，block 设 true，
 * action 继续用 dialogue 或 read。不同场景换 theme 和道具即可，不必改渲染器。
 */

import { BOOKS, CANDLES, INGREDIENTS } from './world.js';

const ATRIUM = [
  '############',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........+',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#===========',
];

const LIBRARY = [
  '######+#####',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '+..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#===========',
];

const CLOISTER = [
  '############',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........+',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#=====+=====',
];

const TOWER = [
  '##========##',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '+..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '#..........=',
  '##========##',
];

function shelfProps() {
  return INGREDIENTS.filter((item) => item.x != null).map((item) => ({
    id: 'shelf-' + item.id,
    type: 'bottle',
    name: item.name,
    x: item.x,
    y: item.y,
    block: true,
    tint: item.tint,
    action: 'pickup',
    item: item.id,
    hit: 0.85,
  }));
}

function bookProps() {
  return BOOKS.map((book) => ({
    id: 'book-' + book.id,
    type: 'book',
    name: book.id + '册',
    x: book.x,
    y: book.y,
    block: true,
    book: book.id,
    pick: 3,
    hit: 0.75,
    action: 'inspectBook',
  }));
}

export const ROOMS = {
  atrium: {
    id: 'atrium',
    name: '烛火中庭',
    subtitle: '西翼 · 第一扇门',
    map: ATRIUM,
    spawn: { x: 6, y: 9 },
    theme: {
      floorA: '#3c342c',
      floorB: '#342e28',
      floorC: '#463c32',
      wall: '#5c5146',
      wallDark: '#3a332c',
      wallTop: '#7a6c5c',
      lip: '#2a241e',
      skyTop: '#0c1022',
      skyMid: '#1a1830',
      skyBot: '#2a241c',
      darkness: 0.58,
      cloud: 'rgba(180, 170, 200, 0.18)',
    },
    lights: [
      ...CANDLES.map((c) => ({ x: c.x + 0.5, y: c.y + 0.5, color: c.flame, radius: 150, phase: c.x })),
      { x: 4.5, y: 5.2, color: '#ffb15a', radius: 120, phase: 1.2 },
    ],
    exits: [
      {
        id: 'east',
        x: 11,
        y: 6,
        to: 'library',
        spawn: { x: 1, y: 6 },
        needFlag: 'candle_solved',
        lock: 'candleDoor',
      },
    ],
    props: [
      { id: 'tapestry', type: 'banner', name: '星烛挂毯', x: 2, y: 1, block: true, action: 'read', read: 'tapestry', hit: 0.9 },
      { id: 'portrait', type: 'portrait', name: '裴照微', x: 5, y: 1, block: true, action: 'portrait', who: 'old', hit: 0.95 },
      { id: 'plaque', type: 'plaque', name: '青铜碑', x: 8, y: 1, block: true, action: 'read', read: 'plaque', hit: 0.9 },
      ...CANDLES.map((c) => ({
        id: 'candle-' + c.id,
        type: 'candle',
        name: c.dir + ' · ' + c.id + '烛',
        x: c.x,
        y: c.y,
        block: true,
        candle: c.id,
        hit: 0.8,
        action: 'readCandle',
      })),
      { id: 'brazier', type: 'brazier', name: '壁炉', x: 4, y: 5, block: true, action: 'brazier', hit: 0.9 },
      { id: 'stairs', type: 'stairs', name: '停住的楼梯', x: 3, y: 7, w: 2, h: 1, block: true, action: 'stairs', hit: 1.1 },
      { id: 'crane', type: 'crane', name: '纸鹤', x: 9, y: 3, block: false, action: 'read', read: 'crane', hit: 0.7 },
      { id: 'star', type: 'star', name: '星形地砖', x: 6, y: 6, block: false, action: 'candles', hit: 0.7 },
      { id: 'brick', type: 'brick', name: '裂开的地砖', x: 8, y: 9, block: false, action: 'brick', hit: 0.7 },
      { id: 'south-door', type: 'door', name: '南门', x: 6, y: 10, block: false, action: 'read', read: 'southDoor', hit: 0.8 },
      { id: 'east-door', type: 'door', name: '东门', x: 11, y: 6, block: false, action: 'door', exit: 'east', hit: 0.9 },
    ],
  },

  library: {
    id: 'library',
    name: '回响书廊',
    subtitle: '西翼 · 第二扇门',
    map: LIBRARY,
    spawn: { x: 1, y: 6 },
    theme: {
      floorA: '#2c2830',
      floorB: '#26222c',
      floorC: '#3a3344',
      wall: '#4a4058',
      wallDark: '#2e2838',
      wallTop: '#6a5e78',
      lip: '#221e28',
      skyTop: '#101426',
      skyMid: '#1c1830',
      skyBot: '#241e2a',
      darkness: 0.5,
      cloud: 'rgba(160, 170, 210, 0.16)',
    },
    lights: [
      { x: 4.2, y: 4.6, color: '#f0d7a2', radius: 170, phase: 0.4 },
      { x: 8.5, y: 8.5, color: '#9fd0ff', radius: 130, phase: 2.1 },
      { x: 9.2, y: 1.6, color: '#7ec8c3', radius: 110, phase: 1.4 },
    ],
    exits: [
      { id: 'west', x: 0, y: 6, to: 'atrium', spawn: { x: 10, y: 6 } },
      {
        id: 'north',
        x: 6,
        y: 0,
        to: 'cloister',
        spawn: { x: 6, y: 10 },
        needItem: 'copper_key',
        lock: 'libraryDoor',
      },
    ],
    props: [
      { id: 'librarian', type: 'portrait', name: '简疏桐', x: 2, y: 1, block: true, action: 'librarian', who: 'young', hit: 0.95 },
      { id: 'glass', type: 'window', name: '彩窗', x: 9, y: 1, block: true, action: 'read', read: 'glass', hit: 0.9 },
      { id: 'shelf-w', type: 'bookshelf', name: '书架', x: 1, y: 3, w: 1, h: 2, block: true, action: 'shelfFlavor', hit: 1 },
      { id: 'shelf-e', type: 'bookshelf', name: '书架', x: 10, y: 3, w: 1, h: 2, block: true, action: 'read', read: 'noteD', hit: 1 },
      ...bookProps(),
      { id: 'note-a', type: 'note', name: '窗台笔记', x: 8, y: 2, block: false, action: 'read', read: 'noteA', hit: 0.65 },
      { id: 'note-b', type: 'note', name: '阅览台笔记', x: 2, y: 5, block: false, action: 'read', read: 'noteB', hit: 0.65 },
      { id: 'note-c', type: 'note', name: '散页', x: 8, y: 7, block: false, action: 'read', read: 'noteC', hit: 0.65 },
      { id: 'lectern-books', type: 'lectern', name: '对题台', x: 3, y: 9, block: true, action: 'books', hit: 0.9 },
      { id: 'lectern-cipher', type: 'lectern', name: '残页讲台', x: 8, y: 9, block: true, action: 'cipher', tint: '#9ecbff', hit: 0.9 },
      { id: 'west-door', type: 'door', name: '回中庭', x: 0, y: 6, block: false, action: 'door', exit: 'west', hit: 0.9 },
      { id: 'north-door', type: 'door', name: '北门', x: 6, y: 0, block: false, action: 'door', exit: 'north', hit: 0.9 },
    ],
  },

  cloister: {
    id: 'cloister',
    name: '药剂回廊',
    subtitle: '西翼 · 第三扇门',
    map: CLOISTER,
    spawn: { x: 6, y: 10 },
    theme: {
      floorA: '#24302c',
      floorB: '#1e2a28',
      floorC: '#31443c',
      wall: '#3e564c',
      wallDark: '#24342e',
      wallTop: '#5e7a6c',
      lip: '#1a2420',
      skyTop: '#0e1418',
      skyMid: '#152028',
      skyBot: '#1c2824',
      darkness: 0.52,
      cloud: 'rgba(140, 180, 170, 0.16)',
    },
    lights: [
      { x: 5.5, y: 5.5, color: '#9be7c4', radius: 160, phase: 0.6 },
      { x: 2.5, y: 4.2, color: '#f0d7a2', radius: 100, phase: 1.7 },
      { x: 8.5, y: 8.2, color: '#f0d7a2', radius: 90, phase: 2.4 },
    ],
    exits: [
      { id: 'south', x: 6, y: 11, to: 'library', spawn: { x: 6, y: 1 } },
      { id: 'east', x: 11, y: 6, to: 'tower', spawn: { x: 1, y: 5 } },
    ],
    props: [
      ...shelfProps(),
      { id: 'tablet-a', type: 'tablet', name: '规矩石板', x: 2, y: 4, block: true, action: 'read', read: 'tabletA', hit: 0.85 },
      { id: 'tablet-b', type: 'tablet', name: '冷热石板', x: 9, y: 4, block: true, action: 'read', read: 'tabletB', hit: 0.85 },
      { id: 'chart', type: 'chart', name: '冷热表', x: 2, y: 9, block: true, action: 'read', read: 'heatChart', hit: 0.85 },
      { id: 'cauldron', type: 'cauldron', name: '坩埚', x: 5, y: 5, block: true, action: 'potion', hit: 1 },
      { id: 'south-door', type: 'door', name: '回书廊', x: 6, y: 11, block: false, action: 'door', exit: 'south', hit: 0.9 },
      { id: 'east-door', type: 'door', name: '去星钟塔', x: 11, y: 6, block: false, action: 'door', exit: 'east', hit: 0.9 },
    ],
  },

  tower: {
    id: 'tower',
    name: '星钟塔',
    subtitle: '西翼 · 最后一扇门',
    map: TOWER,
    spawn: { x: 1, y: 5 },
    theme: {
      floorA: '#343848',
      floorB: '#2c3140',
      floorC: '#454a60',
      wall: '#596078',
      wallDark: '#343848',
      wallTop: '#8088a4',
      lip: '#222636',
      skyTop: '#070a16',
      skyMid: '#14182c',
      skyBot: '#243044',
      darkness: 0.38,
      cloud: 'rgba(200, 206, 230, 0.2)',
    },
    lights: [
      { x: 6.5, y: 4.4, color: '#d7e4ff', radius: 200, phase: 0.2 },
      { x: 3.5, y: 2.4, color: '#f0d7a2', radius: 90, phase: 1.1 },
      { x: 8.5, y: 2.4, color: '#f0d7a2', radius: 90, phase: 2.2 },
    ],
    exits: [
      { id: 'west', x: 0, y: 5, to: 'cloister', spawn: { x: 10, y: 6 } },
    ],
    props: [
      { id: 'bell-a', type: 'bell', name: '钟', x: 3, y: 2, block: false, action: 'bell', hit: 0.7 },
      { id: 'bell-b', type: 'bell', name: '钟', x: 8, y: 2, block: false, action: 'bell', hit: 0.7 },
      { id: 'bell-c', type: 'bell', name: '钟', x: 4, y: 7, block: false, action: 'bell', hit: 0.7 },
      { id: 'slate', type: 'tablet', name: '星盘石面', x: 6, y: 2, block: true, action: 'slate', hit: 0.9 },
      { id: 'dial', type: 'dial', name: '归名星盘', x: 6, y: 4, block: true, action: 'dial', hit: 1 },
      { id: 'founder', type: 'plaque', name: '纪衡的小牌', x: 9, y: 3, block: true, action: 'read', read: 'founder', hit: 0.8 },
      { id: 'west-door', type: 'door', name: '回回廊', x: 0, y: 5, block: false, action: 'door', exit: 'west', hit: 0.9 },
    ],
  },
};

export const ROOM_ORDER = ['atrium', 'library', 'cloister', 'tower'];

export function roomById(id) {
  return ROOMS[id];
}
