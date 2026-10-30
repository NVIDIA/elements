import { TestRunner } from 'vitest';
import { visualRunner } from './visual.js';

/** Keeps one browser per worker and closes it after the worker's files finish. */
export default class VisualTestRunner extends TestRunner {
  constructor(config) {
    super(config);
    this.onCleanupWorkerContext?.(() => visualRunner.close());
  }

  async onAfterRunFiles(files) {
    try {
      // VM pools do not expose worker cleanup and cannot retain the browser between contexts.
      if (!this.onCleanupWorkerContext) {
        await visualRunner.close();
      }
    } finally {
      await super.onAfterRunFiles(files);
    }
  }
}
