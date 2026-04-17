// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type MiniSearch from 'minisearch';
import type { Attribute, Element, ProjectTypes, Token } from '../types.js';
import { createApiIndex, type ApiSearchDocument } from '../indexes/api.js';

type ApiData = {
  created: string;
  data: {
    elements: Element[];
    attributes: Attribute[];
    tokens: Token[];
    types: ProjectTypes[];
  };
};

export class ApiService {
  static #api: ApiData = {
    created: '',
    data: {
      elements: [],
      attributes: [],
      tokens: [],
      types: []
    }
  };
  static #index: MiniSearch<ApiSearchDocument> | null = null;

  static async getData(): Promise<ApiData> {
    if (ApiService.#api.created === '') {
      ApiService.#api = (await import('../../static/api.json', { with: { type: 'json' } }))
        .default as unknown as ApiData;
      ApiService.#index = createApiIndex(ApiService.#api!.data);
    }
    return ApiService.#api;
  }

  static async search(query: string): Promise<(Element | Attribute)[]> {
    const data = await this.getData();
    const results = ApiService.#index!.search(query).map(result =>
      [...data.data.elements, ...data.data.attributes].find(d => d.name === result.id)
    );

    const exactMatchIndex = results.findIndex(item => item?.name === query);
    if (exactMatchIndex > 0) {
      const [exactMatch] = results.splice(exactMatchIndex, 1);
      results.unshift(exactMatch);
    }

    return results.filter((r): r is Element | Attribute => r !== undefined);
  }
}
