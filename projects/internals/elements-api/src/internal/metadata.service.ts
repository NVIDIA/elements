export class MetadataService {
  static #metadata = null;

  static async getMetadata(): Promise<{}> {
    if (!MetadataService.#metadata) {
      MetadataService.#metadata = (
        await import('../../../metadata/dist/index.json', { with: { type: 'json' } })
      ).default;
    }
    return MetadataService.#metadata;
  }

  static async getMaglevMetadata() {
    return (await import('../../../metadata/static/elements.json', { with: { type: 'json' } })).default;
  }
}
