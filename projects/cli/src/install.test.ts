// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmod, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';
import { formatSkillMarkdown, skills } from '@internals/tools/skills';
import { getInstallPaths, installInternals, installNve } from './install.js';

interface InstallerContext {
  fakeBin: string;
  home: string;
  root: string;
}

interface InstallManifest {
  canonicalBinaryPath: string;
  cliName: string;
  pathResolutionWorkedDuringInstall: boolean;
  platform: string;
  shimPaths: string[];
  version: string;
}

const installSh = resolve(import.meta.dirname, '../install.sh');
const installPs1 = resolve(import.meta.dirname, '../install.ps1');
const installTs = resolve(import.meta.dirname, 'install.ts');
const writeInstallManifest = resolve(import.meta.dirname, '../scripts/write-install-manifest.mjs');
const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe('installNve', () => {
  it('should install nve to the default canonical path', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const logs: string[] = [];
    const logCalls: unknown[][] = [];
    const env = createUnixEnv(context);

    await installNve({
      env,
      log: (...args) => {
        logCalls.push(args);
        logs.push(args[0]);
      },
      prompt: skipPrompt,
      source
    });

    const canonicalPath = join(context.home, '.nve/bin/nve');
    const manifest = JSON.parse(await readFile(join(context.home, '.nve/manifest.json'), 'utf-8')) as InstallManifest;
    const directResult = spawnSync(canonicalPath, ['--version'], {
      encoding: 'utf-8',
      env: { PATH: '/usr/bin:/bin:/usr/sbin:/sbin' }
    });

    expect(directResult.status).toBe(0);
    expect(directResult.stdout.trim()).toBe('9.8.7-test');
    expect(manifest.cliName).toBe('nve');
    expect(manifest.version).toBe('9.8.7-test');
    expect(manifest.canonicalBinaryPath).toBe(canonicalPath);
    expect(manifest.pathResolutionWorkedDuringInstall).toBe(true);
    expect(logCalls.every(args => args.length === 1)).toBe(true);
    expect(logs.join('\n')).not.toContain('Diagnostics:');
    expect(logs.join('\n')).toContain(`Installed CLI at ${canonicalPath}`);
  });

  it('should print detailed diagnostics when install debug output is enabled', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const logs: string[] = [];

    await installNve({
      env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
      log: message => logs.push(message),
      prompt: skipPrompt,
      source
    });

    const output = logs.join('\n');
    expect(output).toContain('Diagnostics:');
    expect(output).toContain('direct canonical execution: ok');
    expect(output).toContain('restricted PATH direct execution: ok');
  });

  it('should install nve to a custom NVE_HOME without HOME', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const nveHome = join(context.root, 'custom-nve');
    const env = { NVE_HOME: nveHome, PATH: context.fakeBin, SHELL: '/bin/zsh' };

    const warnings: string[] = [];
    const result = await installNve({
      env,
      log: () => {},
      prompt: async () => 'y',
      source,
      warn: message => warnings.push(message)
    });

    expect(result.canonicalBinaryPath).toBe(join(nveHome, 'bin/nve'));
    expect(existsSync(join(nveHome, 'bin/nve'))).toBe(true);
    expect(result.shimPaths).toEqual([]);
    expect(warnings.join('\n')).toContain('HOME is not set');
  });

  it('should fail when Unix install paths cannot resolve a home directory', () => {
    expect(() => getInstallPaths({}, 'linux')).toThrow('HOME is not set. Set NVE_HOME and retry.');
  });

  it('should fail when Windows install paths cannot resolve a local app data directory', () => {
    expect(() => getInstallPaths({}, 'win32')).toThrow('LOCALAPPDATA is not set. Set NVE_HOME and retry.');
  });

  it('should not duplicate shell profile entries on reinstall', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const env = createUnixEnv(context);
    await writeFile(join(context.home, '.zshrc'), '# existing profile\n');

    await installNve({ env, log: () => {}, prompt: skipPrompt, source });
    await installNve({ env, log: () => {}, prompt: skipPrompt, source });

    const profile = await readFile(join(context.home, '.zshrc'), 'utf-8');
    expect(countOccurrences(profile, join(context.home, '.nve/bin'))).toBe(1);
  });

  it('should update a fish shell profile', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const env = { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1', SHELL: '/usr/bin/fish' };

    await installNve({ env, log: () => {}, prompt: skipPrompt, source });

    const profile = await readFile(join(context.home, '.config/fish/config.fish'), 'utf-8');
    expect(profile).toContain(`fish_add_path ${join(context.home, '.nve/bin')}`);
  });

  it('should update an existing bash profile without a trailing newline', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const env = { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1', SHELL: '/bin/bash' };
    await writeFile(join(context.home, '.bashrc'), '# existing profile');

    await installNve({ env, log: () => {}, prompt: skipPrompt, source });

    const profile = await readFile(join(context.home, '.bashrc'), 'utf-8');
    expect(profile).toContain('# existing profile\n\n# Elements CLI');
    expect(profile).toContain(`export PATH="${join(context.home, '.nve/bin')}:$PATH"`);
  });

  it('should use a bash profile when shell is unset', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const env = { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1', SHELL: undefined };

    await installNve({ env, log: () => {}, prompt: skipPrompt, source });

    const profile = await readFile(join(context.home, '.bash_profile'), 'utf-8');
    expect(profile).toContain(`export PATH="${join(context.home, '.nve/bin')}:$PATH"`);
  });

  it('should warn when shell profile updates fail', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const warnings: string[] = [];
    await mkdir(join(context.home, '.zshrc'), { recursive: true });

    await installNve({
      env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
      log: () => {},
      prompt: skipPrompt,
      source,
      warn: message => warnings.push(message)
    });

    expect(warnings.join('\n')).toContain(`Could not update ${join(context.home, '.zshrc')}`);
  });

  it('should create a convenience shim', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));

    await installNve({ env: createUnixEnv(context), log: () => {}, prompt: skipPrompt, source });

    const shimPath = join(context.home, '.local/bin/nve');
    const shimStats = await lstat(shimPath);
    expect(shimStats.isSymbolicLink() || shimStats.isFile()).toBe(true);
  });

  it('should skip copying when the source already is the canonical binary', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.home, '.nve/bin/nve'));

    const result = await installNve({
      env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
      log: () => {},
      prompt: skipPrompt,
      source
    });

    expect(result.canonicalBinaryPath).toBe(source);
    expect(spawnSync(source, ['--version'], { encoding: 'utf-8' }).stdout.trim()).toBe('9.8.7-test');
  });

  it('should use stderr when the version command does not write stdout', async () => {
    const context = await createInstallerContext();
    const source = await writeStderrVersionFakeNve(join(context.root, 'source-nve'));

    const result = await installNve({
      env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
      log: () => {},
      prompt: skipPrompt,
      source
    });

    expect(result.version).toBe('9.8.7-stderr-test');
  });

  it('should install with default options from process environment', async () => {
    const context = await createInstallerContext();
    const originalCi = process.env.CI;
    const originalHome = process.env.HOME;
    const originalNveHome = process.env.NVE_HOME;
    const originalPath = process.env.PATH;
    const originalShell = process.env.SHELL;
    const originalDebug = process.env.NVE_INSTALL_DEBUG;

    try {
      process.env.CI = 'true';
      process.env.HOME = context.home;
      process.env.NVE_HOME = join(context.root, 'default-options-nve');
      process.env.NVE_INSTALL_DEBUG = '1';
      process.env.PATH = context.fakeBin;
      process.env.SHELL = '/bin/zsh';

      const result = await installNve();

      expect(result.canonicalBinaryPath).toBe(join(context.root, 'default-options-nve/bin/nve'));
      expect(result.version).toBe(process.version);
    } finally {
      restoreCi(originalCi);
      restoreHome(originalHome);
      restoreNveHome(originalNveHome);
      restorePath(originalPath);
      restoreShell(originalShell);
      restoreDebug(originalDebug);
    }
  });

  it('should reject a source binary that cannot report its version', async () => {
    const context = await createInstallerContext();
    const source = await writeFailingNve(join(context.root, 'source-nve'));

    await expect(
      installNve({
        env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
        log: () => {},
        prompt: skipPrompt,
        source
      })
    ).rejects.toThrow('Direct canonical execution failed');
  });

  it('should include stdout from failed version checks', async () => {
    const context = await createInstallerContext();
    const source = await writeStdoutFailingNve(join(context.root, 'source-nve'));

    await expect(
      installNve({
        env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
        log: () => {},
        prompt: skipPrompt,
        source
      })
    ).rejects.toThrow('stdout failure');
  });

  it('should include the exit code from silent failed version checks', async () => {
    const context = await createInstallerContext();
    const source = await writeSilentFailingNve(join(context.root, 'source-nve'));

    await expect(
      installNve({
        env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
        log: () => {},
        prompt: skipPrompt,
        source
      })
    ).rejects.toThrow('exit code 7');
  });

  it('should install the global Elements skill when accepted', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    let promptQuestion = '';

    await installNve({
      env: createUnixEnv(context),
      log: () => {},
      prompt: async question => {
        promptQuestion = question;
        return 'yes';
      },
      source
    });

    const skillPath = join(context.home, '.agents/skills/elements/SKILL.md');
    expect(promptQuestion).toBe('Install Elements agent skill globally? (Y/n) ');
    expect(await readFile(skillPath, 'utf-8')).toBe(getExpectedElementsSkillMarkdown());
  });

  it('should install the global Elements skill when the prompt uses the default answer', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));

    await installNve({ env: createUnixEnv(context), log: () => {}, prompt: async () => '', source });

    const skillPath = join(context.home, '.agents/skills/elements/SKILL.md');
    expect(await readFile(skillPath, 'utf-8')).toBe(getExpectedElementsSkillMarkdown());
  });

  it('should overwrite the global Elements skill when accepted', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const skillPath = join(context.home, '.agents/skills/elements/SKILL.md');
    await mkdir(dirname(skillPath), { recursive: true });
    await writeFile(skillPath, 'stale skill');

    await installNve({ env: createUnixEnv(context), log: () => {}, prompt: async () => 'y', source });

    expect(await readFile(skillPath, 'utf-8')).toBe(getExpectedElementsSkillMarkdown());
  });

  it('should skip global skill installation when declined', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));

    await installNve({ env: createUnixEnv(context), log: () => {}, prompt: async () => 'N', source });

    expect(existsSync(join(context.home, '.agents/skills/elements/SKILL.md'))).toBe(false);
  });

  it('should install the global Elements skill when prompt input is unavailable', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));

    await installNve({ env: createUnixEnv(context), log: () => {}, prompt: skipPrompt, source });

    const skillPath = join(context.home, '.agents/skills/elements/SKILL.md');
    expect(await readFile(skillPath, 'utf-8')).toBe(getExpectedElementsSkillMarkdown());
  });

  it('should install the global Elements skill when the prompt rejects', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));

    await installNve({
      env: { ...createUnixEnv(context), NVE_INSTALL_DEBUG: '1' },
      log: () => {},
      prompt: async () => Promise.reject(new Error('input unavailable')),
      source
    });

    const skillPath = join(context.home, '.agents/skills/elements/SKILL.md');
    expect(await readFile(skillPath, 'utf-8')).toBe(getExpectedElementsSkillMarkdown());
  });

  it('should skip the global skill prompt in CI', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    let prompted = false;

    await installNve({
      env: { ...createUnixEnv(context), CI: 'true' },
      log: () => {},
      prompt: async () => {
        prompted = true;
        return 'yes';
      },
      source
    });

    expect(prompted).toBe(false);
    expect(existsSync(join(context.home, '.agents/skills/elements/SKILL.md'))).toBe(false);
  });

  it('should keep the CLI install when global skill installation fails', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.root, 'source-nve'));
    const warnings: string[] = [];
    await writeFile(join(context.home, '.agents'), 'not a directory');

    const result = await installNve({
      env: createUnixEnv(context),
      log: () => {},
      prompt: async () => 'yes',
      source,
      warn: message => warnings.push(message)
    });

    expect(existsSync(result.canonicalBinaryPath)).toBe(true);
    expect(warnings.join('\n')).toContain('Could not install Elements agent skill');
  });

  it('should resolve Windows canonical paths', () => {
    const paths = getInstallPaths({ LOCALAPPDATA: 'C:\\Users\\Ada\\AppData\\Local' }, 'win32');

    expect(paths.canonicalBinaryPath).toBe('C:\\Users\\Ada\\AppData\\Local\\nve\\bin\\nve.exe');
    expect(paths.windowsCommandShimPath).toBe('C:\\Users\\Ada\\AppData\\Local\\nve\\bin\\nve.cmd');
  });

  it('should resolve Windows canonical paths from NVE_HOME', () => {
    const paths = getInstallPaths({ NVE_HOME: 'C:\\Tools\\nve' }, 'win32');

    expect(paths.root).toBe('C:\\Tools\\nve');
    expect(paths.binDir).toBe('C:\\Tools\\nve\\bin');
    expect(paths.manifestPath).toBe('C:\\Tools\\nve\\manifest.json');
  });

  it('should quote Windows PowerShell path literals', () => {
    expect(installInternals.powershellSingleQuote("C:\\Users\\Ada's Tools\\nve")).toBe(
      "'C:\\Users\\Ada''s Tools\\nve'"
    );
  });

  it('should create a Windows command shim', async () => {
    const context = await createInstallerContext();
    const shimPath = join(context.root, 'nve.cmd');

    await installInternals.createWindowsCommandShim(shimPath);

    expect(await readFile(shimPath, 'utf-8')).toBe('@echo off\r\n"%~dp0nve.exe" %*\r\n');
  });

  it('should prepend Windows PATH entries without duplicating existing entries', () => {
    const env: NodeJS.ProcessEnv = { Path: 'C:\\Tools\\nve\\bin\\;C:\\Windows' };

    installInternals.prependPathEntry('C:\\Tools\\nve\\bin', env, 'win32');
    expect(env.PATH).toBeUndefined();

    installInternals.prependPathEntry('C:\\Users\\Ada\\bin', env, 'win32');
    expect(env.PATH).toBe('C:\\Users\\Ada\\bin;C:\\Tools\\nve\\bin\\;C:\\Windows');
    expect(env.Path).toBe(env.PATH);
  });

  it('should prepend Windows PATH entries to an empty path', () => {
    const env: NodeJS.ProcessEnv = {};

    installInternals.prependPathEntry('C:\\Tools\\nve\\bin', env, 'win32');

    expect(env.PATH).toBe('C:\\Tools\\nve\\bin');
    expect(env.Path).toBe('C:\\Tools\\nve\\bin');
  });

  it('should compare normalized Windows PATH entries case-insensitively', () => {
    expect(installInternals.hasPathEntry('C:\\Tools\\NVE\\bin\\', 'c:\\tools\\nve\\bin', 'win32')).toBe(true);
    expect(installInternals.normalizePathEntry('C:\\Tools\\NVE\\bin\\', 'win32')).toBe('c:\\tools\\nve\\bin');
  });

  it('should resolve manifest platform names', () => {
    expect(installInternals.getManifestPlatform('win32')).toBe('Windows');
    expect(installInternals.getManifestPlatform('linux')).toBe(`linux/${process.arch}`);
  });

  it('should read PATH entries from Windows Path fallback and empty environments', () => {
    expect(installInternals.getPathEntries({ Path: 'C:\\One;C:\\Two' }, 'win32')).toEqual(['C:\\One', 'C:\\Two']);
    expect(installInternals.getPathEntries({}, 'linux')).toEqual([]);
  });

  it('should return undefined when executable lookup has no matches', () => {
    expect(installInternals.findExecutableOnPath('nve', { Path: 'C:\\Missing' }, 'win32')).toBeUndefined();
    expect(installInternals.findExecutableOnPath('nve', {}, 'linux')).toBeUndefined();
  });

  it('should spawn Windows command shims through a shell', async () => {
    const context = await createInstallerContext();
    const commandShim = await writeFakeNve(join(context.root, 'nve.cmd'));

    const result = installInternals.spawnVersion(commandShim, {}, 'win32');

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('9.8.7-test');
  });

  it('should update Windows user PATH with PowerShell', async () => {
    const context = await createInstallerContext();
    const originalPath = process.env.PATH;
    await writeCommand(join(context.fakeBin, 'powershell'), '#!/bin/sh\nexit 0\n');

    try {
      process.env.PATH = `${context.fakeBin}:${originalPath ?? ''}`;
      const env: NodeJS.ProcessEnv = { Path: 'C:\\Windows' };
      const warnings: string[] = [];

      installInternals.setupWindowsPath('C:\\Tools\\nve\\bin', env, message => warnings.push(message));

      expect(warnings).toEqual([]);
      expect(env.PATH).toBe('C:\\Tools\\nve\\bin;C:\\Windows');
      expect(env.Path).toBe(env.PATH);
    } finally {
      restorePath(originalPath);
    }
  });

  it('should warn when Windows user PATH updates fail', async () => {
    const context = await createInstallerContext();
    const originalPath = process.env.PATH;
    await writeCommand(join(context.fakeBin, 'powershell'), '#!/bin/sh\nexit 1\n');

    try {
      process.env.PATH = `${context.fakeBin}:${originalPath ?? ''}`;
      const warnings: string[] = [];

      installInternals.setupWindowsPath('C:\\Tools\\nve\\bin', {}, message => warnings.push(message));

      expect(warnings.join('\n')).toContain('Could not update the user PATH. Add C:\\Tools\\nve\\bin manually.');
    } finally {
      restorePath(originalPath);
    }
  });

  it('should print Windows diagnostics', async () => {
    const context = await createInstallerContext();
    await writeCommand(
      join(context.fakeBin, 'powershell'),
      "#!/bin/sh\nprintf '%s\\n' 'C:\\Tools\\nve\\bin\\nve.cmd'\n"
    );
    await writeCommand(
      join(context.fakeBin, 'where.exe'),
      "#!/bin/sh\nprintf '%s\\n%s\\n' 'C:\\Tools\\nve\\bin\\nve.exe' 'C:\\Tools\\nve\\bin\\nve.cmd'\n"
    );

    const diagnostics = installInternals.getDiagnostics(
      {
        env: { PATH: context.fakeBin },
        log: () => {},
        now: () => new Date(0),
        paths: {
          binDir: 'C:\\Tools\\nve\\bin',
          canonicalBinaryPath: 'C:\\Tools\\nve\\bin\\nve.exe',
          manifestPath: 'C:\\Tools\\nve\\manifest.json',
          root: 'C:\\Tools\\nve',
          windowsCommandShimPath: 'C:\\Tools\\nve\\bin\\nve.cmd'
        },
        platform: 'win32',
        prompt: skipPrompt,
        source: '',
        warn: () => {}
      },
      '',
      true
    );

    expect(diagnostics).toContain('  PATH nve: not found');
    expect(diagnostics).toContain('  PATH Get-Command nve: C:\\Tools\\nve\\bin\\nve.cmd');
    expect(diagnostics).toContain('  PATH where.exe nve: C:\\Tools\\nve\\bin\\nve.exe, C:\\Tools\\nve\\bin\\nve.cmd');
    expect(diagnostics).toContain(
      '  Windows note: restart open terminals before expecting PATH changes to appear there.'
    );
  });

  it('should print failed restricted PATH diagnostics', () => {
    const diagnostics = installInternals.getDiagnostics(
      {
        env: { PATH: '' },
        log: () => {},
        now: () => new Date(0),
        paths: {
          binDir: '/tmp/nve/bin',
          canonicalBinaryPath: '/tmp/nve/bin/nve',
          manifestPath: '/tmp/nve/manifest.json',
          root: '/tmp/nve'
        },
        platform: 'linux',
        prompt: skipPrompt,
        source: '',
        warn: () => {}
      },
      '',
      false
    );

    expect(diagnostics).toContain('  restricted PATH direct execution: failed (/usr/bin:/bin:/usr/sbin:/sbin)');
    expect(diagnostics).toContain('  PATH command -v nve: not found');
    expect(diagnostics).toContain('  PATH nve: not found');
  });

  it('should print missing Windows command diagnostics', () => {
    const diagnostics = installInternals.getDiagnostics(
      {
        env: { PATH: '' },
        log: () => {},
        now: () => new Date(0),
        paths: {
          binDir: 'C:\\Tools\\nve\\bin',
          canonicalBinaryPath: 'C:\\Tools\\nve\\bin\\nve.exe',
          manifestPath: 'C:\\Tools\\nve\\manifest.json',
          root: 'C:\\Tools\\nve',
          windowsCommandShimPath: 'C:\\Tools\\nve\\bin\\nve.cmd'
        },
        platform: 'win32',
        prompt: skipPrompt,
        source: '',
        warn: () => {}
      },
      '',
      true
    );

    expect(diagnostics).toContain('  PATH Get-Command nve: not found');
    expect(diagnostics).toContain('  PATH where.exe nve: not found');
  });

  it('should print successful Unix command diagnostics', async () => {
    const context = await createInstallerContext();
    const source = await writeFakeNve(join(context.fakeBin, 'nve'));

    expect(installInternals.getCommandPath({ PATH: `${context.fakeBin}:/usr/bin:/bin` })).toBe(source);
  });

  it('should return an empty prompt answer in CI terminal prompting', async () => {
    const originalCi = process.env.CI;

    try {
      process.env.CI = 'true';
      await expect(installInternals.promptFromTerminal('question', 'linux')).resolves.toBeUndefined();
    } finally {
      restoreCi(originalCi);
    }
  });

  it('should read prompt answers from streams', async () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const answer = installInternals.readPrompt('Name? ', input, output);

    input.end('Ada\n');

    await expect(answer).resolves.toBe('Ada');
  });
});

