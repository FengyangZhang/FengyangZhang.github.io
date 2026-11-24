/**
 * 文案、谜题答案、物品。改谜题时请同时改 escape/test/logic.test.mjs 里的约束。
 * 房间布局在 rooms.js。
 */

export const ALPHABET = ['正', '中', '是', '烛', '或', '钟', '羽', '不', '邻', '端', '月', '钥'];

/** 中庭四烛在星钟塔上的别名，写在书廊彩窗上。 */
export const CANDLE_ALIAS = { 墨: '羽', 银: '月', 金: '烛', 铜: '钟' };

export const CANDLES = [
  { id: '金', dir: '北', x: 6, y: 3, metal: '#e4c27a', flame: '#ffd27a', rune: 'sun' },
  { id: '银', dir: '南', x: 6, y: 8, metal: '#d5d8e8', flame: '#f4f6ff', rune: 'moon' },
  { id: '墨', dir: '西', x: 2, y: 5, metal: '#8aa0c8', flame: '#c9d6ff', rune: 'ring' },
  { id: '铜', dir: '东', x: 9, y: 5, metal: '#c4844a', flame: '#ffb15a', rune: 'fork' },
];

/** 从左到右。x+y 相同，画在同一条水平线上。 */
export const BOOKS = [
  { id: '甲', x: 3, y: 6, color: '#6b4632', colorName: '褐', emblem: '日', rune: 'sun', clasps: 2 },
  { id: '乙', x: 4, y: 5, color: '#8c3048', colorName: '绛', emblem: '羽', rune: 'feather', clasps: 3 },
  { id: '丙', x: 5, y: 4, color: '#1d6a64', colorName: '青', emblem: '钥', rune: 'key', clasps: 4 },
  { id: '丁', x: 6, y: 3, color: '#e7e1d4', colorName: '白', emblem: '月', rune: 'moon', clasps: 1 },
];

export const SUBJECTS = ['史录', '星图', '阶咒', '药剂'];

export const INGREDIENTS = [
  { id: 'star_ash', name: '星烬', heat: -2, mineral: false, kind: '烬', where: 'brazier' },
  { id: 'moon_dew', name: '月露', heat: -1, mineral: false, kind: '露', x: 2, y: 2, tint: '#9fd7e8' },
  { id: 'candle_tear', name: '烛泪', heat: 1, mineral: false, kind: '燃', x: 4, y: 2, tint: '#f0c27a' },
  { id: 'feather_ash', name: '鸦羽灰', heat: 0, mineral: false, kind: '灰', x: 6, y: 2, tint: '#b7b3c9' },
  { id: 'copper_rust', name: '铜锈', heat: 2, mineral: true, kind: '矿', x: 8, y: 2, tint: '#6fbf8a' },
  { id: 'honey_crystal', name: '蜜晶', heat: -1, mineral: true, kind: '矿', x: 3, y: 8, tint: '#e6b15a' },
  { id: 'salt_bloom', name: '盐花', heat: 3, mineral: true, kind: '矿', x: 8, y: 8, tint: '#f4f1ea' },
];

export const DIAL_GLYPHS = ['月', '烛', '羽', '钥', '钟'];

export const SOLUTIONS = {
  candles: ['墨', '银', '金', '铜'],
  books: ['史录', '星图', '阶咒', '药剂'],
  /** 由蜡烛顺序经别名得到，测试会再算一遍。 */
  cipherKey: ['羽', '月', '烛', '钟'],
  cipherPlain: '正中是烛或是钟',
  potion: ['star_ash', 'feather_ash', 'copper_rust'],
  dial: ['钟', '钥', '烛', '月', '羽'],
};

