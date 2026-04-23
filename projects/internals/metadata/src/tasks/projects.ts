// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';
import { getProjects } from './projects.utils.ts';

const projects = await getProjects();

writeFileSync('./static/projects.json', JSON.stringify(projects, null, 2));
console.log('✅ Projects generated successfully.');
