// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';
import * as monaco from './index.js';

describe('VERSION', () => {
  it('should export a VERSION const', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should be pre-configured with modern TypeScript compiler options defaults suitable for in-browser validation', () => {
    const compilerOptions = monaco.typescript.typescriptDefaults.getCompilerOptions();
    expect(compilerOptions.module).toBe(monaco.typescript.ModuleKind.ESNext);
    expect(compilerOptions.target).toBe(monaco.typescript.ScriptTarget.ESNext);
    expect(compilerOptions.isolatedModules).toBe(true);
    expect(compilerOptions.allowNonTsExtensions).toBe(true);
    expect(compilerOptions.moduleDetection).toBe(3 /* monaco.languages.typescript.ModuleDetectionKind.Force */);
  });
});
