import { CELL_SIZE_MM } from '../../../types/puzzle';
import { SeededRandom } from '../../../utils/random';

export type Cell = readonly [number, number];
export type Shape = readonly Cell[];

/** Small connected silhouettes with four visibly different orientations. */
export const SHAPES: readonly Shape[] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]], // L
  [[0, 0], [1, 0], [2, 0], [1, 1]], // T
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], // P
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], // F
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], // W
  [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], // U
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], // V
  [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], // five-square T
  [[1, 0], [1, 1], [0, 2], [1, 2]], // mirrored L
  [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]], // mirrored P
  [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2]], // mirrored F
  [[0, 0], [0, 1], [1, 1]], // three-square L
];

export function normalise(shape: Shape): Cell[] {
  const minX = Math.min(...shape.map(([x]) => x));
  const minY = Math.min(...shape.map(([, y]) => y));
  return shape.map(([x, y]): Cell => [x - minX, y - minY])
    .sort(([ax, ay], [bx, by]) => ay - by || ax - bx);
}

export function shapeKey(shape: Shape): string {
  return normalise(shape).map(cell => cell.join(',')).join(';');
}

/** SVG's y axis points down: (x, y) → (-y, x) is clockwise. */
export function rotate(shape: Shape, turns = 1): Cell[] {
  let result = normalise(shape);
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) {
    result = normalise(result.map(([x, y]): Cell => [-y, x]));
  }
  return result;
}

export type TurnKind = 'clockwise' | 'anticlockwise' | 'half';
export type ShapeFamily = 'blocks' | 'pointy' | 'rounded';
export type ShapeStyle = ShapeFamily | 'mixed';
export const TURN_STEPS: Record<TurnKind, number> = { clockwise: 1, anticlockwise: 3, half: 2 };

/** Polygon vertices, in boundary order. Rounded pictures soften every corner. */
export const OUTLINES: Record<Exclude<ShapeFamily, 'blocks'>, readonly Shape[]> = {
  pointy: [
    [[0, 0], [3, 1.5], [0, 3], [0.7, 1.5]], // arrowhead
    [[0, 0], [3, 1], [1, 3]], // triangle
    [[1, 0], [3, 0], [1.8, 1.1], [2.8, 1.1], [0, 3], [0.8, 1.6], [0, 1.6]], // bolt: flat head and pointed tail distinguish a half-turn
    [[0, 0], [3, 0.8], [1.8, 1.5], [1, 3]], // kite
    [[0, 0], [3, 2.5], [1, 2], [0, 3]], // sail
    [[0, 0], [3, 0.5], [1.7, 1.4], [2.5, 2.5], [0, 2.1]], // pennant
    [[0.7, 0], [2.3, 0], [3, 3], [0, 3]], // trapezium
    [[0, 0], [2, 0], [3, 1.2], [2, 3], [0, 2]], // irregular pentagon
    [[0, 0], [1.1, 0], [3, 1.5], [1.1, 3], [0, 3], [1.8, 1.5]], // chevron
    [[0, 0], [0.7, 1.2], [1.5, 0.2], [2.2, 1.2], [3, 0], [2.7, 3], [0.3, 3]], // crown
  ],
  rounded: [
    [[1.5, 0], [2.5, 1.3], [3, 2.5], [1.5, 3], [0, 2.5], [0.5, 1.3]], // drop
    [[0, 0], [2, 0], [3, 1], [2.5, 2], [3, 3], [1, 3], [0, 2]], // bean
    [[0, 0], [1, 0], [1.5, 1.5], [3, 1.5], [3, 3], [0, 3]], // boot
    [[0, 0.5], [0.8, 0], [1.5, 0.7], [2.2, 0], [3, 0.5], [3, 1.5], [1.5, 3], [0, 1.5]], // heart
    [[0, 0], [3, 0], [2, 0.8], [1.5, 1.5], [2, 2.2], [3, 3], [0, 3]], // crescent
    [[0, 1.5], [0.2, 0.6], [1.5, 0], [2.8, 0.6], [3, 1.5], [2, 1.5], [2, 3], [1, 3], [1, 1.5]], // mushroom
    [[1.5, 0], [2, 0.2], [1.9, 1], [2.8, 1.6], [3, 2.5], [2.3, 3], [0.7, 3], [0, 2.5], [0.2, 1.6], [1.1, 1], [1, 0.2]], // pear
    [[0.3, 3], [0, 1], [0.2, 0.2], [1.2, 0], [1.9, 0.3], [1.9, 1.2], [2.6, 0.8], [3, 1.2], [3, 1.8], [1.8, 2.3], [1.9, 3]], // mitten
    [[0, 0.8], [0.4, 0.2], [1.4, 0], [2.1, 0.5], [2.1, 1], [2.6, 0.8], [2.8, 0.2], [3, 1], [2.8, 1.8], [2.4, 1.3], [2, 1.5], [1.3, 2.2], [0.4, 1.9], [0, 1.3]], // whale
    [[1.5, 0], [2.6, 0.2], [3, 1.3], [2.6, 2.2], [1.3, 3], [1.6, 2], [0.5, 1.8], [0, 1], [0.4, 0.2]], // comma
  ],
};

export function rotateFigure(shape: Shape, turns: number, family: ShapeFamily): Shape {
  if (family === 'blocks') return rotate(shape, turns);
  let points = shape.map(([x, y]): Cell => [x, y]);
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) points = points.map(([x, y]) => [-y, x]);
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  return points.map(([x, y]): Cell => [x - minX, y - minY]);
}

