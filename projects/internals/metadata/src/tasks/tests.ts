// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';
import { generateTestSummary } from './tests.utils.ts';

const summary = await generateTestSummary();

writeFileSync('./static/tests.json', JSON.stringify(summary, null, 2));
console.log('✅ Test summary generated successfully.');
