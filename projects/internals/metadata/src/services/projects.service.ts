import type { Project } from '../types.js';

export class ProjectsService {
  static #projects: { created: string; data: Project[] } = {
    created: '',
    data: []
  };

  static async getData(): Promise<{
    created: string;
    data: Project[];
  }> {
    if (ProjectsService.#projects.created === '') {
      ProjectsService.#projects = (await import('../../static/projects.json', { with: { type: 'json' } })).default as {
        created: string;
        data: Project[];
      };
    }
    return ProjectsService.#projects;
  }
}
