import { beforeAll, afterAll } from 'vitest';
import { runner } from './index.js';

beforeAll(async () => {
  await runner.open();
});

afterAll(async () => {
  await runner.close();
});