describe('install.sh', () => {
  it('should show a TTY-only spinner for the binary download', async () => {
    const source = await readFile(installSh, 'utf-8');

    expect(source).toContain('MANIFEST_JSON="$(download_file "$BASE_URL/manifest.json")"');
    expect(source).toContain(
      'run_with_spinner "Downloading Elements CLI..." "Downloaded Elements CLI." download_file "$BASE_URL/$BINARY" "$TMP_FILE"'
    );
    expect(source).toContain('printf "\\r%s %s" "$frame" "$message" >&2');
  });

  it('should verify checksum and execute downloaded nve install', async () => {
    if (process.platform === 'win32') {
      const source = await readFile(installSh, 'utf-8');
      expect(source).toContain('manifest.json');
      return;
    }

    const context = await createInstallerContext();
    await writeDownloadFixture(context);

    const result = runInstaller(context);
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);

    const canonicalPath = join(context.home, '.nve/bin/nve');
    const directResult = spawnSync(canonicalPath, ['--version'], { encoding: 'utf-8' });
    expect(directResult.status).toBe(0);
    expect(directResult.stdout.trim()).toBe('9.8.7-test');
  });

  it('should fail before executing the binary when checksum verification fails', async () => {
    if (process.platform === 'win32') {
      const source = await readFile(installSh, 'utf-8');
      expect(source).toContain('Checksum verification failed');
      return;
    }

    const context = await createInstallerContext();
    await writeDownloadFixture(context, { badChecksum: true });

    const result = runInstaller(context);
    expect(result.status).toBe(1);
    expect(`${result.stdout}${result.stderr}`).toContain('Checksum verification failed');
    expect(existsSync(join(context.home, '.nve/bin/nve'))).toBe(false);
  });
});

