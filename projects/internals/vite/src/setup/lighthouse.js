import { lighthouseRunner } from '../runners/lighthouse.js';

let runnerInstance = null;

export async function setup(project) {
  if (!runnerInstance) {
    runnerInstance = lighthouseRunner;
    await runnerInstance.open({ workers: project.config.fileParallelism ? project.config.maxWorkers : 1 });
  }

  return async () => {
    try {
      await runnerInstance.close();
    } catch {
      console.log('Failed to close lighthouse runner...');
    }
  };
}
