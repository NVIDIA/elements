import type { ProjectTestSummary } from '../types.js';

export class TestsService {
  static #tests = null;

  static async getTests(): Promise<ProjectTestSummary> {
    if (!TestsService.#tests) {
      try {
        TestsService.#tests = (await import('../../static/tests.json', { with: { type: 'json' } })).default;
      } catch {
        /* istanbul ignore next -- @preserve */
        TestsService.#tests = await fetch(
          'https://NVIDIA.github.io/elements/metadata/tests.json'
        ).then(res => res.json());
      }
    }
    return TestsService.#tests;
  }
}
