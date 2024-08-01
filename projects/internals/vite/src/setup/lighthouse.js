import { lighthouseRunner } from '../runners/lighthouse.js';

let runnerInstance = null;

export async function setup() {
  if (!runnerInstance) {
    runnerInstance = lighthouseRunner;
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
