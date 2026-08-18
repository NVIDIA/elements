import './lit.js';
import { beforeAll } from 'vitest';
import { webgpuVisualRunner } from '../runners/visual.js';

let runnerInstance = null;

beforeAll(async () => {
  if (!runnerInstance) {
    runnerInstance = webgpuVisualRunner;
    await runnerInstance.open();
  }
});
