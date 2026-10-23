import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createWireitLineParser,
  processTreeRss,
  profileOptions,
  verifyLighthouseExecution,
  wireitGraph
} from './ci-profile.js';

test('Lighthouse profiling rejects cached or incrementally fresh test tasks', () => {
  const graph = wireitGraph('lighthouse');
  const tests = graph.filter(task => task.id.endsWith(':test:lighthouse'));
  assert.equal(tests.length, 12);
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
