// Run with:
// node_modules/.bin/esbuild scripts/test-spot-the-difference.ts --bundle --platform=node --jsx=automatic --outfile=/tmp/spot-difference-test.cjs
// node --test /tmp/spot-difference-test.cjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Scene from '../src/components/puzzles/SpotTheDifference/Scene';
import { FEATURES, SCENES, generateScene, type Feature, type GeneratedScene } from '../src/components/puzzles/SpotTheDifference/generator';
import { FEATURE_PART, pictureLayout, sceneLayout } from '../src/components/puzzles/SpotTheDifference/layout';

function render(scene: GeneratedScene, second: boolean, outline = false, answers = false, aspect?: number) {
  return renderToStaticMarkup(createElement(Scene, { scene, second, outline, answers, aspect }))
    .replace(/aria-label="[^"]*"/, '');
}

test('seeds reproduce scenes, counts are exact, and more differences keep previous answers', () => {
  for (const { id } of SCENES) {
    const scenes = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const small = generateScene(seed, 3, id);
      const medium = generateScene(seed, 5, id);
      const large = generateScene(seed, 7, id);
      assert.deepEqual(small, generateScene(seed, 3, id));
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
  }
});

test('each named change alters the SVG in colour and outline, with either starting variant', () => {
  for (const { id } of SCENES) {
    for (const outline of [false, true]) {
      for (const feature of Object.keys(FEATURES) as Feature[]) {
        for (const value of [0, 1]) {
          const scene = generateScene(42, 3, id);
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
  }
});

test('answer marks appear only when requested, with one circle per difference', () => {
  for (const { id } of SCENES) {
    for (let seed = 0; seed < 30; seed++) {
      for (const count of [3, 5, 7] as const) {
        const scene = generateScene(seed, count, id);
        assert.equal((render(scene, true, false, true).match(/stroke-dasharray="7 4"/g) ?? []).length, count);
        assert.equal((render(scene, false, false, true).match(/stroke-dasharray/g) ?? []).length, 0);
        assert.equal((render(scene, true).match(/stroke-dasharray/g) ?? []).length, 0);
      }
    }
  }
  for (const { x, y, radius } of Object.values(FEATURES)) {
    assert.ok(x - radius > 0 && x + radius < 600);
    assert.ok(y - radius > 0 && y + radius < 390);
  }
});

test('every allowed puzzle size fills its panels and keeps all answer areas in view', () => {
  assert.equal(pictureLayout(10, 5).across, true);
  assert.equal(pictureLayout(8, 8).across, false);
  for (let columns = 6; columns <= 10; columns++) {
    for (let rows = 5; rows <= 14; rows++) {
      const { aspect } = pictureLayout(columns, rows);
      const layout = sceneLayout(aspect);
      assert.ok(Math.abs(layout.width / layout.height - aspect) < 1e-10);
      for (const { id } of SCENES) {
        const scene = generateScene(42, 7, id);
        for (const key of Object.keys(FEATURES) as Feature[]) {
          const feature = scene.features[key];
          const p = layout.point(FEATURE_PART[key], feature.x, feature.y);
          const radius = feature.radius * layout.scale;
          assert.ok(p.x - radius > 0 && p.x + radius < layout.width, `${columns}×${rows}: ${key} horizontally`);
          assert.ok(p.y - radius > 0 && p.y + radius < layout.height, `${columns}×${rows}: ${key} vertically`);
        }
        assert.equal(render({ ...scene, changes: [] }, false, false, false, aspect), render({ ...scene, changes: [] }, true, false, false, aspect));
        assert.equal((render(scene, true, true, true, aspect).match(/stroke-dasharray="7 4"/g) ?? []).length, 7);
      }
    }
  }
});

test('surprise me covers every setting and stays stable when changing difficulty', () => {
  const themes = new Set<string>();
  for (let seed = 0; seed < 200; seed++) {
    const scene = generateScene(seed, 3, 'random');
    themes.add(scene.theme);
    assert.deepEqual(scene, generateScene(seed, 3, scene.theme));
    assert.equal(scene.theme, generateScene(seed, 7, 'random').theme);
    assert.equal(generateScene(seed, 3).theme, 'garden');
  }
  assert.deepEqual([...themes].sort(), SCENES.map(scene => scene.id).sort());
});
