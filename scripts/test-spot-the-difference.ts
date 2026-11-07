// Run with:
// node_modules/.bin/esbuild scripts/test-spot-the-difference.ts --bundle --platform=node --jsx=automatic --outfile=/tmp/spot-difference-test.cjs
// node --test /tmp/spot-difference-test.cjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Scene from '../src/components/puzzles/SpotTheDifference/Scene';
import { FEATURES, generateScene, type Feature, type GardenScene } from '../src/components/puzzles/SpotTheDifference/generator';

function render(scene: GardenScene, second: boolean, outline = false, answers = false) {
  return renderToStaticMarkup(createElement(Scene, { scene, second, outline, answers }))
    .replace(/aria-label="[^"]*"/, '');
}

test('seeds reproduce scenes, counts are exact, and more differences keep previous answers', () => {
  const scenes = new Set<string>();
  for (let seed = 0; seed < 1000; seed++) {
    const small = generateScene(seed, 3);
    const medium = generateScene(seed, 5);
    const large = generateScene(seed, 7);
    assert.deepEqual(small, generateScene(seed, 3));
    for (const [scene, count] of [[small, 3], [medium, 5], [large, 7]] as const) {
      assert.equal(scene.changes.length, count);
      assert.equal(new Set(scene.changes).size, count);
      assert.ok(scene.changes.every(key => key in FEATURES));
    }
    assert.deepEqual(medium.changes.slice(0, 3), small.changes);
    assert.deepEqual(large.changes.slice(0, 5), medium.changes);
    assert.deepEqual(large.variants, small.variants);
    scenes.add(JSON.stringify(large));
  }
  assert.equal(scenes.size, 1000);
});

test('each named change alters the SVG in colour and outline, with either starting variant', () => {
  for (const outline of [false, true]) {
    for (const feature of Object.keys(FEATURES) as Feature[]) {
      for (const value of [0, 1]) {
        const scene = generateScene(42, 3);
        scene.variants[feature] = value;
        scene.changes = [];
        assert.equal(render(scene, false, outline), render(scene, true, outline));
        scene.changes = [feature];
        assert.notEqual(render(scene, false, outline), render(scene, true, outline), feature);
        // Switching that feature on the original produces precisely the second image.
        const changed = { ...scene, changes: [], variants: { ...scene.variants, [feature]: value ^ 1 } };
        assert.equal(render(changed, false, outline), render(scene, true, outline), feature);
      }
    }
  }
});

test('answer marks appear only when requested, with one circle per difference', () => {
  for (let seed = 0; seed < 30; seed++) {
    for (const count of [3, 5, 7] as const) {
      const scene = generateScene(seed, count);
      assert.equal((render(scene, true, false, true).match(/stroke-dasharray="7 4"/g) ?? []).length, count);
      assert.equal((render(scene, false, false, true).match(/stroke-dasharray/g) ?? []).length, 0);
      assert.equal((render(scene, true).match(/stroke-dasharray/g) ?? []).length, 0);
    }
  }
  for (const { x, y, radius } of Object.values(FEATURES)) {
    assert.ok(x - radius > 0 && x + radius < 600);
    assert.ok(y - radius > 0 && y + radius < 390);
  }
});
