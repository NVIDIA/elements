export class AVInfraService {
  static #metadata = null;

  static async getMetadata() {
    if (!AVInfraService.#metadata) {
      AVInfraService.#metadata = (await import('../../static/av-infra.json', { with: { type: 'json' } })).default;
    }
    return AVInfraService.#metadata;
  }
}