export const ITEMS = {
  key_tooth: {
    name: '钥匙齿',
    desc: '半枚铜钥匙的齿，边上刻着细细的阶纹。',
    rune: 'fork',
  },
  key_handle: {
    name: '钥匙柄',
    desc: '从书壳夹层里滑出来的铜柄，还缺一截齿。',
    rune: 'key',
  },
  copper_key: {
    name: '铜钥',
    desc: '齿与柄严丝合缝。书廊北门认的就是它。',
    rune: 'key',
  },
  star_ash: {
    name: '星烬',
    desc: '壁炉里落下的一点冷光。冷热值 −2，不是矿物。',
    rune: 'sun',
  },
  moon_dew: {
    name: '月露',
    desc: '瓶子里一汪夜色。冷热值 −1，不是矿物。',
    rune: 'moon',
  },
  candle_tear: {
    name: '烛泪',
    desc: '凝固的烛油，还带着一点暖意。冷热值 +1，不是矿物。',
    rune: 'flame',
  },
  feather_ash: {
    name: '鸦羽灰',
    desc: '轻，几乎没有冷热。冷热值 0，不是矿物。',
    rune: 'feather',
  },
  copper_rust: {
    name: '铜锈',
    desc: '青绿的一层锈。冷热值 +2，是矿物。澄星液的青色靠它。',
    rune: 'fork',
  },
  honey_crystal: {
    name: '蜜晶',
    desc: '甜味的晶体。冷热值 −1，是矿物。单独会把药剂炼成金色。',
    rune: 'sun',
  },
  salt_bloom: {
    name: '盐花',
    desc: '白花花的盐。冷热值 +3，是矿物。会让星光沉底。',
    rune: 'ring',
  },
  potion: {
    name: '澄星液',
    desc: '浅青色。轻轻一摇，里面有碎星打转。浇在被隐去的字上。',
    rune: 'moon',
  },
};

export const RECIPES = [
  {
    needs: ['key_tooth', 'key_handle'],
    result: 'copper_key',
    text: '齿与柄咬合，发出一声很轻的咔哒。',
  },
];

export const HINTS = {
  candles: [
    '先别猜。北金对南银，西墨对东铜。最先醒的和最后醒的，必须是面对面的一对。',
    '「银的下一支一定是金」会把银、金粘成一块。这块放在开头或结尾，都会和「最先最后面对面」打架。只剩一种放法。再用来删掉墨和铜谁先谁后。',
    '顺序是：墨、银、金、铜。墨最先，铜最后，它们正好东西相对，而且中间隔着银和金。',
  ],
  books: [
    '封面、纹样、搭扣都能看见，题目看不见。先把四本书的外表记全，再读笔记。',
    '白封面讲药剂，所以丁的题目可以先定下来。剩下三本里，星图紧挨在史录右边，搭扣正好多一枚。阶咒要比星图再多一枚。搭扣是 2、3、4、1，能对上的只有一种。',
    '甲是史录，乙是星图，丙是阶咒，丁是药剂。钥匙柄在丙的夹层里。',
  ],
  cipher: [
    '这不是打乱重排。星律环的顺序是固定的，密文是明文沿着环往前走得到的。解密就沿着环往回退。',
    '彩窗上写着四支烛的别名。把你在中庭点亮的顺序，换成别名，四个字循环着用。讲台上的例子：明文「端」配钥匙「月」，密文是「不」。',
    '别名按苏醒顺序是羽、月、烛、钟。逐字退回之后，那句话是：正中是烛或是钟。',
  ],
  potion: [
    '先划掉盐花。要青色就必须有铜锈；矿物至多一种，所以蜜晶不能一起进去。铜锈是矿物，不能放在第二种。',
    '铜锈的冷热是 +2，另外两味加起来要等于 −2，而且第一种自己必须是负的。非矿物只有星烬、月露、烛泪、鸦羽灰。把两两的和算出来。',
    '顺序是：星烬、鸦羽灰、铜锈。星烬在烛火中庭的壁炉里，冷热值 −2。',
  ],
  dial: [
    '五枚符文各用一次。先只用石板上看得见的三句，把不可能的排列划掉。划完还会剩下几种，这是正常的。',
    '书廊残页负责规定正中间是谁，澄星液显出的那句负责把羽和钥分开。两句缺一句，答案就不是唯一的。',
    '从左到右：钟、钥、烛、月、羽。',
  ],
  key: [
    '铜钥不是捡来的整把。一截在中庭，一截在书里。',
    '柄藏在讲阶咒的那本书的夹层里。齿在中庭南栏附近，一块裂开的地砖下面。',
    '打开随身物，点一下钥匙齿，再点钥匙柄，它们会咬合成铜钥。',
  ],
  seek: [
    '不用数数。看见露出来的小角角，就点那一块。',
    '毯子上有耳朵，窗帘后有小嘴，床底下有轮子，箱子边有绿尾巴，书架上有一顶帽子。',
    '五个地方都点一下：毯子、玩具箱、窗帘、小床、图画书架。',
  ],
  colors: [
    '先点彩球，再点同样颜色的篮子。',
    '红球进红篮子，蓝球进蓝篮子，黄和绿也一样。',
    '四个球都放进同色的篮子，再点放好了。',
  ],
  shapes: [
    '先点积木，再点同样形状的洞。',
    '圆的找圆洞，方的找方洞，三角找三角，星星找星星。',
    '四个都放对，盒子就会打开。',
  ],
};

