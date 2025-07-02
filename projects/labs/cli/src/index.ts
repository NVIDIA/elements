#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const VERSION = '0.0.0';

void yargs(hideBin(process.argv))
  .command(
    'run <task>',
    'run a task',
    yargs => {
      return yargs.positional('task', {
        describe: 'the task to run',
        type: 'string'
      });
    },
    argv => {
      console.info(`run task ${argv.task}`);
    }
  )
  .parse();
