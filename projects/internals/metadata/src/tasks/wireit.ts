#!/usr/bin/env node

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0


import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateGraphData } from './wireit.utils.ts';

writeFileSync(resolve(import.meta.dirname, '../../static/wireit.json'), JSON.stringify(generateGraphData(), null, 2));
console.log(`✅ Wireit graph data generated successfully.`);