export const OBJECTIVES = [
  {
    id: 'candles',
    puzzle: 'candles',
    text: '弄清中庭四支烛的苏醒顺序',
    done: (s) => !!s.flags.candle_solved,
  },
  {
    id: 'books',
    puzzle: 'books',
    text: '在书廊把四本书的题目对上',
    done: (s) => !!s.flags.books_solved,
  },
  {
    id: 'key',
    puzzle: null,
    text: (s) =>
      s.inv.includes('key_handle') && !s.inv.includes('key_tooth') && !s.inv.includes('copper_key')
        ? '回中庭，撬开南侧那块裂砖'
        : '把钥匙齿和钥匙柄拼成铜钥',
    done: (s) => s.inv.includes('copper_key'),
  },
  {
    id: 'cipher',
    puzzle: 'cipher',
    text: '用烛序读出残页上的那句话',
    done: (s) => !!s.flags.cipher_solved,
  },
  {
    id: 'potion',
    puzzle: 'potion',
    text: '在回廊炼出青色的澄星液',
    done: (s) => s.inv.includes('potion') || !!s.flags.inscription,
  },
  {
    id: 'inscription',
    puzzle: 'dial',
    text: '让星钟塔石面上隐去的那一行显形',
    done: (s) => !!s.flags.inscription,
  },
  {
    id: 'dial',
    puzzle: 'dial',
    text: '把归名星盘转到唯一的顺序',
    done: (s) => !!s.flags.ending,
  },
];

export const DIALOGUES = {
  intro: [
    { who: '裴照微', text: '小烛，别敲了。今夜的门不认拳头。' },
    { who: '林小烛', text: '裴先生？活楼梯停在半空，南边也锁上了。' },
    { who: '裴照微', text: '这是缄默夜。西翼不考咒语，只考你能不能把顺序想通。' },
    { who: '裴照微', text: '我这幅画只能再说三次真话。第一句：中庭四支烛有苏醒的次序。次序对了，东门才认你。' },
    { who: '林小烛', text: '那我去看挂毯和石碑。' },
  ],
  portrait2: [
    { who: '裴照微', text: '第二句真话：东门认了次序之后，壁炉里会落下星烬。后面炼药用得着，别把它当成普通的灰。' },
  ],
  portrait3: [
    { who: '裴照微', text: '第三句，也是最后一句：慢没有关系。我年轻的时候，也在这四支烛前面站到天快亮。' },
    { who: '裴照微', text: '真话用完了。剩下的路，挂毯和石板比我会说话。' },
  ],
  portraitSleep: [
    { who: '裴照微', text: '画里的人闭上了眼。他今夜能说的都说完了。' },
  ],
  portraitRemind: [
    { who: '裴照微', text: '规矩都在青铜碑上。我把第一句真话留在那儿了，不再重复。' },
  ],
  librarian: [
    { who: '简疏桐', text: '我这幅画只教方法，不给答案。星律环上，加密是往前走，解密是往回退。' },
    { who: '简疏桐', text: '钥匙有四个字，按顺序循环着用。例子你记一下：明文「端」，钥匙「月」，密文是「不」。' },
    { who: '林小烛', text: '四个字从哪儿来？' },
    { who: '简疏桐', text: '从你已经走过的那条顺序来。彩窗上有别名。我不能再说了。' },
  ],
  nurseryIntro: [
    { who: '林小烛', text: '地板突然变软了。这是我家的小房间，可我已经不是那个会摔倒的身高。' },
    { who: '小小烛', text: '呜……玩具都不见了。绒绒、帽帽、木木，全躲起来了。' },
    { who: '发条', text: '嘘。大人不看的时候，我们才会动。她哭是因为找不到我们。你帮她找一找？' },
  ],
  found_blanket: [
    { who: '绒绒', text: '毯子好暖，我只是打了个盹。我在这儿！' },
  ],
  found_chest: [
    { who: '咚咚', text: '箱子盖一合，世界就黑了。谢谢你把我放出来。' },
  ],
  found_curtain: [
    { who: '嘎嘎', text: '窗帘后面亮亮的。我以为那是池塘。' },
  ],
  found_crib: [
    { who: '木木', text: '轮子卡在床底下了。你一拉，我又能滚。' },
  ],
  found_shelf: [
    { who: '帽帽', text: '我坐在图画书上面，看了她好久。帽子都歪了。' },
  ],
  toysReady: [
    { who: '绒绒', text: '五个都找到啦。她不哭了，可彩球还混在一起。' },
    { who: '林小烛', text: '红的跟红的，蓝的跟蓝的。两岁的时候，这就够当一场大游戏。' },
  ],
  colorsClear: [
    { who: '帽帽', text: '篮子都对上颜色了。形状盒还关着，它要圆的、方的、三角，还有星星。' },
  ],
  candleGet: [
    { who: '小小烛', text: '呀！盒子里有一根小蜡烛。亮亮的。' },
    { who: '林小烛', text: '第一支生日蜡烛。两岁的你把它找回来了。还有四支，在以后的下午里。' },
    { who: '发条', text: '南边那扇门现在肯开一条缝。不过那是更大的房间，不急。' },
  ],
  momSeek: [
    { who: '妈妈', text: '妈妈在门口听着呢。先把躲起来的玩具一个一个找出来，她就会笑。' },
    { who: '爸爸', text: '爸爸也在。看见耳朵、轮子、帽子就点一下，不用想那么多。' },
  ],
  momColors: [
    { who: '妈妈', text: '彩球不用数。看颜色就好：红球进红篮子。' },
    { who: '爸爸', text: '点一下球，再点同样颜色的篮子。' },
  ],
  momShapes: [
    { who: '妈妈', text: '形状盒认样子，不认名字。圆的找圆洞，星星找星星洞。' },
    { who: '爸爸', text: '放对了，盒子里有一件亮亮的东西。' },
  ],
  dinoTalk: [
    { who: '咚咚', text: '箱子里黑黑的，可是很好玩。绿尾巴是不是露在外面了？' },
  ],
  duckTalk: [
    { who: '嘎嘎', text: '窗帘后面亮亮的。我把嘴巴伸出去，以为那是池塘。' },
  ],
  robotTalk: [
    { who: '发条', text: '我一上发条就会走路，可钥匙在她的小手里。你先找朋友吧。' },
  ],
  bunnyTalk: [
    { who: '绒绒', text: '我的耳朵会露出来。看见耳朵，就是我。' },
  ],
  dollTalk: [
    { who: '帽帽', text: '帽子是我的。谁戴着帽子坐在高处，谁就是我。' },
  ],
  horseTalk: [
    { who: '木木', text: '我有四个轮子。轮子喜欢躲在矮的地方。' },
  ],
  toddlerTalk: [
    { who: '小小烛', text: '你是大的我吗？帮我找玩具。找到了我们再玩。' },
  ],
  ending: [
    { who: '裴照微', text: '星盘转过去了。你听，楼梯自己响了一格。' },
    { who: '林小烛', text: '没有光，也没有声音大的咒语。门就这么开了。' },
    { who: '裴照微', text: '归名不是纪衡的名字。他把锁做成顺序，就是怕后来的人只会背。' },
    { who: '', text: '云海的缝里漫上鱼肚白。面包香从下面的院子飘上来。缄默夜结束了。' },
  ],
};

