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

    return results;
  }
}