/** Translation and the choice of first boundary vertex do not change a picture. */
export function figureKey(shape: Shape, family: ShapeFamily): string {
  if (family === 'blocks') return shapeKey(shape);
  const points = rotateFigure(shape, 0, family).map(([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`);
  return points.map((_, i) => [...points.slice(i), ...points.slice(0, i)].join(';')).sort()[0];
}

export interface TurnQuestion {
  family: ShapeFamily;
  turn: TurnKind;
  model: Shape;
  choices: Shape[];
  answer: number;
}

/** Row count never affects earlier draws, so resizing preserves existing rows. */
export function generateTurns(seed: number, rowCount: number, allowedTurns: readonly TurnKind[] = ['clockwise'], style: ShapeStyle = 'blocks'): TurnQuestion[] {
  const random = new SeededRandom(seed);
  const rows: TurnQuestion[] = [];
  const families: ShapeFamily[] = style === 'mixed' ? ['blocks', 'pointy', 'rounded'] : [style];
  const pool = families.flatMap(family => (family === 'blocks' ? SHAPES : OUTLINES[family]).map(shape => ({ family, shape })));
  let deck: typeof pool = [];
  // Also tolerate old or incomplete saved configs; never generate an empty choice set.
  const allowed = [...new Set(allowedTurns.filter(turn => turn in TURN_STEPS))];
  if (!allowed.length) allowed.push('clockwise');
  for (let row = 0; row < rowCount; row++) {
    if (!deck.length) deck = random.shuffle(pool);
    const source = deck.pop()!;
    const model = rotateFigure(source.shape, random.nextInt(4), source.family);
    const turn = allowed.length === 1 ? allowed[0] : random.pick(allowed);
    const steps = TURN_STEPS[turn];
    // A half-turn needs wrong quarter-turns, never “the other direction”.
    const turns = random.shuffle(steps === 2 ? [2, 1, 3] : [steps, 0, 4 - steps]);
    rows.push({ family: source.family, turn, model, choices: turns.map(t => rotateFigure(model, t, source.family)), answer: turns.indexOf(steps) });
  }
  return rows;
}

/** All paths use the same centred viewport and physical scale. */
export function figurePath(shape: Shape, family: ShapeFamily): string {
  if (family === 'blocks') return shapePath(shape);
  const width = Math.max(...shape.map(([x]) => x));
  const height = Math.max(...shape.map(([, y]) => y));
  const points = shape.map(([x, y]): Cell => [x - width / 2, y - height / 2]);
  if (family === 'pointy') return `M${points.map(p => p.join(',')).join('L')}Z`;
  const between = (a: Cell, b: Cell, t: number): Cell => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return points.map((p, i) => {
    const before = points[(i + points.length - 1) % points.length];
    const after = points[(i + 1) % points.length];
    return `${i ? 'L' : 'M'}${between(p, before, 0.38).join(',')}Q${p.join(',')} ${between(p, after, 0.38).join(',')}`;
  }).join('') + 'Z';
}

/** Common radius and starting point make quarter- and half-turns comparable. */
export const TURN_RADIUS = 5;

export function turnArrowEnd(turn: TurnKind): Cell {
  return turn === 'half' ? [0, TURN_RADIUS]
    : [turn === 'clockwise' ? TURN_RADIUS : -TURN_RADIUS, 0];
}

export function turnArrow(turn: TurnKind): string {
  const [x, y] = turnArrowEnd(turn);
  const arc = `M 0 ${-TURN_RADIUS} A ${TURN_RADIUS} ${TURN_RADIUS} 0 0 ${turn === 'anticlockwise' ? 0 : 1} ${x} ${y}`;
  // The head follows the circle's tangent, rather than pointing into its centre.
  const head = turn === 'half'
    ? `M 1.5 ${y - 1.5} L 0 ${y} L 1.5 ${y + 1.5}`
    : `M ${x - 1.5} -1.5 L ${x} 0 L ${x + 1.5} -1.5`;
  return `${arc} ${head}`;
}

/** Trace only exposed edges, leaving a single filled silhouette with no grid seams. */
export function shapePath(shape: Shape): string {
  const cells = normalise(shape);
  const occupied = new Set(cells.map(([x, y]) => `${x},${y}`));
  const edges = new Map<string, Cell>();
  for (const [x, y] of cells) {
    if (!occupied.has(`${x},${y - 1}`)) edges.set(`${x},${y}`, [x + 1, y]);
    if (!occupied.has(`${x + 1},${y}`)) edges.set(`${x + 1},${y}`, [x + 1, y + 1]);
    if (!occupied.has(`${x},${y + 1}`)) edges.set(`${x + 1},${y + 1}`, [x, y + 1]);
    if (!occupied.has(`${x - 1},${y}`)) edges.set(`${x},${y + 1}`, [x, y]);
  }
  const width = Math.max(...cells.map(([x]) => x)) + 1;
  const height = Math.max(...cells.map(([, y]) => y)) + 1;
  const point = ([x, y]: Cell) => `${x - width / 2},${y - height / 2}`;
  let path = '';
  while (edges.size) {
    const start = edges.keys().next().value!;
    let key = start;
    path += `M${point(key.split(',').map(Number) as [number, number])}`;
    do {
      const next = edges.get(key)!;
      edges.delete(key);
      path += `L${point(next)}`;
      key = next.join(',');
    } while (key !== start);
    path += 'Z';
  }
  return path;
}

export function turnLayout(gridWidth: number, gridHeight: number) {
  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;
  const slot = Math.min(23, (width - 4 - 14) / 4, (height - 10) / 2 - 2);
  const rowHeight = slot + 2;
  const rowCount = Math.max(1, Math.floor((height - 10) / rowHeight));
  return { width, height, slot, rowHeight, rowCount };
}
