import type { Project } from '../types.js';

export class ProjectsService {
  static #projects = null;

  static async getData(): Promise<{
    created: string;
    data: Project[];
  }> {
    if (!ProjectsService.#projects) {
      try {
        ProjectsService.#projects = (await import('../../static/projects.json', { with: { type: 'json' } })).default;
      } catch {
        /* istanbul ignore next -- @preserve */
        ProjectsService.#projects = await fetch(
          'https://NVIDIA.github.io/elements/metadata/projects.json'
        ).then(res => res.json());
      }
    }
    return ProjectsService.#projects;
  }
}
