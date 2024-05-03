import { runner } from './index.js';

export async function setup() {
  await runner.open();

  return async () => {
    await runner.close();
  };
}
