// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['build/**/*.test.js', 'src/**/*.test.ts']
  }
});
