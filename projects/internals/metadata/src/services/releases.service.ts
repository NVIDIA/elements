// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReleasesSummary } from '../utils/reports.js';

export class ReleasesService {
  static #releases: ReleasesSummary = {
    created: '',
    data: []
  };

  static async getData(): Promise<ReleasesSummary> {
    if (ReleasesService.#releases.created === '') {
      ReleasesService.#releases = (await import('../../static/releases.json', { with: { type: 'json' } }))
        .default as ReleasesSummary;
    }
    return ReleasesService.#releases;
  }
}
