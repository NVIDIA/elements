// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type * as childProcess from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  startersData,
  createGitInitProcess,
  createStarterPaths,
  execPackageManager,
  getDependencyInstallFailureMessage,
  getRequiredNPMClient,
  removeWireitScripts,
  startStarter
} from './starters.js';
import { getNPMClient, isCommandAvailable, getPackageJson } from '../internal/node.js';

vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof childProcess>();
  return { ...actual, execFile: vi.fn(), execFileSync: vi.fn() };
});

describe('startersData', () => {
  it('should provide a list of starter metadata', () => {
    expect(startersData).toBeDefined();
    expect(Object.keys(startersData).length).toBeGreaterThan(0);
    expect(startersData.typescript).toBeDefined();
    expect(startersData.typescript.zip).toBeDefined();
    expect(startersData.typescript.cli).toBeDefined();
    expect(startersData.typescript.cli).toBe(true);
    expect(startersData.typescript.zip).toContain('/starters/download/typescript.zip');
    expect(startersData.typescript.cli).toBe(true);
  });

  it('should have correct structure for all starters', () => {
    Object.entries(startersData).forEach(([_key, starter]) => {
      expect(starter).toHaveProperty('zip');
      expect(starter).toHaveProperty('cli');
      expect(typeof starter.cli).toBe('boolean');
    });
  });

  it('should have correct CLI flags for specific starters', () => {
    expect(startersData.typescript.cli).toBe(true);
    expect(startersData.react.cli).toBe(true);
    expect(startersData.vue.cli).toBe(true);
    expect(startersData.angular.cli).toBe(true);
    expect(startersData.nextjs.cli).toBe(true);
    expect(startersData.solidjs.cli).toBe(true);
    expect(startersData.go.cli).toBe(true);
    expect(startersData.hugo.cli).toBe(true);
    expect(startersData.eleventy.cli).toBe(true);
    expect(startersData.bundles.cli).toBe(true);
    expect(startersData['lit-library'].cli).toBe(true);
    expect(startersData.importmaps.cli).toBe(false);
    expect(startersData.lit.cli).toBe(false);
    expect(startersData['mcp-app'].cli).toBe(true);
    expect(startersData.preact.cli).toBe(false);
  });

  it('should have correct zip URLs for starters with downloads', () => {
    expect(startersData.typescript.zip).toContain('typescript.zip');
    expect(startersData.react.zip).toContain('react.zip');
    expect(startersData.vue.zip).toContain('vue.zip');
    expect(startersData.angular.zip).toContain('angular.zip');
    expect(startersData.nextjs.zip).toContain('nextjs.zip');
    expect(startersData.solidjs.zip).toContain('solidjs.zip');
    expect(startersData.go.zip).toContain('go.zip');
    expect(startersData.eleventy.zip).toContain('eleventy.zip');
    expect(startersData.importmaps.zip).toContain('importmaps.zip');
    expect(startersData.bundles.zip).toContain('bundles.zip');
    expect(startersData['mcp-app'].zip).toContain('mcp-app.zip');
    expect(startersData.hugo.zip).toContain('hugo.zip');
  });

  it('should have null zip for starters without downloads', () => {
    expect(startersData.lit.zip).toBeNull();
    expect(startersData.preact.zip).toBeNull();
  });
});

describe('removeWireitScripts', () => {
  it('should remove wireit scripts from a package.json', () => {
    const packageJson = {
      scripts: {
        build: 'wireit',
        test: 'wireit'
      },
      wireit: {
        build: {
          command: 'vite'
        },
        test: {
          command: `playwright-lock 'vitest'`
        }
      }
    };
    const result = removeWireitScripts(packageJson);
    expect(result.scripts).toBeDefined();
    expect(result.scripts.build).toBe('vite');
    expect(result.scripts.test).toBe('vitest');
    expect(result.wireit).toBeUndefined();
  });

  it('should handle package.json without wireit scripts', () => {
    const packageJson = {
      scripts: {
        build: 'vite',
        test: 'vitest'
      }
    };
    const result = removeWireitScripts(packageJson);
    expect(result.scripts).toEqual(packageJson.scripts);
    expect(result.wireit).toBeUndefined();
  });

  it('should handle package.json with mixed wireit and regular scripts', () => {
    const packageJson = {
      scripts: {
        build: 'wireit',
        test: 'vitest',
        dev: 'wireit'
      },
      wireit: {
        build: {
          command: 'vite build'
        },
        dev: {
          command: 'vite'
        }
      }
    };
    const result = removeWireitScripts(packageJson);
    expect(result.scripts.build).toBe('vite build');
    expect(result.scripts.test).toBe('vitest');
    expect(result.scripts.dev).toBe('vite');
    expect(result.wireit).toBeUndefined();
  });

  it('should handle complex playwright-lock commands', () => {
    const packageJson = {
      scripts: {
        test: 'wireit'
      },
      wireit: {
        test: {
          command: `playwright-lock 'vitest --run --reporter=verbose'`
        }
      }
    };
    const result = removeWireitScripts(packageJson);
    expect(result.scripts.test).toBe('vitest --run --reporter=verbose');
  });

  it('should handle multiple playwright-lock commands', () => {
    const packageJson = {
      scripts: {
        test: 'wireit',
        e2e: 'wireit'
      },
      wireit: {
        test: {
          command: `playwright-lock 'vitest'`
        },
        e2e: {
          command: `playwright-lock 'playwright test'`
        }
      }
    };
    const result = removeWireitScripts(packageJson);
    expect(result.scripts.test).toBe('vitest');
    expect(result.scripts.e2e).toBe('playwright test');
  });
});

