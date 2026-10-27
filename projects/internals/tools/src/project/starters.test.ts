// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type * as childProcess from 'node:child_process';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import AdmZip from 'adm-zip';
import type * as internalNode from '../internal/node.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveStarter,
  startersData,
  createStarter,
  createStarterCDNUrl,
  createGitInitProcess,
  createStarterPaths,
  execPackageManager,
  getDependencyInstallFailureMessage,
  getRequiredNPMClient,
  normalizeAngularConfigForExport,
  serializeStarterWorkspaceManifest,
  starterUsesExternalToolchain,
  stampStarterCDNVersions,
  removeWireitScripts,
  startStarter
} from './starters.js';
import { getPackageJson } from '../internal/node.js';

vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof childProcess>();
  return { ...actual, execFile: vi.fn(), execFileSync: vi.fn() };
});

vi.mock('../internal/node.js', async importOriginal => {
  const actual = await importOriginal<typeof internalNode>();
  return { ...actual, getNPMClient: vi.fn().mockResolvedValue('pnpm') };
});

vi.mock('./setup-agent.js', () => ({ writeAllAgentConfigs: vi.fn() }));

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
    expect(startersData['go-htmx'].cli).toBe(true);
    expect(startersData.hugo.cli).toBe(true);
    expect(startersData.eleventy.cli).toBe(true);
    expect(startersData.bundles.cli).toBe(true);
    expect(startersData['lit-library'].cli).toBe(true);
    expect(startersData.importmaps.cli).toBe(false);
    expect(startersData.lit.cli).toBe(false);
    expect(startersData['mcp-app'].cli).toBe(true);
    expect(startersData.preact.cli).toBe(false);
    expect(startersData.sphinx.cli).toBe(true);
    expect(startersData.sphinx.toolchain).toBe('external');
    expect(startersData.sphinx.postCreate).toEqual(['uv sync --locked', 'uv run sphinx-autobuild docs dist']);
  });

  it('should have correct zip URLs for starters with downloads', () => {
    expect(startersData.typescript.zip).toContain('typescript.zip');
    expect(startersData.react.zip).toContain('react.zip');
    expect(startersData.vue.zip).toContain('vue.zip');
    expect(startersData.angular.zip).toContain('angular.zip');
    expect(startersData.nextjs.zip).toContain('nextjs.zip');
    expect(startersData.solidjs.zip).toContain('solidjs.zip');
    expect(startersData.go.zip).toContain('go.zip');
    expect(startersData['go-htmx'].zip).toContain('go-htmx.zip');
    expect(startersData.eleventy.zip).toContain('eleventy.zip');
    expect(startersData.importmaps.zip).toContain('importmaps.zip');
    expect(startersData.bundles.zip).toContain('bundles.zip');
    expect(startersData['mcp-app'].zip).toContain('mcp-app.zip');
    expect(startersData.hugo.zip).toContain('hugo.zip');
    expect(startersData.sphinx.zip).toContain('sphinx.zip');
  });

  it('should have null zip for starters without downloads', () => {
    expect(startersData.lit.zip).toBeNull();
    expect(startersData.preact.zip).toBeNull();
  });
});

