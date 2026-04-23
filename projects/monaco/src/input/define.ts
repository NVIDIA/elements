// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

define(MonacoInput);
define(MonacoEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-input']: MonacoInput;
  }
}
