import type { ReleasesSummary } from '../utils/reports.js';

export class ReleasesService {
  static #releases = null;

  static async getReleases(): Promise<ReleasesSummary> {
    if (!ReleasesService.#releases) {
      ReleasesService.#releases = (await import('../../static/releases.json', { with: { type: 'json' } })).default;
    }
    return ReleasesService.#releases;
  }
}
