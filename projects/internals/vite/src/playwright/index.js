import { exec } from 'node:child_process';
import { resolve } from 'path';
import * as lockFile from 'proper-lockfile';

/**
 * creates a lockfile to force parallel playright runners to execute one at a time, example:
 *
 * "test": "playwright-lock 'vite run'"
 *
 * This is needed due to the issue of wireit running tasks in parallel based on
 * dependencies but playwright not allowing more than one chromium instance
 * executing at a time see https://github.com/google/wireit/issues/325
 */

const cmd = process.argv.slice(2).join(' ');
const path = resolve(import.meta.dirname, './index.js');

const timerId = setInterval(() => {
  lockFile
    .lock(path, {
      stale: 60000
    })
    .then(async release => {
      clearInterval(timerId);
      await new Promise(r => {
        exec(cmd, (error, stdout, stderr) => {
          console.log(stdout);

          if (error) {
            console.log(1);
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
