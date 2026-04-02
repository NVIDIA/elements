// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Report } from '../internal/types.js';

const CORE_DEPENDENCIES = ['@nvidia-elements/core', '@nvidia-elements/themes', '@nvidia-elements/styles'];

export function setupProject(cwd: string): Report {
  const packageJsonPath = resolve(join(cwd, 'package.json'));

  if (!existsSync(packageJsonPath)) {
    return {
      dependencies: {
        message: 'No package.json found. Skipping project setup.',
        status: 'warning'
      }
    };
  }

  let packageJson: Record<string, unknown>;
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  } catch {
    return {
      dependencies: {
        message: 'Failed to parse package.json. Skipping project setup.',
        status: 'danger'
      }
    };
  }

  const dependencies = (packageJson.dependencies ?? {}) as Record<string, string>;
  const devDependencies = (packageJson.devDependencies ?? {}) as Record<string, string>;
  const allDeps = { ...dependencies, ...devDependencies };

  const hasElementsDeps = CORE_DEPENDENCIES.some(dep => allDeps[dep]);
  if (hasElementsDeps) {
    return {
      dependencies: {
        message: 'Project already has Elements dependencies.',
        status: 'info'
      }
    };
  }

  const updatedDependencies = { ...dependencies };
  for (const dep of CORE_DEPENDENCIES) {
    updatedDependencies[dep] = 'latest';
  }

  packageJson.dependencies = updatedDependencies;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  return {
    dependencies: {
      message: 'Added Elements core dependencies (@nvidia-elements/core, @nvidia-elements/themes, @nvidia-elements/styles) to package.json.',
      status: 'success'
    }
  };
}
