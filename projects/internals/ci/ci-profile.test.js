import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { it } from 'node:test';
import { copyProfileArtifacts } from './ci-profile.js';

it('replaces numbered sample artifacts while preserving canonical reports', t => {
  const root = mkdtempSync(path.join(tmpdir(), 'ci-profile-artifacts-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const destination = path.join(root, 'destination');
  mkdirSync(source);
  mkdirSync(destination);

  const preserved = {
    'ci-profile.json': '{"canonical":true}',
    'ci-profile.md': '# Existing report\n',
    'ci-profile-run-summary.json': 'summary',
    'notes.txt': 'notes'
  };
  for (const [name, contents] of Object.entries(preserved)) {
    writeFileSync(path.join(destination, name), contents);
  }
  for (const name of [
    'ci-profile-run-1.json',
    'ci-profile-run-1-ci.log.resources.json',
    'ci-profile-run-1-vale.log',
    'ci-profile-run-2-ci.log',
    'ci-profile-run-2.log',
    'ci-profile-run-2-reset.log',
    'ci-profile-reset-2.log',
    'ci-profile-run-3-phases.json',
    'ci-profile-run-10.json',
    'ci-profile-phases-1-previous.jsonl',
    'ci-profile-phases-3-previous.jsonl'
  ]) {
    writeFileSync(path.join(destination, name), 'stale');
  }

  writeFileSync(path.join(source, 'run-1.json'), '{"run":1}');
  writeFileSync(path.join(source, 'run-1-ci.log'), 'current CI');
  writeFileSync(path.join(source, 'run-1-reset.log'), 'current reset');
  mkdirSync(path.join(source, 'phases-1'));
  writeFileSync(path.join(source, 'phases-1/current.jsonl'), 'current phase');
  mkdirSync(path.join(source, 'vale-styles'));

  copyProfileArtifacts(source, destination);

  const expected = {
    ...preserved,
    'ci-profile-run-1.json': '{"run":1}',
    'ci-profile-run-1-ci.log': 'current CI',
    'ci-profile-run-1.log': 'current CI',
    'ci-profile-run-1-reset.log': 'current reset',
    'ci-profile-reset-1.log': 'current reset',
    'ci-profile-phases-1-current.jsonl': 'current phase'
  };
  assert.deepEqual(readdirSync(destination).sort(), Object.keys(expected).sort());
  for (const [name, contents] of Object.entries(expected)) {
    assert.equal(readFileSync(path.join(destination, name), 'utf8'), contents);
  }

  rmSync(source, { recursive: true });
  mkdirSync(source);
  copyProfileArtifacts(source, destination);

  assert.deepEqual(readdirSync(destination).sort(), Object.keys(preserved).sort());
  for (const [name, contents] of Object.entries(preserved)) {
    assert.equal(readFileSync(path.join(destination, name), 'utf8'), contents);
  }
});
