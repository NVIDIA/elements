// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Report } from '../internal/types.js';

const CORE_DEPENDENCIES = ['@nvidia-elements/core', '@nvidia-elements/themes', '@nvidia-elements/styles'];

function readPackageJson(path: string): Record<string, unknown> | 'missing' | 'invalid' {
  if (!existsSync(path)) return 'missing';
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return 'invalid';
  }
}

function hasExistingElementsDeps(packageJson: Record<string, unknown>): boolean {
  const dependencies = (packageJson.dependencies ?? {}) as Record<string, string>;
  const devDependencies = (packageJson.devDependencies ?? {}) as Record<string, string>;
  return CORE_DEPENDENCIES.some(dep => dependencies[dep] || devDependencies[dep]);
}

export function setupProject(cwd: string): Report {
  const packageJsonPath = resolve(join(cwd, 'package.json'));
  const packageJson = readPackageJson(packageJsonPath);

  if (packageJson === 'missing') {
    return { dependencies: { message: 'No package.json found. Skipping project setup.', status: 'warning' } };
  }
  if (packageJson === 'invalid') {
    return { dependencies: { message: 'Failed to parse package.json. Skipping project setup.', status: 'danger' } };
  }
  if (hasExistingElementsDeps(packageJson)) {
    return { dependencies: { message: 'Project already has Elements dependencies.', status: 'info' } };
  }

  const dependencies = { ...((packageJson.dependencies ?? {}) as Record<string, string>) };
  for (const dep of CORE_DEPENDENCIES) {
    dependencies[dep] = 'latest';
  }
  packageJson.dependencies = dependencies;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  return {
    dependencies: {
      message:
        'Added Elements core dependencies (@nvidia-elements/core, @nvidia-elements/themes, @nvidia-elements/styles) to package.json.',
      status: 'success'
    }
  };
}
