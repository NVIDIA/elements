import type MiniSearch from 'minisearch';
import type { Attribute, Element, ProjectTypes, Token } from '../types.js';
import { createApiIndex, type ApiSearchDocument, type ApiSearchResult } from '../indexes/api.js';

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
  static #api: ApiData | null = null;
  static #index: MiniSearch<ApiSearchDocument> | null = null;

  static async getData(): Promise<ApiData> {
    if (!ApiService.#api) {
      try {
        ApiService.#api = (await import('../../static/api.json', { with: { type: 'json' } })).default as ApiData;
      } catch {
        /* istanbul ignore next -- @preserve */
        ApiService.#api = await fetch(
          'https://NVIDIA.github.io/elements/metadata/apis.json'
        ).then(res => res.json());
      }

      ApiService.#index = createApiIndex(ApiService.#api.data);
    }
    return ApiService.#api;
  }

  static async search(query: string): Promise<ApiSearchResult> {
    const { data } = await this.getData();
    const results = ApiService.#index!.search(query);
    const output: ApiSearchResult = [];

    for (const result of results) {
      if (result.type === 'element') {
        output.push(data.elements.find(e => e.name === result.name)!);
      }

      if (result.type === 'attribute') {
        output.push(data.attributes.find(a => a.name === result.name)!);
      }
    }

    return output;
  }
}
