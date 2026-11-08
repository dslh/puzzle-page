// Bundle with esbuild --platform=node --jsx=automatic --loader:.css=empty, then node --test.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import WhichWayDidItTurn from '../src/components/puzzles/WhichWayDidItTurn';
import { SHAPES, OUTLINES, TURN_STEPS, figureKey, figurePath, rotateFigure, generateTurns, normalise, rotate, shapeKey, shapePath, turnLayout, type ShapeFamily, type ShapeStyle, type TurnKind } from '../src/components/puzzles/WhichWayDidItTurn/generator';

test('every source silhouette is connected, fits the viewport and has four distinct turns', () => {
  for (const shape of SHAPES) {
    const seen = new Set([shape[0].join(',')]);
    let previous = 0;
    while (previous !== seen.size) {
      previous = seen.size;
      for (const [x, y] of shape) if ([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(p => seen.has(p.join(',')))) seen.add(`${x},${y}`);
    }
    assert.equal(seen.size, shape.length);
    assert.equal(new Set([0, 1, 2, 3].map(t => shapeKey(rotate(shape, t)))).size, 4);
    assert.deepEqual(rotate(shape, 4), normalise(shape));
    for (let t = 0; t < 4; t++) {
      const turned = rotate(shape, t);
      assert.ok(turned.every(([x, y]) => x >= 0 && x <= 2 && y >= 0 && y <= 2));
      const path = shapePath(turned);
      assert.ok(path.endsWith('Z'));
      assert.ok(!/NaN|undefined/.test(path));
      // A closed, clockwise boundary has signed area equal to its occupied cells.
      const points = [...path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]);
      const twiceArea = points.reduce((sum, p, i) => { const next = points[(i + 1) % points.length]; return sum + p[0] * next[1] - next[0] * p[1]; }, 0);
      assert.equal(twiceArea / 2, shape.length);
    }
  }
});

test('clockwise follows SVG coordinates and normalisation ignores translation', () => {
  assert.deepEqual(rotate([[0, 0], [0, 1], [0, 2], [1, 2]]), normalise([[0, 0], [1, 0], [2, 0], [0, 1]]));
  assert.equal(shapeKey([[10, -4], [10, -3]]), shapeKey([[0, 0], [0, 1]]));
});

test('many seeds give exactly one correct answer, three distinct choices and stable row prefixes', () => {
  const positions = new Set<number>();
  for (let seed = 0; seed < 1000; seed++) {
    const rows = generateTurns(seed, 8);
    assert.deepEqual(rows, generateTurns(seed, 8));
    assert.deepEqual(rows.slice(0, 2), generateTurns(seed, 2));
    for (const row of rows) {
      const keys = row.choices.map(shapeKey);
      const answer = shapeKey(rotate(row.model));
      assert.equal(new Set(keys).size, 3);
      assert.equal(keys.filter(key => key === answer).length, 1);
      assert.equal(keys[row.answer], answer);
      positions.add(row.answer);
    }
  }
  assert.equal(positions.size, 3);
});

test('every allowed layout fits at least an example and one question, without clipping', () => {
  for (let w = 6; w <= 10; w++) for (let h = 4; h <= 14; h++) {
    const layout = turnLayout(w, h);
    assert.ok(layout.rowCount >= 2);
    assert.ok(9 + (layout.rowCount - 1) * layout.rowHeight + layout.slot < layout.height);
    assert.ok(layout.slot >= 23);
  }
});

test('example toggle preserves shapes; answer key marks only unanswered rows', () => {
  const props = { gridWidth: 8, gridHeight: 6, seed: 31, config: { workedExample: true, shapes: 'blocks' as const, turns: ['clockwise' as const] } };
  const worksheet = renderToStaticMarkup(createElement(WhichWayDidItTurn, props));
  const key = renderToStaticMarkup(createElement(WhichWayDidItTurn, { ...props, showAnswers: true }));
  const blank = renderToStaticMarkup(createElement(WhichWayDidItTurn, { ...props, config: { ...props.config, workedExample: false } }));
  const blankKey = renderToStaticMarkup(createElement(WhichWayDidItTurn, { ...props, config: { ...props.config, workedExample: false }, showAnswers: true }));
  assert.equal((worksheet.match(/data-worked-example/g) ?? []).length, 1);
  assert.ok(!worksheet.includes('data-answer='));
  assert.ok(!blank.includes('data-worked-example'));
  const count = turnLayout(8, 6).rowCount;
  assert.equal((key.match(/data-answer="path"/g) ?? []).length, count - 1);
  assert.equal((blankKey.match(/data-answer="path"/g) ?? []).length, count);
  const silhouettes = (markup: string) => [...markup.matchAll(/<path data-turn-picture="shape" d="([^"]+)"/g)].map(m => m[1]);
  assert.equal(silhouettes(worksheet).length, count * 4);
  assert.deepEqual(silhouettes(worksheet), silhouettes(key));
  assert.deepEqual(silhouettes(worksheet), silhouettes(blank));
});


