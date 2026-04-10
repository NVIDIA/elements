// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
