// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { mergeConfig } from 'vitest/config';
import { libraryBenchConfig } from '@internals/vite/configs/bench.js';

export default mergeConfig(libraryBenchConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/scene': resolve(import.meta.dirname, './src') }
  }
});
