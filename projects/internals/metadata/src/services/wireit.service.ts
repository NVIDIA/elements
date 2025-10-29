export class WireitService {
  static #graph = null;

  static async getGraph() {
    if (!WireitService.#graph) {
      WireitService.#graph = (await import('../../static/wireit.json', { with: { type: 'json' } })).default;
    }
    return WireitService.#graph;
  }
}
