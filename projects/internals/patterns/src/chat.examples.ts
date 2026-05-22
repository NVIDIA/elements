// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/chat-message/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/textarea/define.js';

export default {
  title: 'Patterns/Chat',
  component: 'nve-patterns'
};

/**
 * @summary Centered page chat with a constrained message column and footer composer. Use for primary assistant experiences where the conversation is the main task and needs persistent input.
 * @tags pattern
 */
export const PageChat = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AI</nve-logo>
    <h1 slot="prefix" nve-text="heading sm">Assistant</h1>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <h2 nve-text="heading sm">Deployment risk review</h2>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column pad:lg align:horizontal-center">
    <section nve-layout="column gap:lg align:horizontal-stretch" aria-live="polite" aria-relevant="additions text" style="max-width: 520px; margin: 0 auto;">
      <nve-chat-message aria-label="user message" arrow-position="top-end" style="margin-inline-start: auto; max-width: 80%;">
      <nve-avatar slot="suffix" color="brand-green">NV</nve-avatar>
        Summarize the deployment risk for the new inference endpoint.
      </nve-chat-message>
      <nve-chat-message aria-label="assistant message" arrow-position="top-start" style="max-width: 80%;">
        <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
        The highest risk is the cold-start latency on the first request after scale-out. Keep the rollout limited to the staging pool until p95 startup time stays below the service target for three consecutive runs.
      </nve-chat-message>
      <nve-chat-message aria-label="user message" arrow-position="top-end" style="margin-inline-start: auto; max-width: 80%;">
        <nve-avatar slot="suffix" color="brand-green">NV</nve-avatar>
        What should the operator check first?
      </nve-chat-message>
    </section>
  </main>
  <form slot="footer" nve-layout="column gap:sm full pad:md" style="max-width: 520px; margin: 0 auto;">
    <nve-textarea>
      <textarea aria-label="Message Agent" name="message" rows="3" maxlength="4000" placeholder="Ask about this deployment"></textarea>
    </nve-textarea>
    <nve-button type="button" style="margin-inline-start: auto;">Send</nve-button>
  </form>
</nve-page>
  `
};

/**
 * @summary Right-side chat panel with persistent header, scrollable transcript, and footer composer. Use when chat supports a larger workspace without taking over the main content.
 * @tags pattern
 */
export const PanelChat = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">AI</nve-logo>
    <h1 slot="prefix" nve-text="heading sm">Prompt API Chat</h1>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
    <section nve-layout="column gap:md" style="max-width: 900px;">
      <h2 nve-text="heading">Model deployment</h2>
      <p nve-text="body">
        Keep the assistant available while operators inspect logs, metrics, and deployment details in the main workspace.
      </p>
    </section>
  </main>
  <nve-page-panel id="chat-panel" slot="right" aria-labelledby="chat-title">
    <nve-page-panel-header>
      <h2 id="chat-title" nve-text="heading sm">Assistant</h2>
    </nve-page-panel-header>
    <nve-page-panel-content>
      <section nve-layout="column gap:lg align:horizontal-stretch" aria-live="polite" aria-relevant="additions text" style="margin-inline-start: auto;">
        <nve-chat-message aria-label="user message" arrow-position="top-end" color="brand-green" style="margin-inline-start: auto;">
          How does the nve-badge work?
        </nve-chat-message>
        <nve-chat-message aria-label="assistant message" arrow-position="top-start">
          The badge communicates short status, count, or label information next to related content. Use status values when the badge describes system state and color values when it needs to match a broader visual category.
        </nve-chat-message>
      </section>
    </nve-page-panel-content>
    <nve-page-panel-footer>
      <form nve-layout="column gap:sm full">
        <nve-textarea>
          <textarea aria-label="Message Agent" name="message" rows="3" maxlength="4000" placeholder="Ask about NVIDIA Elements"></textarea>
        </nve-textarea>
        <nve-button type="button" style="margin-inline-start: auto;">Send</nve-button>
      </form>
    </nve-page-panel-footer>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Bottom-right anchored chat dialog with launcher button. Use for optional contextual help or assistant support that should stay available without changing the page layout.
 * @tags pattern
 */
export const PopoverChat = {
  render: () => html`
<nve-icon-button
  id="chat-launcher"
  popovertarget="chat-popover"
  interaction="emphasis"
  icon-name="chat-bubble"
  size="lg"
  aria-label="Open assistant"
  style="position: fixed; inset-block-end: var(--nve-ref-space-xl); inset-inline-end: var(--nve-ref-space-xl); z-index: 100;"
></nve-icon-button>
<nve-dialog
  id="chat-popover"
  anchor="chat-launcher"
  position="top"
  alignment="end"
  size="sm"
  closable
  style="--max-width: 320px; --min-height: 340px; margin: var(--nve-ref-space-sm)"
>
  <nve-dialog-header>
    <h2 nve-text="heading sm">Assistant</h2>
  </nve-dialog-header>
  <section nve-layout="column gap:md full" aria-live="polite" aria-relevant="additions text">
    <nve-chat-message aria-label="assistant message" arrow-position="top-start">
      I can help compare alerts, explain metrics, or draft a remediation checklist.
    </nve-chat-message>
    <nve-chat-message aria-label="user message" arrow-position="top-end" color="brand-green" style="margin-inline-start: auto;">
      Why did the deployment pause?
    </nve-chat-message>
    <nve-chat-message aria-label="assistant message" arrow-position="top-start">
      The canary paused because error rate exceeded the threshold for two consecutive windows.
    </nve-chat-message>
  </section>
  <nve-dialog-footer>
    <form nve-layout="column gap:sm full">
      <nve-textarea>
        <textarea aria-label="Message Agent" name="message" rows="2" maxlength="4000" placeholder="Ask for help"></textarea>
      </nve-textarea>
      <nve-button type="button" style="margin-inline-start: auto;">Send</nve-button>
    </form>
  </nve-dialog-footer>
</nve-dialog>
<script type="module">
  await customElements.whenDefined('nve-dialog');
  const dialog = document.querySelector('#chat-popover');
  const launcher = document.querySelector('#chat-launcher');
  if (dialog && launcher && !dialog.matches(':popover-open')) {
    dialog.showPopover({ source: launcher });
  }
</script>
  `
};
