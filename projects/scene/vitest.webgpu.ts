// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mergeConfig } from 'vitest/config';
import { libraryWebGPUTestConfig } from '@internals/vite/webgpu';

export default mergeConfig(libraryWebGPUTestConfig, {
  root: import.meta.dirname
});
