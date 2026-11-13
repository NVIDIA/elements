// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('interaction visual', () => {
  test('interaction should match visual baseline', async () => {
    const report = await visualRunner.render('interaction', interaction());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('interaction should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('interaction.dark', interaction('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

describe('interaction button visual', () => {
  test('interaction button should match visual baseline', async () => {
    const report = await visualRunner.render('interaction-button', interactionButton());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('interaction button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('interaction-button.dark', interactionButton('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function interaction(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    body {
      height: 720px;
    }

    .nve-menu {
      display: flex;
      flex-direction: column;
      max-width: 200px;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .nve-menu-item {
      width: 100%;
      display: block;
      border: 0;
      cursor: pointer;
      text-align: left;
      padding: var(--nve-ref-size-200) var(--nve-ref-size-300);
      color: var(--nve-sys-interaction-color);
      font-size: var(--nve-ref-font-size-300);
      border-radius: var(--nve-ref-border-radius-xs);
      background-image: linear-gradient(color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio)) 0 0) !important;
    }

    .nve-menu-item:hover,
    .nve-menu-item[hover] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
    }

    .nve-menu-item:active,
    .nve-menu-item[active] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
    }

    .nve-menu-item[selected] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
    }

    .nve-menu-item[disabled] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
      cursor: not-allowed;
    }

    .nve-menu-item[readonly] {
      --nve-sys-interaction-state-ratio: 0;
    }

    .nve-menu-item:focus,
    .nve-menu-item[focused] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
      outline: 0 !important; /* disabled for VRT */
    }
  </style>
  <section>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item" hover>•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item" active>•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item" selected>•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item" disabled>•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
    <div class="nve-menu">
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item" focused>•︎•︎•︎•︎•︎•︎</div>
      <div class="nve-menu-item">•︎•︎•︎•︎•︎•︎</div>
    </div>
  </section>
  `;
}

function interactionButton(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    button {
      background: color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio, 0%));
      border: 0;
      padding: 12px;
      cursor: pointer;
      margin-bottom: 6px;
      width: 100px;
    }

    button:hover,
    button[hover] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
    }

    button:active,
    button[active] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
    }

    button:disabled,
    button[disabled] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
    }

    button[selected] {
      --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
    }
  </style>

  <section>
    <button>•︎•︎•︎•︎•︎•︎</button>
    <button hover>•︎•︎•︎•︎•︎•︎</button>
    <button active>•︎•︎•︎•︎•︎•︎</button>
    <button selected>•︎•︎•︎•︎•︎•︎</button>
    <button disabled>•︎•︎•︎•︎•︎•︎</button>
  </section>
  <section style="--nve-sys-interaction-state-base: var(--nve-sys-interaction-emphasis-background)">
    <button>•︎•︎•︎•︎•︎•︎</button>
    <button hover>•︎•︎•︎•︎•︎•︎</button>
    <button active>•︎•︎•︎•︎•︎•︎</button>
    <button selected>•︎•︎•︎•︎•︎•︎</button>
    <button disabled>•︎•︎•︎•︎•︎•︎</button>
  </section>
  `;
}
