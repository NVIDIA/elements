export class MetadataService {
  static #metadata = null;

  static async getMetadata(): Promise<any> {
    if (!MetadataService.#metadata) {
      MetadataService.#metadata = (
        await import('../../../metadata/dist/index.json' as any, { with: { type: 'json' } })
      ).default;
    }
    return MetadataService.#metadata;
  }

  static async getMaglevMetadata() {
    return (await import('../../../metadata/static/elements.json' as any, { with: { type: 'json' } })).default;
  }
}
