import type { DownloadsReport } from '../utils/reports.js';

export class DownloadService {
  static #downloads = null;

  static async getDownloads(): Promise<DownloadsReport> {
    if (!DownloadService.#downloads) {
      DownloadService.#downloads = (await import('../../static/downloads.json', { with: { type: 'json' } })).default;
    }
    return DownloadService.#downloads;
  }
}
