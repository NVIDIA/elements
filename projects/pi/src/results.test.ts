// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createElementsToolResult, getElementsToolError } from './results.js';

const outputDirectories = new Set<string>();

describe('Elements tool results', () => {
  afterEach(async () => {
    await Promise.all([...outputDirectories].map(path => rm(path, { recursive: true, force: true })));
    outputDirectories.clear();
  });

  it('should return string results', async () => {
    const result = await createElementsToolResult('call', 'elements_api_get', {
      status: 'complete',
      result: 'Documentation'
    });
    expect(result.content).toEqual([{ type: 'text', text: 'Documentation' }]);
    expect(result.details.result).toBe('Documentation');
  });

  it('should format structured results', async () => {
    const result = await createElementsToolResult('call', 'elements_api_get', {
      status: 'complete',
      result: { name: 'nve-button' }
    });
    expect(result.content[0]).toEqual({ type: 'text', text: '{\n  "name": "nve-button"\n}' });
  });

  it('should use the completion message when result is absent', async () => {
    const result = await createElementsToolResult('call', 'elements_api_get', {
      status: 'complete',
      message: 'Done'
    });
    expect(result.content[0]).toEqual({ type: 'text', text: 'Done' });
  });

  it('should truncate large output and save the complete value', async () => {
    const output = Array.from({ length: 2100 }, (_, index) => `line ${index}`).join('\n');
    const result = await createElementsToolResult('call:unsafe', 'elements_api_list', {
      status: 'complete',
      result: output
    });
    const outputPath = result.details.truncation?.outputPath;
    const outputDirectory = dirname(outputPath!);
    outputDirectories.add(outputDirectory);
    expect(outputPath).toContain('call_unsafe.txt');
    expect(outputDirectory.startsWith(join(tmpdir(), 'nvidia-elements-pi-'))).toBe(true);
    expect(result.details.result).toBeUndefined();
    expect(result.content[0]?.type === 'text' ? result.content[0].text : '').toContain('Output truncated');
    await expect(readFile(outputPath!, 'utf8')).resolves.toBe(output);
    await expect(stat(outputDirectory).then(value => value.mode & 0o777)).resolves.toBe(0o700);
    await expect(stat(outputPath!).then(value => value.mode & 0o777)).resolves.toBe(0o600);

    const secondResult = await createElementsToolResult('call:unsafe', 'elements_api_list', {
      status: 'complete',
      result: output
    });
    const secondOutputDirectory = dirname(secondResult.details.truncation!.outputPath);
    outputDirectories.add(secondOutputDirectory);
    expect(secondOutputDirectory).not.toBe(outputDirectory);
  });

  it('should create errors with structured context', () => {
    const error = getElementsToolError({ status: 'error', message: 'Invalid', result: { field: 'name' } });
    expect(error.message).toContain('Invalid');
    expect(error.message).toContain('"field": "name"');
  });

  it('should provide a fallback error message', () => {
    expect(getElementsToolError({ status: 'error' }).message).toBe('Elements tool failed.');
  });
});
