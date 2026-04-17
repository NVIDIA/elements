// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MonacoProblems } from '@nvidia-elements/monaco/problems';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

define(MonacoProblems);
define(MonacoEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-problems']: MonacoProblems;
  }
}
