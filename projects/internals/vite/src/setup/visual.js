import { visualRunner } from '../runners/visual.js';

let runnerInstance = null;

export async function setup() {
  if (!runnerInstance) {
    runnerInstance = visualRunner;
    await runnerInstance.open();
  }

  return async () => {
    try {
      await runnerInstance.close();
    } catch {
      console.log('Failed to close visual runner...');
    }
  };
}
