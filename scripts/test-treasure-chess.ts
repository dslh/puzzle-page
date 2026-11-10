// Bundle with esbuild --platform=node --jsx=automatic --loader:.css=empty --loader:.svg=text, then node --test.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TreasureChess from '../src/components/puzzles/TreasureChess';
import { generateTreasureChess, PIECES, type TreasureLength } from '../src/components/puzzles/TreasureChess/generator';
import { movesFrom } from '../src/components/puzzles/ChessMoves/generator';

const SIZES: [number, number][] = [[4, 4], [6, 7], [10, 14]];
const LENGTHS: TreasureLength[] = ['short', 'medium', 'long'];

test('every route is legal, lands on every pickup and ends on the chest', () => {
  for (const [w, h] of SIZES) for (const piece of PIECES) for (const collect of [0, 2]) for (let seed = 1; seed <= 40; seed++) {
    const p = generateTreasureChess(w, h, seed, piece, 'medium', collect, true);
    for (let i = 1; i < p.route.length; i++) {
      assert.ok(movesFrom(piece, p.route[i - 1], p.cols, p.rows, p.blocked).includes(p.route[i]), `seed ${seed} ${piece}`);
    }
    assert.equal(p.route[0], p.start);
    assert.equal(p.route[p.route.length - 1], p.goal);
    for (const s of p.pickups) assert.ok(p.route.includes(s), `seed ${seed} ${piece} pickup ${s}`);
    for (const s of [p.start, p.goal, ...p.pickups]) assert.ok(!p.blocked.has(s));
    assert.equal(p.pickups.length, collect);
    assert.ok(p.cols <= 10 && p.rows <= 12);
  }
});

test('the bishop’s chest and pickups are on its colour', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const p = generateTreasureChess(6, 7, seed, 'bishop', 'long', 3, true);
    const colour = (s: number) => (s % p.cols + Math.floor(s / p.cols)) % 2;
    for (const s of [p.goal, ...p.pickups]) assert.equal(colour(s), colour(p.start), `seed ${seed}`);
  }
});

test('lengths are met on the default size', () => {
  const bands: Record<TreasureLength, [number, number]> = { short: [2, 3], medium: [4, 4], long: [5, 6] };
  for (const length of LENGTHS) for (const piece of PIECES) for (let seed = 1; seed <= 40; seed++) {
    const p = generateTreasureChess(6, 7, seed, piece, length, 1, true);
    const moves = p.route.length - 1;
    const [lo, hi] = bands[length];
    assert.ok(moves >= lo + 1 && moves <= hi + 1, `seed ${seed} ${piece} ${length}: ${moves}`);
  }
});

test('renders, and the same seed gives the same map', () => {
  const render = (seed: number) => renderToStaticMarkup(createElement(TreasureChess, {
    gridWidth: 6, gridHeight: 7, seed, showAnswers: true,
    config: { piece: 'mixed', length: 'medium', collect: 2, showMoves: true },
  }));
  assert.equal(render(5), render(5));
  assert.notEqual(render(5), render(6));
  assert.match(render(5), /Can you do it in \d+ moves\?/);
});
