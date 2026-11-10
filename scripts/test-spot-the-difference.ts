// Run with:
// node_modules/.bin/esbuild scripts/test-spot-the-difference.ts --bundle --platform=node --jsx=automatic --outfile=/tmp/spot-difference-test.cjs
// node --test /tmp/spot-difference-test.cjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Scene from '../src/components/puzzles/SpotTheDifference/Scene';
import { FEATURES, PROPS, SCENES, featureSpec, generateScene, type Feature, type GeneratedScene } from '../src/components/puzzles/SpotTheDifference/generator';
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
      for (const key of Object.keys(FEATURES) as Feature[]) {
        assert.ok(large.variants[key] >= 0 && large.variants[key] < large.features[key].versions);
        assert.ok(large.swaps[key] >= 0 && large.swaps[key] < large.features[key].versions);
        assert.notEqual(large.swaps[key], large.variants[key]);
      }
      assert.deepEqual(medium.changes.slice(0, 3), small.changes);
      assert.deepEqual(large.changes.slice(0, 5), medium.changes);
      assert.deepEqual(large.variants, small.variants);
      assert.deepEqual(large.swaps, small.swaps);
      assert.deepEqual(large.props, small.props);
      scenes.add(JSON.stringify(large));
    }
    assert.equal(scenes.size, 1000);
  }
});

/** Every ordered pair of versions of one part: the original, and what it changes to. */
function versionPairs(count: number) {
  return Array.from({ length: count * count }, (_, i) => [Math.floor(i / count), i % count]).filter(([a, b]) => a !== b);
}

/** A scene whose only change turns `key` from version `from` into version `to`. */
function changing(scene: GeneratedScene, key: Feature, from: number, to: number): GeneratedScene {
  return { ...scene, changes: [key], variants: { ...scene.variants, [key]: from }, swaps: { ...scene.swaps, [key]: to } };
}

/** The scene with object `id` standing in slot `key`. */
function withProp(scene: GeneratedScene, key: Feature, id: string): GeneratedScene {
  return { ...scene, props: { ...scene.props, [key]: id }, features: { ...scene.features, [key]: featureSpec(scene.theme, key, id) } };
}

/** Every object that can stand in a slot; a slot without a choice has one. */
const objects = (id: GeneratedScene['theme'], key: Feature) => PROPS[id][key]?.map(prop => prop.id) ?? [undefined];

test('every pair of versions of every object alters the SVG in colour and outline', () => {
  for (const { id } of SCENES) {
    for (const outline of [false, true]) {
      for (const feature of Object.keys(FEATURES) as Feature[]) {
        for (const object of objects(id, feature)) {
          const base = object ? withProp(generateScene(42, 3, id), feature, object) : generateScene(42, 3, id);
          for (const [from, to] of versionPairs(base.features[feature].versions)) {
            const scene = changing(base, feature, from, to);
            const name = `${id}/${feature}/${object ?? ''} ${from}→${to}`;
            assert.equal(render({ ...scene, changes: [] }, false, outline), render({ ...scene, changes: [] }, true, outline));
            assert.notEqual(render(scene, false, outline), render(scene, true, outline), name);
            // Switching that feature on the original produces precisely the second image.
            const changed = { ...scene, changes: [], variants: { ...scene.variants, [feature]: to } };
            assert.equal(render(changed, false, outline), render(scene, true, outline), name);
          }
        }
      }
    }
  }
});

