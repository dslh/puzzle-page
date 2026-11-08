// Run: node_modules/.bin/esbuild scripts/test-answer-keys.ts --bundle --platform=node --jsx=automatic --loader:.css=empty --outfile=/tmp/puzzle-answer-tests.cjs && node --test /tmp/puzzle-answer-tests.cjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SpotTheDifference from '../src/components/puzzles/SpotTheDifference';
import Sudoku from '../src/components/puzzles/Sudoku';
import { generateSudoku } from '../src/components/puzzles/Sudoku/generator';
import { answerPath } from '../src/utils/answerPath';
import { generateMaze } from '../src/components/puzzles/Maze/generator';
import { generateWeavingMaze, weavingAnswer } from '../src/components/puzzles/WeavingMaze/generator';
import { generateDirections, directionsAnswer, type DirectionsMode, type Notation } from '../src/components/puzzles/Directions/generator';
import { EASY_PUZZLES, MEDIUM_PUZZLES, HARD_PUZZLES, CAPTURE_EASY_PUZZLES, CAPTURE_MEDIUM_PUZZLES, CAPTURE_HARD_PUZZLES } from '../src/components/puzzles/Chess/puzzleData';
import { parseFEN, applyMove } from '../src/components/puzzles/Chess/fenParser';

test('graph answers handle start, finish and unreachable goals', () => {
  assert.deepEqual(answerPath(0, 2, n => [[1], [0, 2], [1]][n]), [0, 1, 2]);
  assert.deepEqual(answerPath(1, 1, () => []), [1]);
  assert.deepEqual(answerPath(0, 2, () => []), []);
});

test('maze answers join neighboring cells through openings for every grid shape', () => {
  const shapes = ['square', 'hex', 'triangle', 'rhombille', 'snubsquare', 'cairo', 'voronoi', 'circle', 'hexring', 'octring', 'heart', 'star'] as const;
  for (const shape of shapes) for (let seed = 1; seed <= 12; seed++) {
    const maze = generateMaze(8, 8, seed, 'medium', shape);
    assert.equal(maze.solution[0], maze.start);
    assert.equal(maze.solution.at(-1), maze.end);
    for (let i = 1; i < maze.solution.length; i++) {
      const from = maze.cells[maze.solution[i - 1]], next = maze.solution[i];
      const sides = from.neighbors.flatMap((n, side) => n === next ? [side] : []);
      assert.ok(sides.length > 0);
      for (const side of sides) {
        const a = from.corners[side], b = from.corners[(side + 1) % from.corners.length];
        assert.ok(!maze.walls.some(w =>
          (w.from.x === a.x && w.from.y === a.y && w.to.x === b.x && w.to.y === b.y) ||
          (w.from.x === b.x && w.from.y === b.y && w.to.x === a.x && w.to.y === a.y)));
      }
    }
  }
});

test('weaving answers traverse bridges only between their endpoints', () => {
  for (const density of ['few', 'medium', 'many'] as const) for (let seed = 0; seed < 50; seed++) {
    const maze = generateWeavingMaze(10, 10, seed, density);
    const route = weavingAnswer(maze);
    assert.deepEqual(route[0], maze.start);
    assert.deepEqual(route.at(-1), maze.end);
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1], b = route[i], cell = maze.grid[a.y][a.x];
      const dx = b.x - a.x, dy = b.y - a.y;
      const ordinary = (dx === 1 && dy === 0 && cell.connections.right) || (dx === -1 && dy === 0 && cell.connections.left)
        || (dy === 1 && dx === 0 && cell.connections.bottom) || (dy === -1 && dx === 0 && cell.connections.top);
      assert.ok(ordinary || maze.bridges.some(bridge =>
        (bridge.start.x === a.x && bridge.start.y === a.y && bridge.end.x === b.x && bridge.end.y === b.y) ||
        (bridge.end.x === a.x && bridge.end.y === a.y && bridge.start.x === b.x && bridge.start.y === b.y)));
    }
  }
});

test('directions answers reach the goal without crossing obstacles and fit the printed boxes', () => {
  for (const mode of ['follow', 'write', 'fix'] as DirectionsMode[])
    for (const notation of ['arrows', 'counts', 'words'] as Notation[])
      for (const size of [[4, 4], [5, 6], [8, 7]]) for (let seed = 0; seed < 20; seed++) {
        const puzzle = generateDirections(size[0], size[1], seed, mode, notation, 'long', seed % 2 === 0);
        const snapshot = JSON.stringify(puzzle);
        const tokens = directionsAnswer(puzzle, mode, notation);
        assert.equal(JSON.stringify(puzzle), snapshot, 'answer computation must not mutate the puzzle');
        if (mode === 'write') assert.ok(tokens.length <= puzzle.boxCount);
        let { x, y } = puzzle.start;
        for (const token of tokens) for (let step = 0; step < token.count; step++) {
          x += token.dir === 'right' ? 1 : token.dir === 'left' ? -1 : 0;
          y += token.dir === 'down' ? 1 : token.dir === 'up' ? -1 : 0;
          assert.ok(x >= 0 && x < puzzle.cols && y >= 0 && y < puzzle.rows);
          assert.ok(!puzzle.blocked.has(`${x},${y}`));
        }
        assert.deepEqual({ x, y }, puzzle.goal);
      }
});