describe('starter toolchains', () => {
  it('should default existing starters to the Node toolchain', () => {
    expect(starterUsesExternalToolchain('typescript')).toBe(false);
    expect(starterUsesExternalToolchain('go')).toBe(false);
    expect(starterUsesExternalToolchain('hugo')).toBe(false);
  });

  it('should identify external-toolchain starters', () => {
    expect(starterUsesExternalToolchain('sphinx')).toBe(true);
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

  it('should remove mise from exported wireit scripts', () => {
    const packageJson = {
      scripts: {
        build: 'wireit',
        dev: 'wireit'
      },
      wireit: {
        build: {
          command: 'mise exec -- hugo'
        },
        dev: {
          command: 'mise exec -- hugo server'
        }
      }
    };
    const result = removeWireitScripts(packageJson);

    expect(result.scripts.build).toBe('hugo');
    expect(result.scripts.dev).toBe('hugo server');
    expect(result.wireit).toBeUndefined();
  });

  it('should export commands without Wireit environment helpers', () => {
    const packageJson = {
      scripts: {
        preview: 'wireit'
      },
      wireit: {
        preview: {
          command: 'vite preview',
          env: {
            PAGES_BASE_URL: {
              external: true,
              default: '/elements/'
            }
          }
        }
      }
    };

    const result = removeWireitScripts(packageJson);

    expect(result.scripts.preview).toBe('vite preview');
    expect(JSON.stringify(result)).not.toContain('run-with-environment');
    expect(result.wireit).toBeUndefined();
  });

  it('should remove exported wireit scripts without commands', () => {
    const packageJson = {
      scripts: {
        ci: 'wireit'
      },
      wireit: {
        ci: {
          dependencies: ['build']
        }
      }
    };
    const result = removeWireitScripts(packageJson);

    expect(result.scripts.ci).toBeUndefined();
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

describe('serializeStarterWorkspaceManifest', () => {
  it('should export reviewed build approvals in deterministic order', () => {
    expect(
      serializeStarterWorkspaceManifest({
        esbuild: true,
        '@parcel/watcher': true,
        Zeta: true,
        alpha: true,
        untrusted: false
      })
    ).toBe(`allowBuilds:
  "@parcel/watcher": true
  "Zeta": true
  "alpha": true
  "esbuild": true
  "untrusted": false
`);
  });

  it('should omit an empty build policy', () => {
    expect(serializeStarterWorkspaceManifest(undefined)).toBe('');
    expect(serializeStarterWorkspaceManifest({})).toBe('');
  });
});

describe('normalizeAngularConfigForExport', () => {
  it('should reset the production base href for consumers', () => {
    const config = {
      projects: {
        'angular-starter': {
          architect: {
            build: {
              configurations: {
                production: {
                  baseHref: '/elements/starters/angular/',
                  budgets: [{ type: 'initial' }]
                }
              }
            }
          }
        }
      }
    };

    const result = JSON.parse(normalizeAngularConfigForExport(JSON.stringify(config)));

    expect(result.projects['angular-starter'].architect.build.configurations.production).toEqual({
      baseHref: '/',
      budgets: [{ type: 'initial' }]
    });
  });

  it('should reject an unexpected Angular configuration shape', () => {
    expect(() => normalizeAngularConfigForExport('{}')).toThrow('angular.json.projects');
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

describe('starter CDN URLs', () => {
  type StarterCDNPackageName = Parameters<typeof createStarterCDNUrl>[0];
  type StarterCDNAsset = { packageName: StarterCDNPackageName; filePath: string };

  const versions: Record<StarterCDNPackageName, string> = {
    '@nvidia-elements/core': '1.2.3',
    '@nvidia-elements/styles': '4.5.6',
    '@nvidia-elements/themes': '7.8.9'
  };

  const coreAsset: StarterCDNAsset = { packageName: '@nvidia-elements/core', filePath: 'dist/bundles/index.min.js' };
  const stylesAsset: StarterCDNAsset = { packageName: '@nvidia-elements/styles', filePath: 'dist/bundles/index.css' };
  const themesAsset: StarterCDNAsset = { packageName: '@nvidia-elements/themes', filePath: 'dist/bundles/index.css' };
  const themeFontsAsset: StarterCDNAsset = { packageName: '@nvidia-elements/themes', filePath: 'dist/fonts/inter.css' };
  const starterCDNAssets = [stylesAsset, themesAsset, themeFontsAsset, coreAsset];

  function createVersionedStarterCDNUrl(asset: StarterCDNAsset, version = versions[asset.packageName]) {
    return createStarterCDNUrl(asset.packageName, version, asset.filePath);
  }

  function createUnversionedStarterCDNUrl(asset: StarterCDNAsset) {
    return createVersionedStarterCDNUrl(asset).replace(
      `${asset.packageName}@${versions[asset.packageName]}`,
      asset.packageName
    );
  }

  it('should create versioned CDN URLs', () => {
    const url = createVersionedStarterCDNUrl(coreAsset);

    expect(new URL(url).protocol).toBe('https:');
    expect(url).toContain(`${coreAsset.packageName}@${versions[coreAsset.packageName]}/${coreAsset.filePath}`);
  });

  it('should stamp unversioned Elements CDN URLs with package versions', () => {
    const content = `
      <link rel="stylesheet" href="${createUnversionedStarterCDNUrl(stylesAsset)}" />
      <link rel="stylesheet" href="${createUnversionedStarterCDNUrl(themesAsset)}" />
      <link rel="stylesheet" href="${createUnversionedStarterCDNUrl(themeFontsAsset)}" />
      <script type="module">
        import '${createUnversionedStarterCDNUrl(coreAsset)}';
      </script>
    `;

    const result = stampStarterCDNVersions(content, versions);

    for (const asset of starterCDNAssets) {
      expect(result).toContain(createVersionedStarterCDNUrl(asset));
    }
  });

  it('should replace existing Elements CDN versions', () => {
    const content = `
      <link rel="stylesheet" href="${createVersionedStarterCDNUrl(stylesAsset, '0.0.1')}" />
      <link rel="stylesheet" href="${createVersionedStarterCDNUrl(themesAsset, '0.0.1')}" />
      <link rel="stylesheet" href="${createVersionedStarterCDNUrl(themeFontsAsset, '0.0.1')}" />
      <script type="module">
        import '${createVersionedStarterCDNUrl(coreAsset, '0.0.1')}';
      </script>
    `;

    const result = stampStarterCDNVersions(content, versions);

    for (const asset of starterCDNAssets) {
      expect(result).toContain(createVersionedStarterCDNUrl(asset));
    }
    expect(result).not.toContain('@0.0.1/');
  });

  it('should leave unrelated CDN URLs unchanged', () => {
    const unrelatedElementsPackageUrl = createVersionedStarterCDNUrl(coreAsset).replace(
      `${coreAsset.packageName}@${versions[coreAsset.packageName]}/${coreAsset.filePath}`,
      '@nvidia-elements/monaco/dist/bundles/index.css'
    );
    const htmxUrl = createVersionedStarterCDNUrl(coreAsset).replace(
      `${coreAsset.packageName}@${versions[coreAsset.packageName]}/${coreAsset.filePath}`,
      'htmx.org@2.0.10/dist/htmx.min.js'
    );
    const content = `
      <link rel="stylesheet" href="${unrelatedElementsPackageUrl}" />
      <script src="${htmxUrl}"></script>
    `;

    const result = stampStarterCDNVersions(content, versions);

    expect(result).toContain(unrelatedElementsPackageUrl);
    expect(result).toContain(htmxUrl);
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

const repoRoot = join(import.meta.dirname, '../../../../..');
const temporaryDirectories: string[] = [];
const angularPackageJson = {
  name: 'angular-starter',
  version: '0.0.0',
  scripts: {
    build: 'wireit',
    test: 'ng test'
  },
  wireit: {
    build: {
      command: 'mise exec -- echo build'
    }
  }
};

const angularConfig = {
  projects: {
    'angular-starter': {
      architect: {
        build: {
          configurations: {
            production: {
              baseHref: '/elements/starters/angular/'
            }
          }
        }
      }
    }
  }
};

const sphinxLayout = [
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css" />',
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css" />',
  '<script type="module" src="https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js"></script>'
].join('\n');
function readAllowBuilds(workspace: unknown): Record<string, boolean> | undefined {
  if (typeof workspace !== 'object' || workspace === null || !('allowBuilds' in workspace)) {
    return undefined;
  }
  const { allowBuilds } = workspace;
  if (typeof allowBuilds !== 'object' || allowBuilds === null || Array.isArray(allowBuilds)) {
    return undefined;
  }
  const record: Record<string, boolean> = {};
  for (const [name, allowed] of Object.entries(allowBuilds)) {
    if (typeof allowed !== 'boolean') {
      throw new Error(`Unexpected allowBuilds value for ${name}`);
    }
    record[name] = allowed;
  }
  return record;
}

function packageVersion(project: string) {
  const manifest = JSON.parse(readFileSync(join(repoRoot, 'projects', project, 'package.json'), 'utf8'));
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new Error(`No version for ${project}`);
  }
  return manifest.version;
}

async function readArchiveEntry(zipPath: string, entryName: string) {
  const deadline = Date.now() + 2000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const entry = new AdmZip(zipPath).getEntry(entryName);
      if (entry) {
        return entry.getData().toString('utf8');
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => {
      setTimeout(resolve, 15);
    });
  }
  throw new Error(`Missing archive entry ${entryName}`, { cause: lastError });
}

async function writeStarterFixture(starterDir: string, files: Record<string, string>) {
  await rm(starterDir, { recursive: true, force: true });
  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      const filePath = join(starterDir, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    })
  );
}

async function archivedStarter(name: string, files: Record<string, string>) {
  const starterDir = join(process.cwd(), name);
  const outDir = await mkdtemp(join(tmpdir(), 'elements-starter-archive-'));
  temporaryDirectories.push(starterDir, outDir);
  await writeStarterFixture(starterDir, files);
  await archiveStarter(name, outDir);
  return join(outDir, `${name}.zip`);
}

describe('archiveStarter', () => {
  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
  });

  it('should export angular metadata and the workspace build policy', async () => {
    const zipPath = await archivedStarter('angular', {
      'package.json': `${JSON.stringify(angularPackageJson, undefined, 2)}\n`,
      'angular.json': `${JSON.stringify(angularConfig)}\n`
    });
    const packageJson = JSON.parse(await readArchiveEntry(zipPath, 'package.json'));
    const angularJson = JSON.parse(await readArchiveEntry(zipPath, 'angular.json'));
    const workspace = await readWorkspaceManifest(repoRoot);

    expect(packageJson.scripts).toEqual({ build: 'echo build', test: 'ng test' });
    expect(packageJson.wireit).toBeUndefined();
    expect(await readArchiveEntry(zipPath, '.npmrc')).toBe('registry=https://registry.npmjs.org/');
    expect(angularJson.projects['angular-starter'].architect.build.configurations.production.baseHref).toBe('/');
    expect(await readArchiveEntry(zipPath, 'pnpm-workspace.yaml')).toBe(
      serializeStarterWorkspaceManifest(readAllowBuilds(workspace))
    );
  });

  it('should stamp published CDN versions into an external toolchain starter', async () => {
    const zipPath = await archivedStarter('sphinx', {
      'docs/_themes/nvidia_elements/layout.html': sphinxLayout
    });
    const layout = await readArchiveEntry(zipPath, 'docs/_themes/nvidia_elements/layout.html');

    expect(layout).toContain(`@nvidia-elements/core@${packageVersion('core')}/dist/bundles/index.min.js`);
    expect(layout).toContain(`@nvidia-elements/styles@${packageVersion('styles')}/dist/bundles/index.css`);
    expect(layout).toContain(`@nvidia-elements/themes@${packageVersion('themes')}/dist/fonts/inter.css`);
    expect(layout).not.toContain('npm/@nvidia-elements/core/dist/');
    expect(layout).not.toContain('npm/@nvidia-elements/themes/dist/');
  });
});

describe('createStarter', () => {
  const directories: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    const { execFile } = await import('node:child_process');
    vi.mocked(execFile).mockReset();
    await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
  });

  async function createDownloadedStarter(starter: 'sphinx' | 'typescript') {
    const { execFile } = await import('node:child_process');
    vi.mocked(execFile).mockImplementation(() => {
      const command = new EventEmitter();
      setTimeout(() => {
        command.emit('close', 0);
      }, 0);
      return command;
    });
    const archive = new AdmZip();
    archive.addFile('README.md', Buffer.from('starter\n'));
    vi.stubGlobal('fetch', async () => new Response(archive.toBuffer()));
    const outDir = await mkdtemp(join(tmpdir(), 'elements-create-starter-'));
    directories.push(outDir);
    return createStarter(starter, outDir);
  }

  it('should explain the next commands after creating an external starter', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      await expect(createDownloadedStarter('sphinx')).resolves.toEqual({
        create: {
          message: 'Starter created successfully',
          status: 'success'
        }
      });
      expect(log).toHaveBeenCalledWith('🎉 Starter created successfully');
      expect(log).toHaveBeenCalledWith(
        'Next steps:\n  cd sphinx\n  uv sync --locked\n  uv run sphinx-autobuild docs dist'
      );
    } finally {
      log.mockRestore();
    }
  });

  it('should confirm creation without next steps for a node starter', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      await expect(createDownloadedStarter('typescript')).resolves.toEqual({
        create: {
          message: 'Starter created successfully',
          status: 'success'
        }
      });
      const messages = log.mock.calls.map(call => String(call[0]));
      expect(messages).toContain('🎉 Starter created successfully');
      expect(messages.some(message => message.startsWith('Next steps'))).toBe(false);
    } finally {
      log.mockRestore();
    }
  });
});
