// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAdoptionData } from './adoption.utils.ts';

const adoption = await getAdoptionData();
const errors = [...adoption.packages.flatMap(packageData => packageData.errors), ...adoption.github.errors];

writeFileSync(resolve(import.meta.dirname, '../../static/adoption.json'), JSON.stringify(adoption, null, 2));

if (errors.length > 0) {
  console.warn(`⚠️ Adoption metrics generated with ${errors.length} unavailable source response(s).`);
} else {
  console.log('✅ Adoption metrics generated successfully.');
}
