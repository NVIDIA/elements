// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { startersData, removeWireitScripts } from './starters.js';
import { getNPMClient, isCommandAvailable, getPackageJson } from '../internal/node.js';

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
    expect(startersData.importmaps.cli).toBe(false);
    expect(startersData.lit.cli).toBe(false);
    expect(startersData.extensions.cli).toBe(false);
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
    expect(startersData.extensions.zip).toContain('scoped-registry.zip');
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
