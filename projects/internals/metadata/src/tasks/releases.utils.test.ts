// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { parseVersion, determineReleaseType, getReleases } from './releases.utils.js';

vi.mock('node:child_process');

describe('parseVersion', () => {
  it('should parse a standard semantic version', () => {
    const result = parseVersion('1.2.3');
    expect(result).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it('should parse version with pre-release suffix', () => {
    const result = parseVersion('2.5.7-beta.1');
    expect(result).toEqual({ major: 2, minor: 5, patch: 7 });
  });

  it('should parse version with build metadata', () => {
    const result = parseVersion('3.0.1+build.123');
    expect(result).toEqual({ major: 3, minor: 0, patch: 1 });
  });

  it('should parse version with both pre-release and build metadata', () => {
    const result = parseVersion('1.0.0-alpha.1+build.456');
    expect(result).toEqual({ major: 1, minor: 0, patch: 0 });
  });

  it('should return null for version with leading v', () => {
    const result = parseVersion('v4.5.6');
    expect(result).toBeNull();
  });

  it('should return null for invalid version format', () => {
    expect(parseVersion('invalid')).toBeNull();
    expect(parseVersion('1.2')).toBeNull();
    expect(parseVersion('a.b.c')).toBeNull();
    expect(parseVersion('')).toBeNull();
  });

  it('should handle version with zeros', () => {
    const result = parseVersion('0.0.0');
    expect(result).toEqual({ major: 0, minor: 0, patch: 0 });
  });

  it('should handle version with large numbers', () => {
    const result = parseVersion('100.200.300');
    expect(result).toEqual({ major: 100, minor: 200, patch: 300 });
  });

  it('should handle version with extra text after patch', () => {
    const result = parseVersion('1.2.3-rc.1.something.else');
    expect(result).toEqual({ major: 1, minor: 2, patch: 3 });
  });
});

describe('determineReleaseType', () => {
  it('should return "feat" when no previous version is provided', () => {
    expect(determineReleaseType('1.0.0')).toBe('feat');
    expect(determineReleaseType('2.5.1', undefined)).toBe('feat');
  });

  it('should return "feat" when current version is invalid', () => {
    expect(determineReleaseType('invalid', '1.0.0')).toBe('feat');
  });

  it('should return "feat" when previous version is invalid', () => {
    expect(determineReleaseType('2.0.0', 'invalid')).toBe('feat');
  });

  it('should return "breaking" when major version increases', () => {
    expect(determineReleaseType('2.0.0', '1.9.9')).toBe('breaking');
    expect(determineReleaseType('3.0.0', '2.5.3')).toBe('breaking');
    expect(determineReleaseType('10.0.0', '9.99.99')).toBe('breaking');
  });

  it('should return "feat" when minor version increases', () => {
    expect(determineReleaseType('1.1.0', '1.0.9')).toBe('feat');
    expect(determineReleaseType('2.5.0', '2.4.3')).toBe('feat');
    expect(determineReleaseType('1.10.0', '1.9.5')).toBe('feat');
  });

  it('should return "fix" when patch version increases', () => {
    expect(determineReleaseType('1.0.1', '1.0.0')).toBe('fix');
    expect(determineReleaseType('2.5.3', '2.5.2')).toBe('fix');
    expect(determineReleaseType('1.2.10', '1.2.9')).toBe('fix');
  });

  it('should return "chore" when versions are the same', () => {
    expect(determineReleaseType('1.0.0', '1.0.0')).toBe('chore');
    expect(determineReleaseType('2.5.3', '2.5.3')).toBe('chore');
  });

  it('should handle versions with pre-release suffixes', () => {
    expect(determineReleaseType('2.0.0-beta.1', '1.9.0')).toBe('breaking');
    expect(determineReleaseType('1.1.0-alpha', '1.0.0')).toBe('feat');
    expect(determineReleaseType('1.0.1-rc.1', '1.0.0')).toBe('fix');
  });

  it('should prioritize major version change over minor and patch', () => {
    expect(determineReleaseType('2.5.10', '1.3.2')).toBe('breaking');
  });

  it('should prioritize minor version change over patch', () => {
    expect(determineReleaseType('1.5.10', '1.3.2')).toBe('feat');
  });

  it('should handle version zero releases', () => {
    expect(determineReleaseType('0.1.0', '0.0.1')).toBe('feat');
    expect(determineReleaseType('0.0.2', '0.0.1')).toBe('fix');
    expect(determineReleaseType('1.0.0', '0.9.9')).toBe('chore');
  });
});

describe('getReleases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array when no git output', () => {
    vi.mocked(execSync).mockReturnValue('');
    const releases = getReleases();
    expect(releases).toEqual([]);
  });

  it('should parse single release from git output', () => {
    const gitOutput = 'elements-v1.0.0|2024-01-15T10:00:00Z';
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      name: 'elements-v1.0.0',
      version: '1.0.0',
      date: '2024-01-15T10:00:00Z',
      type: 'feat'
    });
  });

  it('should parse multiple releases from git output', () => {
    const gitOutput = [
      'elements-v1.2.0|2024-01-20T10:00:00Z',
      'elements-v1.1.0|2024-01-15T10:00:00Z',
      'elements-v1.0.0|2024-01-10T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(3);
    expect(releases[0].version).toBe('1.2.0');
    expect(releases[1].version).toBe('1.1.0');
    expect(releases[2].version).toBe('1.0.0');
  });

  it('should determine correct release types based on version progression', () => {
    const gitOutput = [
      'elements-v2.0.0|2024-01-25T10:00:00Z',
      'elements-v1.2.0|2024-01-20T10:00:00Z',
      'elements-v1.1.1|2024-01-15T10:00:00Z',
      'elements-v1.1.0|2024-01-10T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(4);

    // Find each release and check type
    const v2_0_0 = releases.find(r => r.version === '2.0.0');
    const v1_2_0 = releases.find(r => r.version === '1.2.0');
    const v1_1_1 = releases.find(r => r.version === '1.1.1');
    const v1_1_0 = releases.find(r => r.version === '1.1.0');

    expect(v2_0_0?.type).toBe('breaking'); // major bump from 1.2.0
    expect(v1_2_0?.type).toBe('feat'); // minor bump from 1.1.1
    expect(v1_1_1?.type).toBe('fix'); // patch bump from 1.1.0
    expect(v1_1_0?.type).toBe('feat'); // first release for package
  });

  it('should handle multiple packages', () => {
    const gitOutput = [
      'elements-v1.1.0|2024-01-20T10:00:00Z',
      'styles-v2.0.0|2024-01-15T10:00:00Z',
      'elements-v1.0.0|2024-01-10T10:00:00Z',
      'styles-v1.5.0|2024-01-05T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(4);

    const elementsReleases = releases.filter(r => r.name.startsWith('elements-'));
    const stylesReleases = releases.filter(r => r.name.startsWith('styles-'));

    expect(elementsReleases).toHaveLength(2);
    expect(stylesReleases).toHaveLength(2);
  });

  it('should sort releases by date (newest first) in final output', () => {
    const gitOutput = [
      'elements-v1.0.0|2024-01-10T10:00:00Z',
      'styles-v1.0.0|2024-01-20T10:00:00Z',
      'themes-v1.0.0|2024-01-15T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(3);
    expect(releases[0].name).toBe('styles-v1.0.0');
    expect(releases[1].name).toBe('themes-v1.0.0');
    expect(releases[2].name).toBe('elements-v1.0.0');
  });

  it('should handle versions with pre-release tags', () => {
    const gitOutput = [
      'elements-v1.0.0-beta.1|2024-01-15T10:00:00Z',
      'elements-v1.0.0-alpha.1|2024-01-10T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(2);
    expect(releases[0].version).toBe('1.0.0-beta.1');
    expect(releases[1].version).toBe('1.0.0-alpha.1');
  });

  it('should skip lines without valid tag format', () => {
    const gitOutput = [
      'elements-v1.0.0|2024-01-15T10:00:00Z',
      'invalid-tag-format',
      'elements-v1.1.0|2024-01-20T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(2);
    expect(releases[0].version).toBe('1.1.0');
    expect(releases[1].version).toBe('1.0.0');
  });

  it('should skip lines with missing date', () => {
    const gitOutput = [
      'elements-v1.0.0|2024-01-15T10:00:00Z',
      'elements-v1.1.0|',
      'elements-v1.2.0|2024-01-20T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(2);
    expect(releases.some(r => r.version === '1.1.0')).toBe(false);
  });

  it('should handle package names with hyphens', () => {
    const gitOutput = ['elements-react-v1.0.0|2024-01-15T10:00:00Z', 'labs-code-v2.0.0|2024-01-20T10:00:00Z'].join(
      '\n'
    );
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(2);
    expect(releases[0].name).toBe('labs-code-v2.0.0');
    expect(releases[1].name).toBe('elements-react-v1.0.0');
  });

  it('should return empty array when execSync throws an error', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git command failed');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const releases = getReleases();
    expect(releases).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting releases from git:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle whitespace in git output', () => {
    const gitOutput = '  elements-v1.0.0|2024-01-15T10:00:00Z  \n  ';
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0].version).toBe('1.0.0');
  });

  it('should correctly track release types within each package', () => {
    const gitOutput = [
      'elements-v1.1.0|2024-01-20T10:00:00Z',
      'styles-v1.0.1|2024-01-18T10:00:00Z',
      'elements-v1.0.0|2024-01-15T10:00:00Z',
      'styles-v1.0.0|2024-01-10T10:00:00Z'
    ].join('\n');
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();

    const elementsV1_1_0 = releases.find(r => r.name === 'elements-v1.1.0');
    const elementsV1_0_0 = releases.find(r => r.name === 'elements-v1.0.0');
    const stylesV1_0_1 = releases.find(r => r.name === 'styles-v1.0.1');
    const stylesV1_0_0 = releases.find(r => r.name === 'styles-v1.0.0');

    expect(elementsV1_1_0?.type).toBe('feat');
    expect(elementsV1_0_0?.type).toBe('feat');
    expect(stylesV1_0_1?.type).toBe('fix');
    expect(stylesV1_0_0?.type).toBe('feat');
  });

  it('should handle complex version with build metadata', () => {
    const gitOutput = 'elements-v1.0.0+build.123|2024-01-15T10:00:00Z';
    vi.mocked(execSync).mockReturnValue(gitOutput);

    const releases = getReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0].version).toBe('1.0.0+build.123');
  });
});
