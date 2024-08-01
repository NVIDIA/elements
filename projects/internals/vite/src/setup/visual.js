import { visualRunner } from '@nve-internals/vite';

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
      console.log('Failed to close browsers...');
    }
  };
}
