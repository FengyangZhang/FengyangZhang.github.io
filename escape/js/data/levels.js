/** Five birthdays, one candle each. Only age 2 is playable for now. */

export const CANDLE_TOTAL = 5;

export const LEVELS = [
  {
    id: 'age2',
    age: 2,
    title: '两岁',
    subtitle: '玩具醒着的下午',
    room: 'nursery',
    candle: 'candle_2',
    implemented: true,
  },
  {
    id: 'age4',
    age: 4,
    title: '四岁',
    subtitle: '还没到的下午',
    room: null,
    candle: 'candle_4',
    implemented: false,
  },
  {
    id: 'age8',
    age: 8,
    title: '八岁',
    subtitle: '还没到的下午',
    room: null,
    candle: 'candle_8',
    implemented: false,
  },
  {
    id: 'age16',
    age: 16,
    title: '十六岁',
    subtitle: '还没到的下午',
    room: null,
    candle: 'candle_16',
    implemented: false,
  },
  {
    id: 'age32',
    age: 32,
    title: '三十二岁',
    subtitle: '今天',
    room: null,
    candle: 'candle_32',
    implemented: false,
  },
];

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) || LEVELS[0];
}

export function candleCount(candles) {
  return Array.isArray(candles) ? candles.length : 0;
}