test('objects in the same slot draw differently, and each names its own change', () => {
  for (const { id } of SCENES) {
    for (const feature of Object.keys(FEATURES) as Feature[]) {
      const pool = PROPS[id][feature];
      if (!pool) continue;
      const base = generateScene(42, 3, id);
      const drawings = pool.map(({ id: object }) => {
        const scene = withProp(base, feature, object);
        return render({ ...scene, variants: { ...scene.variants, [feature]: 0 } }, false);
      });
      assert.equal(new Set(drawings).size, pool.length, `${id}/${feature}`);
      assert.equal(new Set(pool.map(({ id: object }) => featureSpec(id, feature, object).label)).size, pool.length, `${id}/${feature} labels`);
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
        const layout = sceneLayout(aspect, scene);
        for (const key of Object.keys(FEATURES) as Feature[]) {
          const feature = scene.features[key];
          const p = layout.point(FEATURE_PART[key], feature.x, feature.y);
          const radius = feature.radius * layout.partScale(FEATURE_PART[key]);
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


test('rerolls rearrange objects independently of mirroring and keep composition stable across difficulty', () => {
  const arrangements = new Set<string>();
  const pets = new Set<string | undefined>();
  const background = new Set<boolean>();
  const foreground = new Set<boolean>();
  for (let seed = 0; seed < 100; seed++) {
    const scene = generateScene(seed, 3);
    const harder = generateScene(seed, 7);
    arrangements.add((['flower', 'cat', 'can'] as const).map(part => scene.placements[part]!.x.toFixed(0)).join(','));
    pets.add(scene.props.cat);
    background.add(scene.backgroundFlipped);
    foreground.add(scene.foregroundFlipped);
    assert.deepEqual(scene.placements, harder.placements);
    assert.deepEqual(scene.props, harder.props);
    assert.equal(scene.backgroundFlipped, harder.backgroundFlipped);
    assert.equal(scene.foregroundFlipped, harder.foregroundFlipped);
  }
  assert.ok(arrangements.size > 80);
  assert.equal(pets.size, PROPS.garden.cat!.length);
  assert.equal(background.size, 2);
  assert.equal(foreground.size, 2);
});

test('random layouts keep foreground footprints separate and answer circles within every panel size', () => {
  // Conservative art footprints including both difference variants.
  const footprints = {
    flower: [18, 115, 277, 365], cat: [132, 225, 280, 356],
    can: [245, 336, 277, 360], pond: [405, 573, 278, 375],
  } as const;
  for (let columns = 6; columns <= 10; columns++) {
    for (let rows = 5; rows <= 14; rows++) {
      const { aspect } = pictureLayout(columns, rows);
      for (const { id } of SCENES) {
        for (let seed = 0; seed < 100; seed++) {
          const scene = generateScene(seed, 7, id);
          const layout = sceneLayout(aspect, scene);
          for (const key of Object.keys(FEATURES) as Feature[]) {
            const { x, y, radius } = scene.features[key];
            const part = FEATURE_PART[key];
            const p = layout.point(part, x, y);
            const r = radius * layout.partScale(part);
            assert.ok(p.x - r > 2 && p.x + r < layout.width - 2, `${id}/${seed}/${columns}x${rows}/${key}: x`);
            assert.ok(p.y - r > 2 && p.y + r < layout.height - 2, `${id}/${seed}/${columns}x${rows}/${key}: y`);
          }
          const boxes = Object.entries(footprints).map(([part, [left, right, top, bottom]]) => {
            const a = layout.point(part as keyof typeof footprints, left, top);
            const b = layout.point(part as keyof typeof footprints, right, bottom);
            return { left: Math.min(a.x, b.x), right: Math.max(a.x, b.x), top: a.y, bottom: b.y };
          }).sort((a, b) => a.left - b.left);
          boxes.forEach((box, i) => {
            assert.ok(box.left > 2 && box.right < layout.width - 2);
            assert.ok(box.top > 2 && box.bottom < layout.height - 2);
            if (i) assert.ok(box.left > boxes[i - 1].right, `${id}/${seed}: foreground overlap`);
          });
        }
      }
    }
  }
});

test('rerolls bring out every object in every slot, with its own answer', () => {
  for (const { id } of SCENES) {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const scene = generateScene(seed, 3, id);
      for (const [feature, object] of Object.entries(scene.props) as [Feature, string][]) {
        seen.add(`${feature}/${object}`);
        assert.deepEqual(scene.features[feature], featureSpec(id, feature, object));
      }
    }
    const all = (Object.entries(PROPS[id]) as [Feature, { id: string }[]][]).flatMap(([feature, pool]) => pool.map(prop => `${feature}/${prop.id}`));
    assert.deepEqual([...seen].sort(), all.sort(), id);
  }
});

test('every object’s answer circle stays inside the picture at every size', () => {
  for (let columns = 6; columns <= 10; columns++) {
    for (let rows = 5; rows <= 14; rows++) {
      const { aspect } = pictureLayout(columns, rows);
      for (const { id } of SCENES) {
        for (let seed = 0; seed < 20; seed++) {
          for (const [feature, pool] of Object.entries(PROPS[id]) as [Feature, { id: string }[]][]) {
            for (const { id: object } of pool) {
              const scene = withProp(generateScene(seed, 7, id), feature, object);
              const layout = sceneLayout(aspect, scene);
              const { x, y, radius } = scene.features[feature];
              const part = FEATURE_PART[feature];
              const p = layout.point(part, x, y);
              const r = radius * layout.partScale(part);
              assert.ok(p.x - r > 2 && p.x + r < layout.width - 2 && p.y - r > 2 && p.y + r < layout.height - 2, `${id}/${object}/${columns}x${rows}`);
            }
          }
        }
      }
    }
  }
});
