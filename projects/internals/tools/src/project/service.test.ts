// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Report } from '../internal/types.js';

vi.mock('./health.js', () => ({
  getHealthReport: vi.fn()
}));

vi.mock('./setup-agent.js', () => ({
  setupAgent: vi.fn()
}));

vi.mock('./starters.js', () => ({
  startersData: {
    typescript: { cli: true, zip: 'typescript.zip' },
    react: { cli: true, zip: 'react.zip' },
    importmaps: { cli: false, zip: 'importmaps.zip' }
  },
  createStarter: vi.fn(),
  startStarter: vi.fn()
}));

vi.mock('./update.js', () => ({
  updateProject: vi.fn()
}));

vi.mock('./setup.js', () => ({
  setupProject: vi.fn()
}));

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should orchestrate project creation with all steps', async () => {
      const { createStarter } = await import('./starters.js');
      const { setupAgent } = await import('./setup-agent.js');
      const { setupProject } = await import('./setup.js');
      const { updateProject } = await import('./update.js');

      vi.mocked(createStarter).mockResolvedValue({ create: { message: 'created', status: 'success' } });
      vi.mocked(setupAgent).mockResolvedValue({ agent: { message: 'configured', status: 'success' } });
      vi.mocked(setupProject).mockReturnValue({ deps: { message: 'setup done', status: 'success' } });
      vi.mocked(updateProject).mockResolvedValue({ update: { message: 'updated', status: 'success' } });

      const { ProjectService } = await import('./service.js');
      const result = await ProjectService.create({ type: 'typescript', cwd: '/test', start: false });

      expect(result).toHaveProperty('create');
      expect(result).toHaveProperty('agent');
      expect(result).toHaveProperty('deps');
      expect(result).toHaveProperty('update');
      expect(createStarter).toHaveBeenCalledWith('typescript', '/test');
      expect(setupAgent).toHaveBeenCalled();
      expect(setupProject).toHaveBeenCalled();
      expect(updateProject).toHaveBeenCalled();
    });

    it('should return failed report when a step fails', async () => {
      const { createStarter } = await import('./starters.js');
      const { setupAgent } = await import('./setup-agent.js');
      const { setupProject } = await import('./setup.js');
      const { updateProject } = await import('./update.js');

      const failedReport: Report = { create: { message: 'failed to create', status: 'danger' } };
      vi.mocked(createStarter).mockResolvedValue(failedReport);
      vi.mocked(setupAgent).mockResolvedValue({ agent: { message: 'ok', status: 'success' } });
      vi.mocked(setupProject).mockReturnValue({ deps: { message: 'ok', status: 'success' } });
      vi.mocked(updateProject).mockResolvedValue({ update: { message: 'ok', status: 'success' } });

      const { ProjectService } = await import('./service.js');
      const result = await ProjectService.create({ type: 'typescript', cwd: '/test', start: false });

      expect(result.create?.status).toBe('danger');
    });

    it('should call startStarter when start is true', async () => {
      const { createStarter, startStarter } = await import('./starters.js');
      const { setupAgent } = await import('./setup-agent.js');
      const { setupProject } = await import('./setup.js');
      const { updateProject } = await import('./update.js');

      vi.mocked(createStarter).mockResolvedValue({ create: { message: 'ok', status: 'success' } });
      vi.mocked(setupAgent).mockResolvedValue({ agent: { message: 'ok', status: 'success' } });
      vi.mocked(setupProject).mockReturnValue({ deps: { message: 'ok', status: 'success' } });
      vi.mocked(updateProject).mockResolvedValue({ update: { message: 'ok', status: 'success' } });

      const { ProjectService } = await import('./service.js');
      await ProjectService.create({ type: 'typescript', cwd: '/test', start: true });

      expect(startStarter).toHaveBeenCalled();
    });
  });

  describe('setup', () => {
    it('should orchestrate project setup with agent, setup, and update', async () => {
      const { setupAgent } = await import('./setup-agent.js');
      const { setupProject } = await import('./setup.js');
      const { updateProject } = await import('./update.js');

      vi.mocked(setupAgent).mockResolvedValue({ agent: { message: 'configured', status: 'success' } });
      vi.mocked(setupProject).mockReturnValue({ deps: { message: 'setup done', status: 'success' } });
      vi.mocked(updateProject).mockResolvedValue({ update: { message: 'updated', status: 'success' } });

      const { ProjectService } = await import('./service.js');
      const result = await ProjectService.setup({ cwd: '/test' });

      expect(result).toHaveProperty('agent');
      expect(result).toHaveProperty('deps');
      expect(result).toHaveProperty('update');
    });
  });

  describe('validate', () => {
    it('should delegate to getHealthReport', async () => {
      const { getHealthReport } = await import('./health.js');
      const mockReport: Report = {
        dependencies: { message: 'up to date', status: 'success' }
      };
      vi.mocked(getHealthReport).mockResolvedValue(mockReport);

      const { ProjectService } = await import('./service.js');
      const result = await ProjectService.validate({ cwd: '/test', type: 'application' });

      expect(getHealthReport).toHaveBeenCalledWith('/test', 'application');
      expect(result).toEqual(mockReport);
    });

    it('should pass library type to getHealthReport', async () => {
      const { getHealthReport } = await import('./health.js');
      vi.mocked(getHealthReport).mockResolvedValue({});

      const { ProjectService } = await import('./service.js');
      await ProjectService.validate({ cwd: '/test', type: 'library' });

      expect(getHealthReport).toHaveBeenCalledWith('/test', 'library');
    });
  });
});