describe('install.ts prompt behavior', () => {
  it('should prompt through /dev/tty on Unix when standard streams are piped', async () => {
    const source = await readFile(installTs, 'utf-8');

    expect(source).toContain("if (platform !== 'win32' && existsSync('/dev/tty'))");
    expect(source).not.toContain("platform !== 'win32' && process.stdout.isTTY && existsSync('/dev/tty')");
  });
});

describe('install.ps1', () => {
  it('should verify checksum and execute downloaded nve install', async () => {
    const source = await readFile(installPs1, 'utf-8');

    expect(source).toContain('manifest.json');
    expect(source).toContain('$downloadName = if ($runningOnWindows -and $entry.filename -notlike');
    expect(source).toContain('Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/$downloadName"');
    expect(source).toContain('Get-FileHash');
    expect(source).toContain('Checksum verification failed for $($entry.filename).');
    expect(source).toContain('& $tempBinary install $tempBinary');
  });
});

describe('write-install-manifest', () => {
  it('should emit the hosted Windows artifact filename', async () => {
    const source = await readFile(writeInstallManifest, 'utf-8');

    expect(source).toContain("{ key: 'windows-x64', filename: 'nve-windows-x64.exe', source: 'nve-windows-x64.exe' }");
  });
});

async function createInstallerContext(): Promise<InstallerContext> {
  const root = await mkdtemp(join(tmpdir(), 'nve-install-'));
  tempRoots.push(root);

  const home = join(root, 'home');
  const fakeBin = join(root, 'fake-bin');
  await mkdir(home, { recursive: true });
  await mkdir(fakeBin, { recursive: true });

  return { fakeBin, home, root };
}

