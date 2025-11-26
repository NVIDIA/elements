import { describe, expect, it } from 'vitest';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  it('should return the projects json', async () => {
    const projects = await ProjectsService.getData();
    expect(projects).toBeDefined();
    expect(projects.data.length).toBeGreaterThan(0);
  });
});
