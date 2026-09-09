export interface WordEntry {
  /** The word itself, UPPERCASE, 3-5 letters. */
  word: string;
  /** A single emoji that unambiguously depicts the word. */
  emoji: string;
  /**
   * Phonetic rime key (vowel nucleus + coda), lowercase ASCII approximation.
   * Two words rhyme if and only if their rime strings are exactly equal, so
   * this deliberately ignores spelling: PLANE and RAIN share "ain", while
   * GOAT ("oat") does not rhyme with CAT ("at").
   */
  rime: string;
  /**
   * True when a 5-7 year old can sound the word out from regular,
   * predictable letter-sound correspondences. False when the word has to be
   * recognised whole (EIGHT, KEY, BEAR). Kept deliberately conservative.
   */
  decodable: boolean;
  /**
   * Whether the emoji alone identifies the word. Defaults to true when absent.
   *
   * False for words whose emoji depicts a property or symbol rather than a
   * nameable thing. Two groups fail here, for different reasons:
   *
   * - Colour words (RED, BLACK, ...) are coloured squares. The one feature
   *   that distinguishes them is colour, which is exactly what a black-and-
   *   white printout destroys - RED, BLACK and WHITE all print as similar
   *   grey squares.
   * - Number words (ONE, TWO, ...) are numeral keycaps, which a child can
   *   read straight off without decoding the written word at all.
   *
   * Both are still perfectly good in Word Search (where the emoji is only
   * decoration beside a printed word) and in Handwriting (where the word is
   * printed too). They break only where the emoji is the sole clue.
   */
  pictureClue?: boolean;
}

/**
 * A word as a puzzle actually uses it: either a curated `WORD_LIST` entry, or
 * one a parent typed into a custom-words field, whose rime and decodability we
 * have no way to know.
 *
 * Consumers filtering on these fields must treat `undefined` as "unknown, and
 * therefore allowed" - e.g. `w.decodable !== false`, never `w.decodable ===
 * true`. A parent typing in this week's spelling list has chosen those words
 * deliberately, and silently dropping them would be the wrong behaviour.
 */
export type PuzzleWord = Pick<WordEntry, 'word' | 'emoji'> &
  Partial<Omit<WordEntry, 'word' | 'emoji'>>;