function createUnixEnv({ fakeBin, home }: InstallerContext): NodeJS.ProcessEnv {
  const env = { ...process.env, HOME: home, PATH: fakeBin, SHELL: '/bin/zsh' };
  delete env.CI;
  return env;
}

async function skipPrompt(): Promise<undefined> {
  return undefined;
}

function getExpectedElementsSkillMarkdown(): string {
  const skill = skills.find(s => s.name === 'elements');
  if (!skill) {
    throw new Error('Elements skill not found');
  }
  return formatSkillMarkdown(skill);
}

async function writeFakeNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    ['#!/bin/sh', 'if [ "$1" = "--version" ]; then', '  echo "9.8.7-test"', '  exit 0', 'fi', 'exit 0', ''].join('\n')
  );
  await chmod(path, 0o755);
  return path;
}

async function writeStderrVersionFakeNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    [
      '#!/bin/sh',
      'if [ "$1" = "--version" ]; then',
      '  echo "9.8.7-stderr-test" >&2',
      '  exit 0',
      'fi',
      'exit 0',
      ''
    ].join('\n')
  );
  await chmod(path, 0o755);
  return path;
}

async function writeFailingNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, '#!/bin/sh\necho "bad version" >&2\nexit 2\n');
  await chmod(path, 0o755);
  return path;
}

