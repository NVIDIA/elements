import { runner } from './index.js';

let runnerInstance = null;

export async function setup() {
  if (!runnerInstance) {
    runnerInstance = runner;
    await runnerInstance.open();
  }

  return async () => {
    try {
      await runnerInstance.close();
    } catch {
      console.log('Failed to close browsers...');
    }
  };
}
