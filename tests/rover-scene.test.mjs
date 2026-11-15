import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import * as THREE from '../src/vendor/three/three.module.min.js';
import { buildRoverScene, SELECTED_COLOR } from '../src/ui/rover-scene.js';
import { SUPPORTED_MATERIAL_IDS } from '../src/ui/rover-model.js';
import { findExternalResources } from '../scripts/size-budget.mjs';

const vendor = new URL('../src/vendor/three/', import.meta.url);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('vendored Three.js r187 matches recorded provenance, MIT license and local imports', async () => {
  assert.equal(THREE.REVISION, '187');
  assert.deepEqual((await readdir(vendor)).sort(), ['LICENSE', 'PROVENANCE.md', 'three.core.min.js', 'three.module.min.js']);
  const license = await readFile(new URL('LICENSE', vendor), 'utf8');
  assert.match(license, /^The MIT License/);
  assert.match(license, /Copyright © 2010-2026 three\.js authors/);
  assert.equal(sha256(Buffer.from(license)), '8b378ebe60e2fe500158cb0ac71cb5e8b7d92953c2abcc63a0eb90499653b5bc');
  const provenance = await readFile(new URL('PROVENANCE.md', vendor), 'utf8');
  for (const file of ['three.core.min.js', 'three.module.min.js']) {
    const bytes = await readFile(new URL(file, vendor));
    const text = bytes.toString('utf8');
    assert.ok(provenance.includes(sha256(bytes)), `${file} hash recorded`);
    assert.ok(provenance.includes(bytes.length.toLocaleString('en-US')), `${file} size recorded`);
    assert.match(text, /^\/\*\*\s*\n \* @license\n \* Copyright 2010-2026 Three\.js Authors\n \* SPDX-License-Identifier: MIT/);
    assert.deepEqual(findExternalResources(text), []);
    for (const [, spec] of text.matchAll(/(?:import|export)[^"']*?from\s*"([^"]+)"/g)) {
      assert.equal(spec, './three.core.min.js', `${file} imports only the sibling core build`);
    }
  }
});

test('viewer loads Three.js lazily, module-relative, with no CDN or bare specifier', async () => {
  const source = await readFile(new URL('../src/ui/rover-viewer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /^\s*import\s[^(]*vendor\/three/m, 'no static Three.js import');
  assert.match(source, /import\(\s*['"]\.\.\/vendor\/three\/three\.module\.min\.js['"]\s*\)/);
  assert.doesNotMatch(source, /from\s+['"]three['"]|unpkg|jsdelivr|cdn\./i);
  for (const file of ['rover-viewer.js', 'rover-scene.js', 'rover-model.js']) {
    const text = await readFile(new URL(`../src/ui/${file}`, import.meta.url), 'utf8');
    assert.ok(text.split('\n').length < 500, `${file} under 500 lines`);
    assert.doesNotMatch(text, /requestAnimationFrame\s*\(\s*(?:loop|tick|animate)\b|setAnimationLoop|shadowMap\.enabled\s*=\s*true|TextureLoader|GLTFLoader|autoRotate\s*=\s*true/);
  }
});

test('cutaway scene maps every material to parts, stays under 100 draw calls', () => {
  const rover = buildRoverScene(THREE);
  for (const id of SUPPORTED_MATERIAL_IDS) {
    const meshes = rover.partMeshes(id);
    assert.ok(meshes.length > 0, id);
    assert.ok(meshes.every(mesh => mesh.userData.materialId === id));
    assert.ok(rover.anchors.get(id) instanceof THREE.Vector3);
  }
  assert.ok(rover.pickables.length >= 4);
  rover.setLayer('shell');
  const shellCalls = rover.drawCalls();
  rover.setLayer('cutaway');
  const cutawayCalls = rover.drawCalls();
  assert.ok(shellCalls < 100 && cutawayCalls < 100, `${shellCalls}/${cutawayCalls}`);
  assert.ok(shellCalls > cutawayCalls, 'cutaway hides shell panels');
  let lights = 0; let shadows = 0;
  rover.scene.traverse(object => {
    if (object.isLight) lights += 1;
    if (object.castShadow || object.receiveShadow) shadows += 1;
    if (object.material) for (const material of [object.material].flat()) assert.equal(material.map ?? null, null, 'no textures');
  });
  assert.ok(lights <= 3);
  assert.equal(shadows, 0);
  assert.ok(rover.radius > 0);
  rover.dispose();
});

test('selection is neutral blue, never evidence red, and dims parts outside the request', () => {
  const rover = buildRoverScene(THREE);
  const color = id => rover.partMeshes(id)[0].material.color.clone();
  const before = color('nomex');
  rover.applyState({ highlightId: 'nomex', inRequest: new Set(SUPPORTED_MATERIAL_IDS) });
  const selected = color('nomex');
  assert.equal(selected.getHex(), SELECTED_COLOR);
  assert.ok(selected.b > selected.r, 'selected is blue, not red/orange');
  assert.notEqual(color('pmma').getHex(), SELECTED_COLOR);
  rover.applyState({ highlightId: null, inRequest: new Set(['pmma']) });
  assert.equal(color('nomex').getHex(), before.getHex());
  assert.ok(rover.partMeshes('nomex')[0].material.opacity < 1, 'removed material is visibly dimmed');
  assert.equal(rover.partMeshes('pmma')[0].material.opacity, rover.partMeshes('pmma')[0].userData.baseOpacity);
  rover.scene.traverse(object => {
    if (object.material) for (const material of [object.material].flat()) {
      const { r, g, b } = material.color;
      assert.ok(!(r > 0.8 && g < 0.5 && b < 0.4), `${object.name} must not use evidence red/orange`);
    }
  });
  rover.setWireframe(true);
  assert.ok(rover.partMeshes('pmma').every(mesh => mesh.material.wireframe));
  rover.setWireframe(false);
  rover.dispose();
});

test('dispose releases every owned geometry and material exactly once', () => {
  const rover = buildRoverScene(THREE);
  const geometries = new Set(); const materials = new Set();
  rover.scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) [object.material].flat().forEach(material => materials.add(material));
  });
  let disposed = 0;
  for (const item of [...geometries, ...materials]) item.addEventListener('dispose', () => { disposed += 1; });
  rover.dispose();
  assert.equal(disposed, geometries.size + materials.size);
  rover.dispose();
  assert.equal(disposed, geometries.size + materials.size, 'second dispose is a no-op');
});
