// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { CodeBlock, CodeBlockHeader, CodeBlockFooter } from './index.js';
import { CodeBlockAlias } from './code-block.js';

define(CodeBlock);
define(CodeBlockAlias);
define(CodeBlockHeader);
define(CodeBlockFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-code-block': CodeBlock;
    'nve-codeblock': CodeBlock;
    'nve-code-block-header': CodeBlockHeader;
    'nve-code-block-footer': CodeBlockFooter;
  }
}
