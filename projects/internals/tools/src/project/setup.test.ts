// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupProject } from './setup.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

describe('setup-project', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should skip if package.json is not found', async () => {
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);

    const result = setupProject('/test-project');

    expect(result.dependencies.status).toBe('warning');
    expect(result.dependencies.message).toContain('No package.json');
  });

  it('should skip if project already has Elements dependencies', async () => {
    const { existsSync, readFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({
        dependencies: { '@nvidia-elements/core': '^1.0.0' },
        devDependencies: {}
      })
    );

    const result = setupProject('/test-project');

    expect(result.dependencies.status).toBe('info');
    expect(result.dependencies.message).toContain('already has');
  });

  it('should return danger if package.json is invalid JSON', async () => {
    const { existsSync, readFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('not valid json {{{');

    const result = setupProject('/test-project');

    expect(result.dependencies.status).toBe('danger');
    expect(result.dependencies.message).toContain('Failed to parse');
  });

  it('should handle missing dependencies and devDependencies keys', async () => {
    const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ name: 'test' }));

    const result = setupProject('/test-project');

    expect(result.dependencies.status).toBe('success');
    expect(writeFileSync).toHaveBeenCalled();
  });

  it('should add Elements core dependencies to package.json', async () => {
    const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({
        name: 'test-project',
        dependencies: { 'some-lib': '^1.0.0' },
        devDependencies: {}
      })
    );

    const result = setupProject('/test-project');

    expect(result.dependencies.status).toBe('success');
    expect(writeFileSync).toHaveBeenCalled();

    const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
    expect(written.dependencies['@nvidia-elements/core']).toBe('latest');
    expect(written.dependencies['@nvidia-elements/themes']).toBe('latest');
    expect(written.dependencies['@nvidia-elements/styles']).toBe('latest');
    expect(written.dependencies['some-lib']).toBe('^1.0.0');
  });
});
