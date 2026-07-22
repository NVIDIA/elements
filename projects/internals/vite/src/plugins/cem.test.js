import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCustomDataOutputs } from './cem.js';

const packageDirectory = '/package';

function createManifest(tagNames = []) {
  return {
    modules: [
      {
        declarations: tagNames.map(tagName => ({ tagName }))
      }
    ]
  };
}

function createPackageJson(customData) {
  return {
    name: '@nvidia-elements/example',
    contributes: customData === undefined ? {} : { html: { customData } }
  };
}

test('uses the declared Custom Data output path', () => {
  assert.deepEqual(
    getCustomDataOutputs(
      createPackageJson(['./dist/editor/custom-data.json']),
      createManifest(['nve-example']),
      packageDirectory
    ),
    [
      {
        outdir: '/package/dist/editor',
        htmlFileName: 'custom-data.json'
      }
    ]
  );
});

test('requires a Custom Data contribution when the manifest declares tags', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson(), createManifest(['nve-example']), packageDirectory),
    /Custom Elements Manifest declares tags/
  );
});

test('rejects an empty Custom Data contribution', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson([]), createManifest(['nve-example']), packageDirectory),
    /must be a non-empty array/
  );
});

test('does not generate Custom Data when the manifest has no tags', () => {
  assert.deepEqual(
    getCustomDataOutputs(createPackageJson(['./dist/data.html.json']), createManifest(), packageDirectory),
    []
  );
});

test('does not generate Custom Data for sparse manifests', () => {
  for (const manifest of [{}, { modules: [{}] }]) {
    assert.deepEqual(
      getCustomDataOutputs(createPackageJson(['./dist/data.html.json']), manifest, packageDirectory),
      []
    );
  }
});

test('rejects traversal and absolute Custom Data paths before checking manifest tags', () => {
  for (const manifest of [createManifest(), createManifest(['nve-example'])]) {
    for (const customDataPath of ['../dist/data.html.json', '/package/dist/data.html.json']) {
      assert.throws(
        () => getCustomDataOutputs(createPackageJson([customDataPath]), manifest, packageDirectory),
        /must be package-relative/
      );
    }
  }
});

test('rejects malformed Custom Data contributions', () => {
  assert.throws(
    () => getCustomDataOutputs(createPackageJson(['./dist/data.html.json', 1]), createManifest(), packageDirectory),
    /must be a non-empty array/
  );
});
