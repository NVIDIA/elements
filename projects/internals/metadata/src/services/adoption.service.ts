// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AdoptionSummary } from '../types.js';

export class AdoptionService {
  static #adoption: AdoptionSummary = {
    created: '',
    period: '',
    sources: {
      npmDownloads: '',
      npmRegistry: '',
      jsdelivr: '',
      github: ''
    },
    totals: {
      packages: 0,
      publishedPackages: 0,
      partialPackages: 0,
      unavailablePackages: 0,
      npmDownloads: 0,
      cdnRequests: 0
    },
    packages: [],
    github: {
      repository: '',
      stars: 0,
      forks: 0,
      subscribers: 0,
      contributors: 0,
      releases: 0,
      stargazers: [],
      errors: []
    }
  };

  static async getData(): Promise<AdoptionSummary> {
    if (AdoptionService.#adoption.created === '') {
      AdoptionService.#adoption = (await import('../../static/adoption.json', { with: { type: 'json' } }))
        .default as AdoptionSummary;
    }

    return structuredClone(AdoptionService.#adoption);
  }
}
