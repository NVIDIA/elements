// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getProjects } from './projects.utils.js';

describe('ProjectsUtils', () => {
  it('should return the projects json', async () => {
    const projects = getProjects();
    expect(projects).toBeDefined();
    expect(projects.created).toBeDefined();
    expect(projects.data.length).toBeGreaterThan(0);
    expect(projects.data[0].name).toBeDefined();
    expect(projects.data[0].version).toBeDefined();
    expect(projects.data[0].description).toBeDefined();
    expect(projects.data[0].readme).toBeDefined();
    expect(projects.data[0].changelog).toBeDefined();
  });
});
