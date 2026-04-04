// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync } from 'node:fs';
import { getApi } from './api.utils.ts';

const api = await getApi();

writeFileSync('./static/api.json', JSON.stringify(api, null, 2));
console.log('✅ API generated successfully.');
