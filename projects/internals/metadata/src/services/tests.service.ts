import type { ProjectsTestSummary } from '../utils/reports.js';

export class TestsService {
  static #tests: ProjectsTestSummary = {
    created: '',
    projects: {}
  };

  static async getData(): Promise<ProjectsTestSummary> {
    if (TestsService.#tests.created === '') {
      TestsService.#tests = (await import('../../static/tests.json', { with: { type: 'json' } }))
        .default as unknown as ProjectsTestSummary;
    }
    return TestsService.#tests;
  }
}
