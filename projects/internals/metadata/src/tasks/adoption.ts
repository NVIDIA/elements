// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAdoptionData } from './adoption.utils.ts';

const adoption = await getAdoptionData();

writeFileSync(resolve(import.meta.dirname, '../../static/adoption.json'), JSON.stringify(adoption, null, 2));

console.log('✅ Adoption metrics generated successfully.');
