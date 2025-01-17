import { beforeAll } from 'vitest';
import { visualRunner } from '../runners/visual.js';

beforeAll(async () => {
  await visualRunner.open();
});
