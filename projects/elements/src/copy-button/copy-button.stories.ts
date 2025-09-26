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
 * @summary Demonstrates the standard usage for copying text to clipboard.
 */
export const Default = {
  render: () => html`
    <nve-copy-button value="hello" aria-label="copy value" behavior-copy></nve-copy-button>
  `
}

/**
 * @summary Copy button in disabled state. Useful for showing when copying is not available or when the user doesn't have permission to copy.
 */
export const Disabled = {
  render: () => html`
    <nve-copy-button disabled value="hello"></nve-copy-button>
  `
}

/**
 * @summary Copy buttons with flat container styling, showing both enabled and disabled states. Ideal for inline usage where minimal visual impact is desired.
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
 */
export const Size = {
  render: () => html`
    <nve-copy-button size="sm"></nve-copy-button>
    <nve-copy-button></nve-copy-button>
    <nve-copy-button size="lg"></nve-copy-button>
  `
}

/**
 * @summary Copy button integrated with text content, showing how to copy truncated values like commit hashes. Perfect for code snippets, IDs, or other long text that needs to be copied while displaying a shortened version.
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
 * @summary Copy button with custom icon in the icon slot. Demonstrates how to customize the button appearance while maintaining copy functionality. Useful for context-specific icons like git branches, URLs, or other specialized content.
 */
export const Icon = {
  render: () => html`
    <nve-copy-button value="ssh://git@github.com:12051/NVIDIA/elements.git" aria-label="copy git branch" behavior-copy>
      <nve-icon name="branch" slot="icon"></nve-icon>
    </nve-copy-button>
  `
}

/**
 * @summary Advanced pattern/example demonstrating how to handle long-running copy to clipboard operations.
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
