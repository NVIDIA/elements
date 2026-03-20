import { exec } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';

/**
 * This script checks that after running the CI pipeline that subsequent runs are fully cached across the entire repo.
 * This is critical to keeping the CI pipeline and local builds fast.
 *
 * If this script fails, check which script is running without a wireit cache. This typically means
 * as script is executing without any `files` or `output` options defined.
 */

const tasks = process.argv.slice(2);

for (const task of tasks) {
  await validateCache(task);
}

async function validateCache(task) {
  const parallel = process.env.WIREIT_PARALLEL ? ` WIREIT_PARALLEL=${process.env.WIREIT_PARALLEL}` : '';
  // Only pass PAGES_BASE_URL when set so Wireit sees same env as first run (default "/elements/" for site:build)
  const pagesBaseUrl = process.env.PAGES_BASE_URL !== undefined ? ` PAGES_BASE_URL=${process.env.PAGES_BASE_URL}` : '';
  const { stdout } = await new Promise(resolve =>
    exec(
      `WIREIT_DEBUG_LOG_FILE=.wireit-cache WIREIT_LOGGER=simple${pagesBaseUrl}${parallel} pnpm run ${task}`,
      (stderr, stdout) => resolve({ stdout, stderr })
    )
  );

  const log = readFileSync('.wireit-cache', 'utf-8');
  const updates = log
    .split('\n')
    .filter(i => i.includes('success>') || i.includes('info>'))
    .map(i => i.split('> ')[1].trim());
  const failedCache = updates.filter(
    i => !['analysis-started', 'analysis-completed', 'cached', 'no-command', 'fresh', 'exit-zero'].includes(i)
  );
  const failedTasks = log
    .split('\n')
    .filter(i => i.includes('🏃'))
    .map(i => i.replace('🏃', '').trim());

  if (failedCache.length) {
    console.error(
      '🛑 Wireit cache failed! Verify all scripts cache subsequent results.\nhttps://github.com/google/wireit?tab=readme-ov-file#caching'
    );
    console.error(failedCache);
    console.error(failedTasks);
    process.exit(1);
  } else {
    console.log(`✅ wireit cache successful! (${task})`);
    rmSync('.wireit-cache', { force: true });
  }
}
