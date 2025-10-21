import { exec } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'path';
import * as lockFile from 'proper-lockfile';

/**
 * creates a lockfile to force parallel playwright runners to execute one at a time, example:
 *
 * "test": "playwright-lock 'vite run'"
 *
 * This is needed due to the issue of wireit running tasks in parallel based on
 * dependencies but playwright not allowing more than one chromium instance
 * executing at a time see https://github.com/google/wireit/issues/325
 */

const cmd = process.argv[2];
const lockName = process.argv[3]?.length > 0 ? process.argv[3] : 'playwright';
const lockPath = resolve(import.meta.dirname, `locks/${lockName}`);

if (!existsSync(lockPath)) {
  mkdirSync(resolve(import.meta.dirname, 'locks'), { recursive: true });
  writeFileSync(lockPath, '');
}

const timerId = setInterval(() => {
  lockFile
    .lock(lockPath, {
      stale: 300000 // 5 minutes
    })
    .then(async release => {
      clearInterval(timerId);
      await new Promise(r => {
        exec(cmd, (error, stdout, stderr) => {
          console.log(stdout);

          if (error) {
            console.error(error);
            process.exit(1);
          }

          if (stderr) {
            console.error(stderr);
          }

          r();
        });
      });
      return release();
    })
    .catch(_ => {});
}, 1000);
