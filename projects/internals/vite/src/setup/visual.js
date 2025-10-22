import { beforeAll } from 'vitest';
import { visualRunner } from '../runners/visual.js';

let runnerInstance = null;

beforeAll(async () => {
  if (!runnerInstance) {
    runnerInstance = visualRunner;
    await runnerInstance.open();
  }
});
