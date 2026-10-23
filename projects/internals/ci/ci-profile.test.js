import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createWireitLineParser,
  processTreeRss,
  profileOptions,
  runChild,
  verifyLighthouseExecution,
  verifyLighthouseSummary,
  wireitGraph
} from './ci-profile.js';

test('Lighthouse profiling rejects cached or incrementally fresh test tasks', () => {
  const graph = wireitGraph('lighthouse');
  const tests = graph.filter(task => task.id.endsWith(':test:lighthouse'));
  const root = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(
    tests.map(task => task.id).sort(),
    root.wireit.lighthouse.dependencies.map(id => id.replace(/^\.\//, '')).sort()
  );
  assert.throws(() => verifyLighthouseExecution([], graph), /skipped expected test commands/);
  assert.throws(() => verifyLighthouseExecution(tests.slice(1), graph), /skipped expected test commands/);
  assert.doesNotThrow(() => verifyLighthouseExecution(tests, graph));
});

test('profiling accepts a single fresh-run sample without changing cold CI defaults', () => {
  assert.deepEqual(profileOptions([]), { target: 'ci', samples: 3, reset: 'cold' });
  assert.deepEqual(profileOptions(['--target', 'lighthouse', '--samples', '1', '--reset', 'none']), {
    target: 'lighthouse',
    samples: 1,
    reset: 'none'
  });
  assert.throws(() => profileOptions(['--samples', '0']));
  assert.throws(() => profileOptions(['--target', 'invalid']));
  assert.throws(() => profileOptions(['--reset']));
});

test('test summaries cannot hide skipped or missing assertions behind a successful command', () => {
  const summary = {
    success: true,
    numFailedTests: 0,
    numTotalTests: 2,
    numPassedTests: 2,
    testResults: [{ assertionResults: [{ status: 'passed' }, { status: 'passed' }] }]
  };
  assert.doesNotThrow(() => verifyLighthouseSummary(summary, 'project'));
  assert.throws(
    () => verifyLighthouseSummary({ ...summary, numPassedTests: 1 }, 'project'),
    /skipped Lighthouse tests/
  );
  assert.throws(() => verifyLighthouseSummary({ ...summary, testResults: [] }, 'project'), /skipped Lighthouse tests/);
  assert.throws(() => verifyLighthouseSummary({ ...summary, success: false }, 'project'), /skipped Lighthouse tests/);
});

test('paired profiles require cold resets and explicit valid ordering', () => {
  assert.deepEqual(profileOptions(['--compare-ref', 'main', '--order', 'candidate-first']), {
    target: 'ci',
    samples: 3,
    reset: 'cold',
    compareRef: 'main',
    order: 'candidate-first'
  });
  assert.throws(() => profileOptions(['--compare-ref', 'main', '--reset', 'none']), /cold resets/);
  assert.throws(() => profileOptions(['--compare-ref', 'main', '--order', 'invalid']), /valid execution order/);
});

test('Wireit parser handles chunk boundaries and exposes unfinished commands', () => {
  let time = 100;
  const parser = createWireitLineParser({ now: () => time });
  parser.write('🏃 [projects/core:test:lighthouse] Running com');
  parser.write('mand "vitest run"\n🏃 [lighthouse] Running command "metrics"\n');
  time = 250;
  parser.write('✅ [projects/core:test:lighthouse] Executed successfully\n');
  const result = parser.finish();
  assert.equal(result.scripts[0].durationMs, 150);
  assert.deepEqual(result.incomplete, ['.:lighthouse']);
});

test('resource samples include every descendant without counting unrelated processes', () => {
  assert.equal(
    processTreeRss(
      [
        { pid: 3, ppid: 2, rssKiB: 30 },
        { pid: 2, ppid: 1, rssKiB: 20 },
        { pid: 1, ppid: 0, rssKiB: 10 },
        { pid: 4, ppid: 0, rssKiB: 100 }
      ],
      1
    ),
    60
  );
});

test('failed commands remain failures and preserve both diagnostic streams and resource evidence', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'elements-profiler-failure-'));
  const logPath = path.join(directory, 'failure.log');
  try {
    await assert.rejects(
      runChild(process.execPath, ['-e', 'console.log("test output"); console.error("test failure"); process.exit(7)'], {
        logPath,
        resources: true
      }),
      /exit code 7/
    );
    const log = readFileSync(logPath, 'utf8');
    assert.match(log, /test output/);
    assert.match(log, /test failure/);
    const resources = JSON.parse(readFileSync(`${logPath}.resources.json`, 'utf8'));
    assert.ok(Number.isFinite(resources.userCpuSeconds));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