describe('createStarterPaths', () => {
  it('should create starter paths without shell command concatenation', () => {
    const outDir = '/tmp/starter output; echo bad';

    expect(createStarterPaths('typescript', outDir)).toEqual({
      archivePath: '/tmp/starter output; echo bad/typescript.zip',
      extractedPath: '/tmp/starter output; echo bad/typescript'
    });
  });
});

describe('getDependencyInstallFailureMessage', () => {
  it('should include the package-manager install command when npm client is available', () => {
    expect(getDependencyInstallFailureMessage('/tmp/starter', 'pnpm')).toBe(
      '⚠️ Error installing dependencies, in the "/tmp/starter" directory run "pnpm install"'
    );
  });

  it('should omit null from the install hint when npm client is unavailable', () => {
    expect(getDependencyInstallFailureMessage('/tmp/starter', null)).toBe(
      '⚠️ Error installing dependencies, install npm or pnpm, then run a package-manager install in the "/tmp/starter" directory'
    );
  });
});

describe('getNPMClient', () => {
  it('should return the npm client', async () => {
    expect(await getNPMClient()).toBe('pnpm');
  });
});

describe('isCommandAvailable', () => {
  it('should return true if the command is available', async () => {
    expect(await isCommandAvailable('pnpm')).toBe(true);
  });

  it('should return false if the command is not available', async () => {
    expect(await isCommandAvailable('not-a-command')).toBe(false);
  });
});

describe('getPackageJson', () => {
  it('should throw error when package.json does not exist', () => {
    expect(() => getPackageJson('/nonexistent/path')).toThrow('No package.json found in the project.');
  });

  it('should return package.json contents when it exists', () => {
    const result = getPackageJson(process.cwd());
    expect(result).toBeDefined();
    expect(result.name).toBe('@internals/tools');
  });
});

describe('startStarter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start the dev server without shell interpretation', async () => {
    const { execFileSync } = await import('node:child_process');
    const extractedPath = '/tmp/starter with spaces; echo bad';

    await startStarter(extractedPath);

    expect(execFileSync).toHaveBeenCalledWith('pnpm', ['run', 'dev'], { cwd: extractedPath, stdio: 'inherit' });
  });
});

describe('createGitInitProcess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize git without shell interpretation', async () => {
    const { execFile } = await import('node:child_process');
    const extractedPath = '/tmp/starter with spaces; echo bad';

    createGitInitProcess(extractedPath);

    expect(execFile).toHaveBeenCalledWith('git', ['init', extractedPath]);
  });
});

describe('execPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke pnpm without shell interpretation', async () => {
    const { execFile } = await import('node:child_process');

    execPackageManager('pnpm', ['install'], '/tmp/starter');

    expect(execFile).toHaveBeenCalledWith('pnpm', ['install'], { cwd: '/tmp/starter' });
  });

  it('should invoke npm without shell interpretation', async () => {
    const { execFile } = await import('node:child_process');

    execPackageManager('npm', ['install'], '/tmp/starter');

    expect(execFile).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/starter' });
  });
});

describe('getRequiredNPMClient', () => {
  it('should return the detected package manager when one is available', async () => {
    expect(await getRequiredNPMClient()).toBe('pnpm');
  });

  it('should throw when no supported package manager is found', async () => {
    vi.resetModules();
    vi.doMock('../internal/node.js', () => ({
      getNPMClient: vi.fn().mockResolvedValue(null),
      isCommandAvailable: vi.fn(),
      getPackageJson: vi.fn()
    }));

    const { getRequiredNPMClient: getRequiredNPMClientMocked } = await import('./starters.js');
    await expect(getRequiredNPMClientMocked()).rejects.toThrow('No supported package manager found.');

    vi.doUnmock('../internal/node.js');
    vi.resetModules();
  });
});

describe('startStarter with npm', () => {
  it('should start the dev server using npm when pnpm is unavailable', async () => {
    vi.resetModules();
    vi.doMock('../internal/node.js', () => ({
      getNPMClient: vi.fn().mockResolvedValue('npm'),
      isCommandAvailable: vi.fn(),
      getPackageJson: vi.fn()
    }));

    const { execFileSync } = await import('node:child_process');
    const { startStarter: startStarterMocked } = await import('./starters.js');
    const extractedPath = '/tmp/npm-starter';

    await startStarterMocked(extractedPath);

    expect(execFileSync).toHaveBeenCalledWith('npm', ['run', 'dev'], { cwd: extractedPath, stdio: 'inherit' });

    vi.doUnmock('../internal/node.js');
    vi.resetModules();
  });
});
