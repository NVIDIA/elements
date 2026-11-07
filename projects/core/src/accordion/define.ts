// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/caret.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Accordion, AccordionHeader, AccordionContent, AccordionGroup } from '@nvidia-elements/core/accordion';

define(Accordion);
define(AccordionHeader);
define(AccordionContent);
define(AccordionGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-accordion': Accordion;
    'nve-accordion-header': AccordionHeader;
    'nve-accordion-content': AccordionContent;
    'nve-accordion-group': AccordionGroup;
  }
}
