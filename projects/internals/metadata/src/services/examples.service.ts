// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type MiniSearch from 'minisearch';
import type { Example } from '../types.js';
import { createIndex } from '../indexes/examples.js';

export class ExamplesService {
  static #data: Example[] = [];
  static #index: MiniSearch<Example> | null = null;

  static async getData(): Promise<Example[]> {
    if (ExamplesService.#data.length === 0) {
      ExamplesService.#data = (await import('../../static/examples.json', { with: { type: 'json' } }))
        .default as Example[];
      ExamplesService.#index = createIndex(ExamplesService.#data);
    }
    return ExamplesService.#data;
  }

  static async search(query: string): Promise<Example[]> {
    const data = await this.getData();
    const results = ExamplesService.#index!.search(query);
    return results.map(result => data.find(d => d.id === result.id)).filter(e => !!e);
  }
}