export const WORD_LIST: WordEntry[] = [
  // Animals (3-5 letters)
  { word: 'CAT', emoji: '🐱', rime: 'at', decodable: true },
  { word: 'DOG', emoji: '🐕', rime: 'og', decodable: true },
  { word: 'BEE', emoji: '🐝', rime: 'ee', decodable: true },
  { word: 'COW', emoji: '🐄', rime: 'ow', decodable: true },
  { word: 'PIG', emoji: '🐷', rime: 'ig', decodable: true },
  { word: 'HEN', emoji: '🐔', rime: 'en', decodable: true },
  { word: 'ANT', emoji: '🐜', rime: 'ant', decodable: true },
  { word: 'BAT', emoji: '🦇', rime: 'at', decodable: true },
  { word: 'RAT', emoji: '🐀', rime: 'at', decodable: true },
  { word: 'RAM', emoji: '🐏', rime: 'am', decodable: true },
  { word: 'FOX', emoji: '🦊', rime: 'ox', decodable: true },
  { word: 'OWL', emoji: '🦉', rime: 'owl', decodable: true },
  { word: 'BUG', emoji: '🐛', rime: 'ug', decodable: true },
  { word: 'FLY', emoji: '🪰', rime: 'eye', decodable: true },
  { word: 'FISH', emoji: '🐟', rime: 'ish', decodable: true },
  { word: 'BEAR', emoji: '🐻', rime: 'air', decodable: false },
  { word: 'FROG', emoji: '🐸', rime: 'og', decodable: true },
  { word: 'DUCK', emoji: '🦆', rime: 'uck', decodable: true },
  { word: 'BIRD', emoji: '🐦', rime: 'urd', decodable: true },
  { word: 'LION', emoji: '🦁', rime: 'iun', decodable: false },
  { word: 'CRAB', emoji: '🦀', rime: 'ab', decodable: true },
  { word: 'GOAT', emoji: '🐐', rime: 'oat', decodable: true },
  { word: 'SWAN', emoji: '🦢', rime: 'on', decodable: false },
  { word: 'DEER', emoji: '🦌', rime: 'eer', decodable: true },
  { word: 'SEAL', emoji: '🦭', rime: 'eel', decodable: true },
  { word: 'WORM', emoji: '🪱', rime: 'urm', decodable: false },
  { word: 'WOLF', emoji: '🐺', rime: 'oolf', decodable: false },
  { word: 'DOVE', emoji: '🕊️', rime: 'uv', decodable: false },
  { word: 'CHICK', emoji: '🐤', rime: 'ick', decodable: true },
  { word: 'SHEEP', emoji: '🐑', rime: 'eep', decodable: true },
  { word: 'SNAIL', emoji: '🐌', rime: 'ail', decodable: true },
  { word: 'SNAKE', emoji: '🐍', rime: 'ake', decodable: true },
  { word: 'WHALE', emoji: '🐳', rime: 'ail', decodable: true },
  { word: 'SHARK', emoji: '🦈', rime: 'ark', decodable: true },
  { word: 'SQUID', emoji: '🦑', rime: 'id', decodable: true },
  { word: 'MOUSE', emoji: '🐭', rime: 'ows', decodable: true },
  { word: 'HORSE', emoji: '🐴', rime: 'ors', decodable: true },
  { word: 'BUNNY', emoji: '🐰', rime: 'unny', decodable: true },
  { word: 'GOOSE', emoji: '🪿', rime: 'oos', decodable: true },
  { word: 'MOOSE', emoji: '🫎', rime: 'oos', decodable: true },
  { word: 'SLOTH', emoji: '🦥', rime: 'oth', decodable: true },
  { word: 'SKUNK', emoji: '🦨', rime: 'unk', decodable: true },
  { word: 'OTTER', emoji: '🦦', rime: 'otur', decodable: true },
  { word: 'PANDA', emoji: '🐼', rime: 'anda', decodable: true },
  { word: 'KOALA', emoji: '🐨', rime: 'ahla', decodable: false },
  { word: 'TIGER', emoji: '🐅', rime: 'iger', decodable: false },
  { word: 'ZEBRA', emoji: '🦓', rime: 'eebra', decodable: false },
  { word: 'CAMEL', emoji: '🐪', rime: 'amul', decodable: false },
  { word: 'EAGLE', emoji: '🦅', rime: 'eegul', decodable: false },
  { word: 'HIPPO', emoji: '🦛', rime: 'ipoh', decodable: false },
  { word: 'LLAMA', emoji: '🦙', rime: 'ahma', decodable: false },

  // Food & drink (3-5 letters)
  { word: 'CAKE', emoji: '🍰', rime: 'ake', decodable: true },
  { word: 'PIE', emoji: '🥧', rime: 'eye', decodable: true },
  { word: 'EGG', emoji: '🥚', rime: 'eg', decodable: true },
  { word: 'HAM', emoji: '🍖', rime: 'am', decodable: true },
  { word: 'NUT', emoji: '🥜', rime: 'ut', decodable: true },
  { word: 'PEA', emoji: '🫛', rime: 'ee', decodable: true },
  { word: 'TEA', emoji: '🍵', rime: 'ee', decodable: true },
  { word: 'ICE', emoji: '🧊', rime: 'ice', decodable: true },
  { word: 'CORN', emoji: '🌽', rime: 'orn', decodable: true },
  { word: 'PEAR', emoji: '🍐', rime: 'air', decodable: false },
  { word: 'SOUP', emoji: '🍲', rime: 'oop', decodable: false },
  { word: 'TACO', emoji: '🌮', rime: 'ahkoh', decodable: false },
  { word: 'MILK', emoji: '🥛', rime: 'ilk', decodable: true },
  { word: 'RICE', emoji: '🍚', rime: 'ice', decodable: true },
  { word: 'APPLE', emoji: '🍎', rime: 'apul', decodable: false },
  { word: 'BREAD', emoji: '🍞', rime: 'ed', decodable: false },
  { word: 'PEACH', emoji: '🍑', rime: 'eech', decodable: true },
  { word: 'LEMON', emoji: '🍋', rime: 'emun', decodable: false },
  { word: 'MELON', emoji: '🍈', rime: 'elun', decodable: false },
  { word: 'MANGO', emoji: '🥭', rime: 'angoh', decodable: false },
  { word: 'KIWI', emoji: '🥝', rime: 'eewee', decodable: false },
  { word: 'OLIVE', emoji: '🫒', rime: 'oliv', decodable: false },
  { word: 'ONION', emoji: '🧅', rime: 'unyun', decodable: false },
  { word: 'BEANS', emoji: '🫘', rime: 'eenz', decodable: true },
  { word: 'SALAD', emoji: '🥗', rime: 'alud', decodable: false },
  { word: 'PIZZA', emoji: '🍕', rime: 'eetsa', decodable: false },
  { word: 'PASTA', emoji: '🍝', rime: 'asta', decodable: true },
  { word: 'SUSHI', emoji: '🍣', rime: 'ooshee', decodable: false },
  { word: 'BACON', emoji: '🥓', rime: 'aykun', decodable: false },
  { word: 'BAGEL', emoji: '🥯', rime: 'aygul', decodable: false },
  { word: 'DONUT', emoji: '🍩', rime: 'ohnut', decodable: false },
  { word: 'CANDY', emoji: '🍬', rime: 'andy', decodable: true },
  { word: 'HONEY', emoji: '🍯', rime: 'unny', decodable: false },
  { word: 'JUICE', emoji: '🧃', rime: 'oos', decodable: false },

  // Nature (3-5 letters)
  { word: 'SUN', emoji: '☀️', rime: 'un', decodable: true },
  { word: 'LOG', emoji: '🪵', rime: 'og', decodable: true },
  { word: 'MOON', emoji: '🌙', rime: 'oon', decodable: true },
  { word: 'STAR', emoji: '⭐', rime: 'ar', decodable: true },
  { word: 'TREE', emoji: '🌲', rime: 'ee', decodable: true },
  { word: 'LEAF', emoji: '🍃', rime: 'eef', decodable: true },
  { word: 'RAIN', emoji: '🌧️', rime: 'ain', decodable: true },
  { word: 'SNOW', emoji: '❄️', rime: 'oh', decodable: false },
  { word: 'ROCK', emoji: '🪨', rime: 'ock', decodable: true },
  { word: 'WAVE', emoji: '🌊', rime: 'ave', decodable: true },
  { word: 'ROSE', emoji: '🌹', rime: 'ohz', decodable: true },
  { word: 'FIRE', emoji: '🔥', rime: 'ire', decodable: false },
  { word: 'SEED', emoji: '🌱', rime: 'eed', decodable: true },
  { word: 'CLOUD', emoji: '☁️', rime: 'owd', decodable: true },
  { word: 'BEACH', emoji: '🏖️', rime: 'eech', decodable: true },
  { word: 'SHELL', emoji: '🐚', rime: 'ell', decodable: true },
  { word: 'CORAL', emoji: '🪸', rime: 'orul', decodable: false },
  { word: 'PLANT', emoji: '🪴', rime: 'ant', decodable: true },
  { word: 'TULIP', emoji: '🌷', rime: 'oolip', decodable: false },
  { word: 'EARTH', emoji: '🌍', rime: 'urth', decodable: false },
  { word: 'COMET', emoji: '☄️', rime: 'omit', decodable: false },

  // Objects (3-5 letters)
  { word: 'CAR', emoji: '🚗', rime: 'ar', decodable: true },
  { word: 'JAR', emoji: '🫙', rime: 'ar', decodable: true },
  { word: 'BUS', emoji: '🚌', rime: 'us', decodable: true },
  { word: 'VAN', emoji: '🚐', rime: 'an', decodable: true },
  { word: 'CAN', emoji: '🥫', rime: 'an', decodable: true },
  { word: 'FAN', emoji: '🪭', rime: 'an', decodable: true },
  { word: 'HAT', emoji: '🎩', rime: 'at', decodable: true },
  { word: 'CAP', emoji: '🧢', rime: 'ap', decodable: true },
  { word: 'MAP', emoji: '🗺️', rime: 'ap', decodable: true },
  { word: 'BAG', emoji: '👜', rime: 'ag', decodable: true },
  { word: 'CUP', emoji: '🥤', rime: 'up', decodable: true },
  { word: 'KEY', emoji: '🔑', rime: 'ee', decodable: false },
  { word: 'PEN', emoji: '🖊️', rime: 'en', decodable: true },
  { word: 'BOX', emoji: '📦', rime: 'ox', decodable: true },
  { word: 'BED', emoji: '🛏️', rime: 'ed', decodable: true },
  { word: 'SAW', emoji: '🪚', rime: 'aw', decodable: true },
  { word: 'AXE', emoji: '🪓', rime: 'aks', decodable: false },
  { word: 'TIE', emoji: '👔', rime: 'eye', decodable: true },
  { word: 'BOW', emoji: '🎀', rime: 'oh', decodable: false },
  { word: 'BALL', emoji: '⚽', rime: 'awl', decodable: false },
  { word: 'BOAT', emoji: '⛵', rime: 'oat', decodable: true },
  { word: 'COAT', emoji: '🧥', rime: 'oat', decodable: true },
  { word: 'BOOK', emoji: '📚', rime: 'ook', decodable: true },
  { word: 'HOOK', emoji: '🪝', rime: 'ook', decodable: true },
  { word: 'BELL', emoji: '🔔', rime: 'ell', decodable: true },
  { word: 'DOOR', emoji: '🚪', rime: 'or', decodable: false },
  { word: 'GIFT', emoji: '🎁', rime: 'ift', decodable: true },
  { word: 'SOCK', emoji: '🧦', rime: 'ock', decodable: true },
  { word: 'LOCK', emoji: '🔒', rime: 'ock', decodable: true },
  { word: 'KITE', emoji: '🪁', rime: 'ite', decodable: true },
  { word: 'LAMP', emoji: '💡', rime: 'amp', decodable: true },
  { word: 'DRUM', emoji: '🥁', rime: 'um', decodable: true },
  { word: 'SHOE', emoji: '👟', rime: 'oo', decodable: false },
  { word: 'BOOT', emoji: '🥾', rime: 'oot', decodable: true },
  { word: 'TENT', emoji: '⛺', rime: 'ent', decodable: true },
  { word: 'BIKE', emoji: '🚲', rime: 'ike', decodable: true },
  { word: 'RING', emoji: '💍', rime: 'ing', decodable: true },
  { word: 'WING', emoji: '🪽', rime: 'ing', decodable: true },
  { word: 'COIN', emoji: '🪙', rime: 'oyn', decodable: true },
  { word: 'PLUG', emoji: '🔌', rime: 'ug', decodable: true },
  { word: 'FLAG', emoji: '🚩', rime: 'ag', decodable: true },
  { word: 'NAIL', emoji: '💅', rime: 'ail', decodable: true },
  { word: 'MAIL', emoji: '📬', rime: 'ail', decodable: true },
  { word: 'SLED', emoji: '🛷', rime: 'ed', decodable: true },
  { word: 'NEST', emoji: '🪺', rime: 'est', decodable: true },
  { word: 'VEST', emoji: '🦺', rime: 'est', decodable: true },
  { word: 'SOAP', emoji: '🧼', rime: 'oap', decodable: true },
  { word: 'BATH', emoji: '🛁', rime: 'ath', decodable: true },
  { word: 'STOP', emoji: '🛑', rime: 'op', decodable: true },
  { word: 'SHOP', emoji: '🏪', rime: 'op', decodable: true },
  { word: 'DROP', emoji: '💧', rime: 'op', decodable: true },
  { word: 'SHIP', emoji: '🚢', rime: 'ip', decodable: true },
  { word: 'TAXI', emoji: '🚕', rime: 'aksee', decodable: false },
  { word: 'TRUCK', emoji: '🚚', rime: 'uck', decodable: true },
  { word: 'TRAIN', emoji: '🚂', rime: 'ain', decodable: true },
  { word: 'PLANE', emoji: '✈️', rime: 'ain', decodable: true },
  { word: 'CHAIN', emoji: '⛓️', rime: 'ain', decodable: true },
  { word: 'CANOE', emoji: '🛶', rime: 'anoo', decodable: false },
  { word: 'WHEEL', emoji: '🛞', rime: 'eel', decodable: true },
  { word: 'SKATE', emoji: '⛸️', rime: 'ate', decodable: true },
  { word: 'SLIDE', emoji: '🛝', rime: 'ide', decodable: true },
  { word: 'CLOCK', emoji: '🕐', rime: 'ock', decodable: true },
  { word: 'WATCH', emoji: '⌚', rime: 'och', decodable: true },
  { word: 'PHONE', emoji: '📱', rime: 'ohn', decodable: false },
  { word: 'RADIO', emoji: '📻', rime: 'aydioh', decodable: false },
  { word: 'PIANO', emoji: '🎹', rime: 'anoh', decodable: false },
  { word: 'FLUTE', emoji: '🪈', rime: 'oot', decodable: false },
  { word: 'PAINT', emoji: '🎨', rime: 'aint', decodable: true },
  { word: 'BRUSH', emoji: '🖌️', rime: 'ush', decodable: true },
  { word: 'RULER', emoji: '📏', rime: 'ooler', decodable: false },
  { word: 'PAPER', emoji: '📄', rime: 'aypur', decodable: false },
  { word: 'CHAIR', emoji: '🪑', rime: 'air', decodable: true },
  { word: 'HOUSE', emoji: '🏠', rime: 'ows', decodable: true },
  { word: 'BROOM', emoji: '🧹', rime: 'oom', decodable: true },
  { word: 'PLATE', emoji: '🍽️', rime: 'ate', decodable: true },
  { word: 'SPOON', emoji: '🥄', rime: 'oon', decodable: true },
  { word: 'KNIFE', emoji: '🔪', rime: 'ife', decodable: false },
  { word: 'DICE', emoji: '🎲', rime: 'ice', decodable: true },
  { word: 'DRESS', emoji: '👗', rime: 'ess', decodable: true },
  { word: 'SHIRT', emoji: '👕', rime: 'urt', decodable: true },
  { word: 'SCARF', emoji: '🧣', rime: 'arf', decodable: true },
  { word: 'GLOVE', emoji: '🧤', rime: 'uv', decodable: false },
  { word: 'MONEY', emoji: '💰', rime: 'unny', decodable: false },
  { word: 'HEART', emoji: '❤️', rime: 'art', decodable: false },
  { word: 'ROBOT', emoji: '🤖', rime: 'ohbot', decodable: false },
  { word: 'GHOST', emoji: '👻', rime: 'ohst', decodable: false },
  { word: 'ALIEN', emoji: '👽', rime: 'aylien', decodable: false },

  // People & body (3-5 letters)
  { word: 'KING', emoji: '👑', rime: 'ing', decodable: true },
  { word: 'BABY', emoji: '👶', rime: 'aybee', decodable: false },
  { word: 'BOY', emoji: '👦', rime: 'oy', decodable: true },
  { word: 'GIRL', emoji: '👧', rime: 'url', decodable: true },
  { word: 'MAN', emoji: '👨', rime: 'an', decodable: true },
  { word: 'WOMAN', emoji: '👩', rime: 'oomun', decodable: false },
  { word: 'HAND', emoji: '✋', rime: 'and', decodable: true },
  { word: 'BONE', emoji: '🦴', rime: 'ohn', decodable: true },
  { word: 'FOOT', emoji: '🦶', rime: 'uut', decodable: true },
  { word: 'LEG', emoji: '🦵', rime: 'eg', decodable: true },
  { word: 'EAR', emoji: '👂', rime: 'eer', decodable: true },
  { word: 'EYE', emoji: '👁️', rime: 'eye', decodable: false },
  { word: 'NOSE', emoji: '👃', rime: 'ohz', decodable: true },
  { word: 'MOUTH', emoji: '👄', rime: 'owth', decodable: true },
  { word: 'TOOTH', emoji: '🦷', rime: 'ooth', decodable: true },
  { word: 'BRAIN', emoji: '🧠', rime: 'ain', decodable: true },
  { word: 'RUN', emoji: '🏃', rime: 'un', decodable: true },
  { word: 'HUG', emoji: '🤗', rime: 'ug', decodable: true },
  { word: 'CLAP', emoji: '👏', rime: 'ap', decodable: true },
  { word: 'SLEEP', emoji: '😴', rime: 'eep', decodable: true },
  { word: 'CLOWN', emoji: '🤡', rime: 'own', decodable: true },
  { word: 'FAIRY', emoji: '🧚', rime: 'airee', decodable: false },
  { word: 'ANGEL', emoji: '👼', rime: 'aynjul', decodable: false },
  { word: 'SANTA', emoji: '🎅', rime: 'anta', decodable: true },

  // Numbers (3-5 letters)
  { word: 'ZERO', emoji: '0️⃣', rime: 'eeroh', decodable: false, pictureClue: false },
  { word: 'ONE', emoji: '1️⃣', rime: 'un', decodable: false, pictureClue: false },
  { word: 'TWO', emoji: '2️⃣', rime: 'oo', decodable: false, pictureClue: false },
  { word: 'THREE', emoji: '3️⃣', rime: 'ee', decodable: true, pictureClue: false },
  { word: 'FOUR', emoji: '4️⃣', rime: 'or', decodable: false, pictureClue: false },
  { word: 'FIVE', emoji: '5️⃣', rime: 'ive', decodable: false, pictureClue: false },
  { word: 'SIX', emoji: '6️⃣', rime: 'iks', decodable: true, pictureClue: false },
  { word: 'SEVEN', emoji: '7️⃣', rime: 'evun', decodable: false, pictureClue: false },
  { word: 'EIGHT', emoji: '8️⃣', rime: 'ate', decodable: false, pictureClue: false },
  { word: 'NINE', emoji: '9️⃣', rime: 'ine', decodable: true, pictureClue: false },
  { word: 'TEN', emoji: '🔟', rime: 'en', decodable: true },

  // Colours (3-5 letters)
  { word: 'RED', emoji: '🟥', rime: 'ed', decodable: true, pictureClue: false },
  { word: 'BLUE', emoji: '🟦', rime: 'oo', decodable: false, pictureClue: false },
  { word: 'GREEN', emoji: '🟩', rime: 'een', decodable: true, pictureClue: false },
  { word: 'BROWN', emoji: '🟫', rime: 'own', decodable: true, pictureClue: false },
  { word: 'BLACK', emoji: '⬛', rime: 'ak', decodable: true, pictureClue: false },
  { word: 'WHITE', emoji: '⬜', rime: 'ite', decodable: true, pictureClue: false },
];
