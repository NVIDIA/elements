import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectReports } from './playwright.js';

test('concurrent fixture reports merge deterministically without reading the previous combined report', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'elements-runner-reports-'));
  try {
    for (const name of ['z-last', 'a-first']) {
      mkdirSync(path.join(root, 'dist', name), { recursive: true });
      writeFileSync(
        path.join(root, 'dist', name, 'report.json'),
        JSON.stringify({ name, scores: { performance: 100 } })
      );
    }
    writeFileSync(path.join(root, 'dist/report.json'), 'previous combined report must not be read');
    assert.deepEqual(Object.keys(collectReports(root)), ['a-first', 'z-last']);
    assert.deepEqual(collectReports(root), {
      'a-first': { name: 'a-first', scores: { performance: 100 } },
      'z-last': { name: 'z-last', scores: { performance: 100 } }
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
