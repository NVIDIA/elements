export class WireitService {
  static #graph = null;

  static async getData() {
    if (!WireitService.#graph) {
      WireitService.#graph = (await import('../../static/wireit.json', { with: { type: 'json' } })).default;
    }
    return WireitService.#graph;
  }
}
