import { runner } from './index.js';

let runnerInstance = null;

export async function setup() {
  if (!runnerInstance) {
    runnerInstance = runner;
    await runnerInstance.open();
  }

  return async () => {
    await runnerInstance.close();
  };
}