test('pointy and rounded outlines have four different orientations and valid paths', () => {
  for (const family of ['pointy', 'rounded'] as const) for (const shape of OUTLINES[family]) {
    const rotations = [0, 1, 2, 3].map(t => rotateFigure(shape, t, family));
    assert.equal(new Set(rotations.map(s => figureKey(s, family))).size, 4);
    assert.equal(figureKey(rotateFigure(shape, 4, family), family), figureKey(shape, family));
    assert.equal(figureKey(rotateFigure(shape, 2, family), family), figureKey(rotateFigure(shape, -2, family), family));
    for (const turned of rotations) {
      const path = figurePath(turned, family);
      assert.ok(path.startsWith('M') && path.endsWith('Z'));
      assert.equal(path.includes('Q'), family === 'rounded');
      assert.ok(!/NaN|undefined/.test(path));
      assert.ok(turned.every(([x, y]) => x >= 0 && y >= 0 && x <= 3 && y <= 3));
    }
  }
});

test('every combination of turns and families gives one correct answer and stable resizing', () => {
  const turnKinds: TurnKind[] = ['clockwise', 'anticlockwise', 'half'];
  const styles: ShapeStyle[] = ['blocks', 'pointy', 'rounded', 'mixed'];
  for (const style of styles) for (let mask = 1; mask < 8; mask++) {
    const allowed = turnKinds.filter((_, i) => mask & (1 << i));
    const observedTurns = new Set<TurnKind>();
    const observedFamilies = new Set<ShapeFamily>();
    const answers = new Set<number>();
    for (let seed = 0; seed < 100; seed++) {
      const rows = generateTurns(seed, 10, allowed, style);
      assert.deepEqual(rows, generateTurns(seed, 10, allowed, style));
      assert.deepEqual(rows.slice(0, 2), generateTurns(seed, 2, allowed, style));
      for (const row of rows) {
        assert.ok(allowed.includes(row.turn));
        assert.ok(style === 'mixed' || row.family === style);
        const keys = row.choices.map(s => figureKey(s, row.family));
        const correct = figureKey(rotateFigure(row.model, TURN_STEPS[row.turn], row.family), row.family);
        assert.equal(new Set(keys).size, 3);
        assert.equal(keys.filter(k => k === correct).length, 1);
        assert.equal(keys[row.answer], correct);
        observedTurns.add(row.turn);
        observedFamilies.add(row.family);
        answers.add(row.answer);
      }
    }
    assert.deepEqual([...observedTurns].sort(), [...allowed].sort());
    assert.equal(observedFamilies.size, style === 'mixed' ? 3 : 1);
    assert.equal(answers.size, 3);
  }
});

test('compact rows omit numbering and display the requested turn cues', () => {
  assert.equal(turnLayout(8, 6).rowCount, 4);
  for (const turn of ['clockwise', 'anticlockwise', 'half'] as const) {
    const markup = renderToStaticMarkup(createElement(WhichWayDidItTurn, {
      gridWidth: 6, gridHeight: 4, seed: 5,
      config: { workedExample: true, shapes: 'rounded', turns: [turn] },
    }));
    assert.equal((markup.match(/<text /g) ?? []).length, 2, 'only the instruction and Example label are printed');
    assert.ok(markup.includes('>Example</text>'));
    assert.equal((markup.match(new RegExp(`data-turn-cue="${turn}"`, 'g')) ?? []).length, 2);
    assert.ok(markup.includes('Q'), 'rounded shapes use curved boundaries');
  }
});

test('catalogue has 12 / 10 / 10 base shapes with no rotational duplicates within a family', () => {
  const pools = { blocks: SHAPES, ...OUTLINES };
  assert.deepEqual(Object.values(pools).map(pool => pool.length), [12, 10, 10]);
  for (const family of ['blocks', 'pointy', 'rounded'] as const) {
    const baseKeys = pools[family].map(shape => [0, 1, 2, 3]
      .map(turn => figureKey(rotateFigure(shape, turn, family), family)).sort()[0]);
    assert.equal(new Set(baseKeys).size, pools[family].length, `${family} has no repeated silhouettes`);
    const rows = generateTurns(31, pools[family].length, ['clockwise'], family);
    const drawnKeys = rows.map(row => [0, 1, 2, 3]
      .map(turn => figureKey(rotateFigure(row.model, turn, family), family)).sort()[0]);
    assert.deepEqual([...drawnKeys].sort(), [...baseKeys].sort(), 'a deck includes each base shape once');
  }
});


test('row colours decorate all four pictures equally and leave the example optional', () => {
  const props = { gridWidth: 6, gridHeight: 6, seed: 31,
    config: { workedExample: true, shapes: 'mixed' as const, turns: ['clockwise' as const] } };
  const markup = renderToStaticMarkup(createElement(WhichWayDidItTurn, props));
  const colours = [...markup.matchAll(/data-turn-picture="shape" d="[^"]*" fill="([^"]+)"/g)].map(m => m[1]);
  const count = turnLayout(6, 6).rowCount;
  assert.equal(colours.length, count * 4);
  for (let row = 0; row < count; row++) assert.equal(new Set(colours.slice(row * 4, row * 4 + 4)).size, 1);
  assert.equal(new Set(colours).size, 4);
  const blank = renderToStaticMarkup(createElement(WhichWayDidItTurn, { ...props, config: { ...props.config, workedExample: false } }));
  assert.ok(!blank.includes('>Example</text>'));
  assert.ok(!blank.includes('data-worked-example'));
});