export const COPY = {
  tapestry: {
    title: '星烛挂毯',
    tag: '线索',
    body:
      '北墙这一侧是金烛，正对着南栏旁边的银烛。西边是墨烛，正对着东边的铜烛。\n\n符文你不用背：圆日一点是金，新月是银，方环是墨，三叉是铜。点烛的时候，石碑上的规矩比符文更要紧。',
  },
  plaque: {
    title: '青铜碑',
    tag: '线索',
    body:
      '四支烛不会一起醒。\n\n一、最先醒的与最后醒的，在地上正对而立。\n二、墨烛比铜烛早，而且这两支不是紧挨着醒的。\n三、银烛醒来之后，下一支一定是金烛。\n四、铜烛不在第二个醒来。\n\n想清楚了，就站到厅心的星形砖上，按次序点亮它们。',
  },
  crane: {
    title: '纸鹤',
    tag: '闲话',
    body: '纸鹤用翅膀碰了碰你的耳朵，像在说：顺序是一种礼貌。魔力最讨厌被人插队。',
  },
  brick: {
    title: '裂开的地砖',
    tag: '线索',
    body: '南栏旁边这块砖是松的。砖缝里卡着半枚铜钥匙的齿，边缘刻着细细的阶纹。',
  },
  brickEmpty: {
    title: '裂开的地砖',
    tag: '线索',
    body: '砖下已经空了，只剩一点铜绿。',
  },
  brazierBefore: {
    title: '壁炉',
    tag: '线索',
    body: '炉火压得很低。灰是冷的，里面还没有那一点星光。东门没开的时候，壁炉什么也不给。',
  },
  brazierAsh: {
    title: '壁炉',
    tag: '线索',
    body: '次序点对之后，灰里多了一点不烫手的光。你把它拢进瓶子。这是星烬。',
  },
  brazierEmpty: {
    title: '壁炉',
    tag: '线索',
    body: '只剩普通的灰。星烬已经在你身上。',
  },
  starTile: {
    title: '星形地砖',
    tag: '线索',
    body: '厅心的砖上刻着四支烛的方位。站在这里，可以按你认定的次序把它们点亮。',
  },
  southDoor: {
    title: '南边的门',
    tag: '记事',
    body: '你进来的那扇门已经自己合上。门缝里没有光。裴先生说得对，今夜它不认拳头。',
  },
  glass: {
    title: '彩窗上的星律环',
    tag: '线索',
    body:
      '环上的字从 0 排到 11：正、中、是、烛、或、钟、羽、不、邻、端、月、钥。\n\n窗棂旁边还有一行小字，是中庭四烛在塔上的别名：墨叫羽，银叫月，金叫烛，铜叫钟。\n\n残页上的密文，要用这条环来退。',
  },
  noteA: {
    title: '窗台笔记',
    tag: '线索',
    body: '白封面的书在讲药剂。褐封面的那本，不讲星图。',
  },
  noteB: {
    title: '阅览台笔记',
    tag: '线索',
    body: '讲星图的书，紧挨在史录的右边。左右按甲、乙、丙、丁的顺序，甲在最左。',
  },
  noteC: {
    title: '地上的散页',
    tag: '线索',
    body: '史录的搭扣，比星图少一枚。阶咒的搭扣，比星图多一枚。',
  },
  noteD: {
    title: '书架夹页',
    tag: '线索',
    body: '四本书从左到右是甲、乙、丙、丁。纹样和搭扣都在封面上，书脊上的题目被人撕了。对题台在南边。',
  },
  bookLook: {
    title: '书',
    tag: '线索',
    body: '',
  },
  cipherHelp: {
    title: '残页讲台',
    tag: '线索',
    body:
      '密文的每一个字，是明文在星律环上往前走了「钥匙上对应那一格」那么远。钥匙四个字，用完从头再用。读的时候往回退。\n\n简疏桐给的例子：明文「端」，钥匙「月」，密文是「不」。\n\n钥匙是四支烛的别名，按它们苏醒的顺序连起来。',
  },
  tabletA: {
    title: '石板 · 规矩',
    tag: '配方',
    body:
      '澄星液只收三种材料，放入的先后就是炼成的先后。\n\n盐花会让星光沉底，不能用。\n矿物至多一种。矿物是：铜锈、蜜晶、盐花。\n鸦羽灰碰上蜜晶会结成膜，不能喝。',
  },
  tabletB: {
    title: '石板 · 冷热与颜色',
    tag: '配方',
    body:
      '三种材料的冷热值加起来要等于 0。\n第一种的冷热值必须是负的。\n第二种不能是矿物。\n\n成品要是青色。含铜锈才青，含蜜晶是金色，没有矿物就是白色。',
  },
  heatChart: {
    title: '冷热表',
    tag: '配方',
    body:
      '星烬 −2（烬，不是矿物）\n月露 −1（露，不是矿物）\n烛泪 +1（燃，不是矿物）\n鸦羽灰 0（灰，不是矿物）\n铜锈 +2（矿）\n蜜晶 −1（矿）\n盐花 +3（矿）\n\n星烬不在这间屋子的架子上。它只在烛火中庭的壁炉里出现。',
  },
  slateVisible: {
    title: '星盘石面',
    tag: '星盘',
    body:
      '归名五字，各不相同，从左到右置入星盘。符文是：月、烛、羽、钥、钟。\n\n看得见的规矩：\n一、月不在两端。\n二、烛在羽的左边，并且中间正好隔着一位。\n三、钥在钟的右边。\n\n石面下方还有一行被隐去的字。字迹的凹槽还在，只是没有颜色。',
  },
  slateHidden: {
    title: '显出来的一行',
    tag: '星盘',
    body: '澄星液顺着凹槽走了一遍，浅青色停住，写成：羽不与钥相邻。',
  },
  founder: {
    title: '塔心的小牌',
    tag: '闲话',
    body: '创始人纪衡。牌的背面只有一句：别把我的名字当成钥匙。',
  },
};

export const DIAL_CLUES_VISIBLE = [
  '五枚符文各用一次：月、烛、羽、钥、钟。',
  '月不在两端。',
  '烛在羽的左边，并且中间正好隔着一位。',
  '钥在钟的右边。',
];

export const DIAL_CLUE_CIPHER = '正中是烛，或是钟。';
export const DIAL_CLUE_POTION = '羽不与钥相邻。';

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}
