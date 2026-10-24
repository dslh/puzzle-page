/**
 * Hand-kept picture lists for Which Is the Same?, checked by eye in Noto Color
 * Emoji, the font the page prints with. Another font may draw them differently.
 */

/**
 * Groups for the hard level: pictures in a group look nearly the same, but no
 * two are drawn identically. ☹️ is left out of the sad faces, being
 * indistinguishable from 🙁. Some groups differ only in colour, which is fine
 * printed in colour and unfair in black and white.
 */
export const LOOKALIKES: string[][] = [
  // Faces
  ['😀', '😃', '😄', '😁', '😆', '🙂', '😊'],
  ['🙁', '😟', '😕', '😞', '😔'],
  ['😺', '😸', '😹', '😻', '😼', '😽', '🙀'],
  ['🙈', '🙉', '🙊', '🐵'],
  ['🐶', '🐺', '🦊'],
  ['🐷', '🐗', '🐽'],

  // Animals
  ['🐕‍🦺', '🦮', '🐩'],
  ['🐈', '🐈‍⬛', '🐱'],
  ['🐁', '🐀', '🐭'],
  ['🐄', '🐂', '🐃'],
  ['🐟', '🐠', '🐡'],
  ['🐤', '🐥', '🐣'],
  ['🦆', '🐦', '🐤'],
  ['🐜', '🪲', '🐞'],

  // Vehicles
  ['🚗', '🚙', '🚕', '🚓'],
  ['🚘', '🚖', '🚔', '🚍'],
  ['🚌', '🚎', '🚐'],
  ['🚚', '🚛', '🛻'],

  // Sky and nature
  ['🌍', '🌎', '🌏'],
  ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
  ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️'],
  ['🌸', '🌼', '🏵️', '💮', '🌺'],
  ['🌲', '🌳', '🎄', '🌴'],

  // Things
  ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗'],
  ['🏠', '🏡', '🏘️'],
  ['⚽', '🏐', '🏀', '🎾'],

  // Colour only
  ['🍎', '🍏', '🍅'],
  ['📕', '📗', '📘', '📙'],
  ['❤️', '🧡', '💛', '💚', '💙', '💜'],
  ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'],
  ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'],
];

/**
 * Pictures that plainly face one way, so a mirror image is a different
 * picture: side-on animals and vehicles, tools and instruments held at an
 * angle. Front-facing pictures (🐶, 🐱) look the same flipped and are left
 * out, as are moons, whose mirror image is another moon.
 */
export const FACING = new Set([
  // Animals
  '🐈', '🐈‍⬛', '🐎', '🐇', '🐁', '🐀', '🐄', '🐂', '🐃', '🐖', '🐗', '🐘',
  '🦒', '🦓', '🦙', '🐪', '🐫', '🦘', '🐿️', '🦔', '🦌', '🐑', '🐏', '🐐',
  '🐅', '🐆', '🐩', '🦮', '🐕‍🦺',
  '🐊', '🐢', '🦎', '🐍', '🦕', '🦖',
  '🐟', '🐠', '🐬', '🐳', '🦈', '🦭',
  '🐓', '🐔', '🦃', '🦆', '🦢', '🦩', '🐧', '🦜', '🕊️', '🐦',
  '🐛', '🐌', '🐝', '🐜', '🦗', '🪲',
  // Vehicles
  '🚗', '🚙', '🚕', '🚓', '🚑', '🚒', '🏎️', '🚌', '🚎', '🚚', '🚛', '🛻',
  '🚜', '🚲', '🛴', '🚂', '🛵', '🏍️', '🚀', '✈️', '🛩️', '🚁', '⛵', '🛥️',
  // Things
  '🔨', '🔧', '🪓', '🥄', '🔪', '🎺', '🎷', '🎸', '🎻', '🪕', '📢',
  '🍌', '🥕', '🍼', '🧦', '👟', '👠', '🌙',
]);
