import { runner } from './index.js';

let init = false;

export async function setup() {
  if (!init) {
    init = true;
    await runner.open();
  }

  return async () => {
    await runner.close();
  };
}
