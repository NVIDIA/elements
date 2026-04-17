// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ControlGroup } from '../control-group/control-group.js';
import type { Control } from '../control/control.js';

export const breakpoints = {
  vertical: 300,
  verticalInline: 400,
  horizontal: 500,
  horizontalInline: 600
};

export function setupControlLayoutStates(control: Control | ControlGroup) {
  const initalLayout = control.layout;
  const resizeObserver = new ResizeObserver(entries => {
    if (!(control as Control).fitContent) {
      control.layout = getControlLayout(entries[0]!.contentRect.width, initalLayout);
    }
  });
  resizeObserver.observe(control);
  return resizeObserver;
}

export type ControlLayouts = 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

export function getControlLayout(width: number, initalLayout: ControlLayouts) {
  let layout: ControlLayouts = initalLayout;
  if (width < breakpoints.vertical) {
    layout = 'vertical';
  } else if (width < breakpoints.verticalInline) {
    layout = 'vertical-inline';
  } else if (width < breakpoints.horizontal) {
    layout = 'horizontal';
  } else if (width < breakpoints.horizontalInline) {
    layout = 'horizontal-inline';
  }

  const layouts: ControlLayouts[] = ['vertical', 'vertical-inline', 'horizontal', 'horizontal-inline'];
  if (layouts.indexOf(initalLayout) < layouts.indexOf(layout)) {
    layout = initalLayout;
  }

  return layout;
}

export function isInlineInputType(input: HTMLInputElement) {
  return input.type === 'radio' || input.type === 'checkbox';
}
