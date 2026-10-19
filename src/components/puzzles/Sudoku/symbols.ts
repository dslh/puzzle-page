const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * The distinct symbols in a custom-symbols string, in order, at most `size`.
 * Splits by what a reader sees as one character, so an emoji (several code
 * units, or several code points joined) stays whole. A repeat is dropped: two
 * equal symbols would make the grid impossible to solve.
 */
export function parseCustomSymbols(text: string, size: number): string[] {
  const symbols: string[] = [];
  for (const { segment } of segmenter.segment(text)) {
    if (segment.trim() === '' || symbols.includes(segment)) continue;
    symbols.push(segment);
    if (symbols.length === size) break;
  }
  return symbols;
}