async function writeStdoutFailingNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, '#!/bin/sh\necho "stdout failure"\nexit 3\n');
  await chmod(path, 0o755);
  return path;
}

async function writeSilentFailingNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, '#!/bin/sh\nexit 7\n');
  await chmod(path, 0o755);
  return path;
}

async function writeDownloadFixture(context: InstallerContext, options: { badChecksum?: boolean } = {}): Promise<void> {
  const serverDir = join(context.root, 'server');
  const platformKey = getCurrentPlatformKey();
  const binaryName = `nve-${platformKey}`;
  const binaryPath = await writeBootstrapFakeNve(join(serverDir, binaryName));
  const checksum = options.badChecksum ? '0'.repeat(64) : getFileChecksum(binaryPath);
  const manifest = { platforms: { [platformKey]: { filename: binaryName, checksum } } };

  await writeFile(join(serverDir, 'manifest.json'), JSON.stringify(manifest));
  await writeFakeCurl(context.fakeBin, serverDir);
}

async function writeBootstrapFakeNve(path: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    [
      '#!/bin/sh',
      'if [ "$1" = "--version" ]; then',
      '  echo "9.8.7-test"',
      '  exit 0',
      'fi',
      'if [ "$1" = "install" ]; then',
      '  root="${NVE_HOME:-$HOME/.nve}"',
      '  mkdir -p "$root/bin"',
      '  cp "$2" "$root/bin/nve"',
      '  chmod +x "$root/bin/nve"',
      '  printf \'{"cliName":"nve"}\\n\' > "$root/manifest.json"',
      '  exit 0',
      'fi',
      'exit 2',
      ''
    ].join('\n')
  );
  await chmod(path, 0o755);
  return path;
}