test('every chess source record supplies a solution for the side to move', () => {
  for (const puzzle of [...EASY_PUZZLES, ...MEDIUM_PUZZLES, ...HARD_PUZZLES, ...CAPTURE_EASY_PUZZLES, ...CAPTURE_MEDIUM_PUZZLES, ...CAPTURE_HARD_PUZZLES]) {
    const position = applyMove(parseFEN(puzzle.fen), puzzle.setupMove);
    assert.ok(puzzle.solution.length > 0);
    const move = puzzle.solution[0];
    assert.match(move, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
    const piece = position.board[8 - Number(move[1])][move.charCodeAt(0) - 97];
    assert.ok(piece);
    assert.equal(piece === piece.toUpperCase() ? 'w' : 'b', position.activeColor);
  }
});


test('legacy Spot the Difference answer settings cannot reveal a worksheet answer', () => {
  const props = { gridWidth: 10, gridHeight: 5, seed: 42,
    config: { scene: 'garden' as const, differences: 3 as const, outline: true, answers: true } };
  const worksheet = renderToStaticMarkup(createElement(SpotTheDifference, props));
  const key = renderToStaticMarkup(createElement(SpotTheDifference, { ...props, showAnswers: true }));
  assert.ok(!worksheet.includes('data-answer='));
  assert.equal((key.match(/data-answer="path"/g) ?? []).length, 3);
  assert.ok(key.includes('var(--answer-ink)'), 'outline puzzles use the same red as coloured puzzles');
});

test('Sudoku reveals only missing cells and preserves the solution colours', () => {
  for (const size of [3, 4, 5] as const) {
    const props = { gridWidth: 4, gridHeight: 4, seed: 42, config: { size, symbolType: 'colors' as const } };
    const puzzle = generateSudoku(size, props.seed);
    const worksheet = renderToStaticMarkup(createElement(Sudoku, props));
    const key = renderToStaticMarkup(createElement(Sudoku, { ...props, showAnswers: true }));
    const missing = puzzle.grid.flat().filter(cell => !cell.isGiven).length;
    assert.ok(!worksheet.includes('data-answer='));
    assert.equal((key.match(/data-answer="box"/g) ?? []).length, missing);
    for (const colour of ['red', 'green', 'blue', 'yellow', 'pink'].slice(0, size)) {
      assert.equal((key.match(new RegExp(`background-color:${colour}`, 'g')) ?? []).length, size);
    }
  }
});

test('flowing ink keeps endpoints exact and rounds bends within local clearance', async () => {
  const { flowingPath } = await import('../src/utils/flowingPath');
  assert.equal(flowingPath([]), '');
  const d = flowingPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 2, 0.1);
  assert.ok(d.startsWith('M0 0C'));
  assert.ok(d.includes('Q10 0 10 2'));
  assert.ok(d.endsWith('10 10'));
  assert.ok(!d.includes('NaN'));
  assert.equal(flowingPath([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 1).includes('NaN'), false);
});

test('laser reflections stay on the glass, with distinct contacts for opposite faces', async () => {
  const { generateLaserMaze } = await import('../src/components/puzzles/LaserMaze/generator');
  const { laserAnswerPoints } = await import('../src/components/puzzles/LaserMaze/answer');
  let doubleReflections = 0;
  for (let seed = 0; seed < 500; seed++) {
    const puzzle = generateLaserMaze(7, 7, seed);
    const points = laserAnswerPoints(puzzle);
    const hits = puzzle.solutionPath.filter(p => puzzle.mirrors[p.y][p.x]);
    const contacts = new Map<string, { x: number; y: number }>();
    assert.equal(points.length, hits.length + 2);
    for (let i = 0; i < hits.length; i++) {
      const hit = hits[i], contact = points[i + 1];
      const mirror = puzzle.mirrors[hit.y][hit.x];
      const dx = contact.x - hit.x - 0.5, dy = contact.y - hit.y - 0.5;
      assert.ok(Math.abs(mirror === '/' ? dx + dy : dx - dy) < 1e-10, 'contact lies on the mirror');
      assert.ok(Math.abs(dx) < 0.36 && Math.abs(dy) < 0.36, 'contact stays within the drawn glass');
      // Both neighboring segments must stay on the same face, never pass through.
      const side = (p: { x: number; y: number }) => p.x - hit.x - 0.5 + (mirror === '/' ? 1 : -1) * (p.y - hit.y - 0.5);
      assert.ok(side(points[i]) * side(points[i + 2]) > 0, 'beam reflects on one face');
      const key = `${hit.x},${hit.y}`;
      const previous = contacts.get(key);
      if (previous) {
        doubleReflections++;
        assert.ok(Math.hypot(contact.x - previous.x, contact.y - previous.y) > 0.25, 'opposite reflections do not merge');
      }
      contacts.set(key, contact);
    }
  }
  assert.ok(doubleReflections > 0, 'exercise mirrors hit on both faces');
});
