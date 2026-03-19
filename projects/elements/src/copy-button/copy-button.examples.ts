// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/progress-ring/define.js';

export default {
  title: 'Elements/Copy Button',
  component: 'nve-copy-button',
};

/**
 * @summary Standard copy button for copying text to the clipboard on click.
 */
export const Default = {
  render: () => html`
    <nve-copy-button value="hello" aria-label="copy value" behavior-copy></nve-copy-button>
  `
}

/**
 * @summary Copy button in disabled state. Useful for showing when copying is not available or when the user doesn't have permission to copy.
 * @tags test-case
 */
export const Disabled = {
  render: () => html`
    <nve-copy-button disabled value="hello"></nve-copy-button>
  `
}

/**
 * @summary Copy buttons with flat container styling, showing both enabled and disabled states. Ideal for inline usage where minimal visual impact matters.
 * @tags test-case
 */
export const Flat = {
  render: () => html`
    <nve-copy-button container="flat" value="hello"></nve-copy-button>
    <nve-copy-button container="flat" disabled value="hello"></nve-copy-button>
  `
}

/**
 * @summary Copy button with behavior-copy attribute that automatically handles the copy functionality. Simplifies implementation by providing built-in copy behavior.
 */
export const BehaviorCopy = {
  render: () => html`
    <nve-copy-button value="hello" behavior-copy></nve-copy-button>
  `
}

/**
 * @summary Copy buttons in different sizes (small, default, large). Useful for adapting to different UI contexts and design requirements.
 * @tags test-case
 */
export const Size = {
  render: () => html`
    <nve-copy-button size="sm"></nve-copy-button>
    <nve-copy-button></nve-copy-button>
    <nve-copy-button size="lg"></nve-copy-button>
  `
}

/**
 * @summary Copy button integrated with text content, showing how to copy truncated values like commit hashes. Perfect for code snippets, IDs, or other long text that users copy while viewing a shortened version.
 */
export const Hint = {
  render: () => html`
    <h2 nve-text="body lg" nve-layout="row align:vertical-center">
      2d628479c...
      <nve-copy-button container="flat" value="2d628479cf2db27cbdebbfe41a42f1c9e07c46a8" aria-label="2d628479cf2db27cbdebbfe41a42f1c9e07c46a8" behavior-copy></nve-copy-button>
    </h2>
  `
}

/**
 * @summary Copy button with custom icon in the icon slot. Customizes the button appearance while maintaining copy functionality. Useful for context-specific icons like git branches, URLs, or other specialized content.
 */
export const Icon = {
  render: () => html`
    <nve-copy-button value="ssh://git@github.com:12051/NVIDIA/elements.git" aria-label="copy git branch" behavior-copy>
      <nve-icon name="branch" slot="icon"></nve-icon>
    </nve-copy-button>
  `
}

/**
 * @summary Advanced pattern for handling long-running copy to clipboard operations.
 * @tags test-case
 */
export const AsyncCopy = {
  render: () => html`
    <nve-copy-button id="async-copy-button" value="initial value" aria-label="copy value" behavior-copy></nve-copy-button>

    <script type="module">
      const button = document.querySelector('#async-copy-button');
      button.addEventListener('pointerdown', () => {
        button.disabled = true;

        // do an async operation
        new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
          button.value = 'async value';
          button.disabled = false;
          button.dispatchEvent(new Event('click'));
        });
      });
    </script>
  `
}

/**
 * @summary Popover position override in a copy button.
 * @tags test-case
 */
export const TooltipPositionOverride = {
  render: () => html`
    <style>
      nve-copy-button.override-position-example {
        &::part(tooltip-arrow) {
          position-area: right center;
          translate: -50% 0%;
          transform: translate(-2px, 0) rotate(45deg);
        }
      }
    </style>
    <nve-copy-button class="override-position-example" value="hello" aria-label="copy value" behavior-copy style="position: absolute; top: 12px; right: 12px;"></nve-copy-button>
  `
}