async function writeFakeCurl(fakeBin: string, serverDir: string): Promise<void> {
  const fakeCurl = join(fakeBin, 'curl');
  await writeCommand(
    fakeCurl,
    [
      '#!/bin/sh',
      'output=""',
      'url=""',
      'while [ "$#" -gt 0 ]; do',
      '  case "$1" in',
      '    -o) output="$2"; shift 2 ;;',
      '    -*) shift ;;',
      '    *) url="$1"; shift ;;',
      '  esac',
      'done',
      'name="${url##*/}"',
      `src="${serverDir}/$name"`,
      '[ -f "$src" ] || exit 1',
      'if [ -n "$output" ]; then',
      '  cp "$src" "$output"',
      'else',
      '  cat "$src"',
      'fi',
      ''
    ].join('\n')
  );
}

async function writeCommand(path: string, content: string): Promise<void> {
  await writeFile(path, content);
  await chmod(path, 0o755);
}

function restorePath(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.PATH;
    return;
  }

  process.env.PATH = value;
}

function restoreCi(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.CI;
    return;
  }

  process.env.CI = value;
}

function restoreHome(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.HOME;
    return;
  }

  process.env.HOME = value;
}

function restoreNveHome(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.NVE_HOME;
    return;
  }

  process.env.NVE_HOME = value;
}

function restoreShell(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.SHELL;
    return;
  }

  process.env.SHELL = value;
}

function restoreDebug(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.NVE_INSTALL_DEBUG;
    return;
  }

  process.env.NVE_INSTALL_DEBUG = value;
}

function runInstaller({ fakeBin, home }: InstallerContext): ReturnType<typeof spawnSync> {
  return spawnSync('sh', [installSh], {
    encoding: 'utf-8',
    env: {
      ...process.env,
      HOME: home,
      NVE_BASE_URL: 'https://example.invalid/cli',
      PATH: `${fakeBin}:/usr/bin:/bin:/usr/sbin:/sbin`,
      SHELL: '/bin/zsh'
    },
    timeout: 10000
  });
}

function getCurrentPlatformKey(): string {
  const os = process.platform === 'darwin' ? 'macos' : process.platform;
  const arch = process.arch === 'x64' ? 'x64' : 'arm64';
  return `${os}-${arch}`;
}

function getFileChecksum(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function countOccurrences(value: string, search: string): number {
  return value.split(search).length - 1;
}
