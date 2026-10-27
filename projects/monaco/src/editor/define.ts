// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

define(MonacoEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-editor']: MonacoEditor;
  }
}
