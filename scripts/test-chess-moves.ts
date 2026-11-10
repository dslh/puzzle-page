// Bundle with esbuild --platform=node --jsx=automatic --loader:.css=empty --loader:.svg=text, then node --test.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChessMoves from '../src/components/puzzles/ChessMoves';
import { PIECES, generateBoards, movesFrom, movesLayout, type BoardSize, type CollectBoard } from '../src/components/puzzles/ChessMoves/generator';

const SIZES: BoardSize[] = [4, 5, 6];

test('pieces move by the rules and stop before their own pawns', () => {
  assert.deepEqual(movesFrom('rook', 0, 4, new Set([2])).sort((a, b) => a - b), [1, 4, 8, 12]);
  assert.deepEqual(movesFrom('bishop', 0, 4, new Set()).sort((a, b) => a - b), [5, 10, 15]);
  assert.equal(movesFrom('king', 5, 4, new Set()).length, 8);
  assert.deepEqual(movesFrom('knight', 0, 4, new Set([1, 4, 9])).sort((a, b) => a - b), [6]);
  assert.equal(movesFrom('queen', 12, 5, new Set()).length, 16);
});

test('dot boards have at least three answers, and pawns stand in the way', () => {
  for (const boardSize of SIZES) for (const blockers of [false, true]) for (let seed = 1; seed <= 300; seed++) {
    for (const board of generateBoards(seed, 6, { mode: 'where', piece: 'mixed', boardSize, blockers, stars: 2 })) {
      assert.equal(board.mode, 'where');
      if (board.mode !== 'where') continue;
      assert.ok(board.reach.length >= 3, `seed ${seed}`);
      assert.ok(!board.blockers.includes(board.at));
      if (blockers) {
        const open = new Set(movesFrom(board.piece, board.at, board.n, new Set()));
        assert.ok(board.blockers.some(b => open.has(b)), `seed ${seed} ${board.piece}`);
      }
    }
  }
});

test('star routes are legal, land on every star, and fit the move range', () => {
  let outOfRange = 0, total = 0;
  for (const piece of PIECES) for (const boardSize of SIZES) for (const stars of [1, 2, 3, 4]) for (const blockers of [false, true]) {
    for (let seed = 1; seed <= 40; seed++) {
      const [board] = generateBoards(seed, 1, { mode: 'collect', piece, boardSize, blockers, stars }) as CollectBoard[];
      const blocked = new Set(board.blockers);
      assert.equal(board.route[0], board.at);
      for (let i = 1; i < board.route.length; i++) {
        assert.ok(movesFrom(piece, board.route[i - 1], boardSize, blocked).includes(board.route[i]));
      }
      for (const star of board.stars) assert.ok(board.route.slice(1).includes(star));
      const moves = board.route.length - 1;
      total++;
      if (moves < Math.max(2, stars) || moves > stars + 3) outOfRange++;
    }
  }
  assert.ok(outOfRange / total < 0.01, `${outOfRange} of ${total} out of range`);
});

test('bigger puzzles keep their first boards', () => {
  const options = { mode: 'where' as const, piece: 'mixed' as const, boardSize: 5 as const, blockers: true, stars: 2 };
  assert.deepEqual(generateBoards(9, 2, options), generateBoards(9, 6, options).slice(0, 2));
});

test('layouts fit on the puzzle at every size', () => {
  for (let w = 4; w <= 10; w++) for (let h = 4; h <= 14; h++) for (const n of SIZES) for (const mode of ['where', 'collect'] as const) {
    const layout = movesLayout(w, h, n, mode, 19);
    assert.ok(layout.origins.length >= 1 && layout.origins.length <= 6);
    for (const [x, y] of layout.origins) {
      assert.ok(x >= 0 && y >= 9 - 1e-9 &&x + n * layout.square <= layout.width + 1e-9 && y + n * layout.square <= layout.height + 1e-9, `${w}x${h} n${n} ${mode}`);
    }
  }
  assert.equal(movesLayout(6, 6, 5, 'where', 19).origins.length, 4);
  assert.equal(movesLayout(8, 5, 5, 'collect', 19).origins.length, 2);
});

test('renders with and without answers', () => {
  for (const mode of ['where', 'collect'] as const) {
    const config = { mode, piece: 'mixed' as const, boardSize: 5 as const, blockers: true, stars: 3, showMoves: true, workedExample: true };
    const plain = renderToStaticMarkup(createElement(ChessMoves, { gridWidth: 8, gridHeight: 8, seed: 4, config }));
    const answered = renderToStaticMarkup(createElement(ChessMoves, { gridWidth: 8, gridHeight: 8, seed: 4, config, showAnswers: true }));
    assert.ok(!plain.includes('answer'));
    assert.ok(answered.includes('data-answer'));
    assert.ok(plain.includes('data-worked-example'));
  }
});
