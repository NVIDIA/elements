// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

define(MonacoDiffInput);
define(MonacoDiffEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-diff-input']: MonacoDiffInput;
  }
}
