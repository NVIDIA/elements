// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import '@nvidia-elements/monaco/diff-editor/define.js';

define(MonacoDiffInput);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-diff-input']: MonacoDiffInput;
  }
}
