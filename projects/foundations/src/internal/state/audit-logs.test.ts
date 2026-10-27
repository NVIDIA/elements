// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getDuplicatePackageGlobalVersionWarning, getDuplicatePackageVersionWarning } from './audit-logs.js';

describe('getDuplicatePackageVersionWarning', () => {
  it('should return warning message for a duplicate localName package version', () => {
    expect(getDuplicatePackageVersionWarning('nve-button', '1.2.3')).toBe(
      `@nve: nve-button version 1.2.3 already defined, check for duplicate package versions. https://nvidia.github.io/elements/docs/api-design/logs/#duplicate-package-version`
    );
  });
});

describe('getDuplicatePackageGlobalVersionWarning', () => {
  it('should return warning message for duplicate package version', () => {
    expect(getDuplicatePackageGlobalVersionWarning()).toBe(
      `@nve: Multiple versions loaded. https://nvidia.github.io/elements/docs/api-design/logs/#duplicate-package-version`
    );
  });
});
