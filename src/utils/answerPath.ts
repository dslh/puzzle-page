/** Breadth-first route through a graph. Does not consume puzzle randomness. */
export function answerPath(start: number, end: number, neighbors: (node: number) => Iterable<number>): number[] {
  const parent = new Map<number, number | null>([[start, null]]);
  const queue = [start];
  for (let i = 0; i < queue.length && !parent.has(end); i++) {
    const node = queue[i];
    for (const next of neighbors(node)) {
      if (parent.has(next)) continue;
      parent.set(next, node);
      queue.push(next);
    }
  }
  if (!parent.has(end)) return [];
  const route: number[] = [];
  for (let node: number | null = end; node !== null; node = parent.get(node) ?? null) route.push(node);
  return route.reverse();
}
