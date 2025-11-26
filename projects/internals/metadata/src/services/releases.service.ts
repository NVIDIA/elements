import type { ReleasesSummary } from '../utils/reports.js';

export class ReleasesService {
  static #releases = null;

  static async getData(): Promise<ReleasesSummary> {
    if (!ReleasesService.#releases) {
      ReleasesService.#releases = (await import('../../static/releases.json', { with: { type: 'json' } })).default;
    }
    return ReleasesService.#releases;
  }
}
