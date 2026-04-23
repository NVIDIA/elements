// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import tokenJSON from '@nvidia-elements/themes/index.json';

const tokens = Object.keys(tokenJSON).map(k => `--${k}`);
const size = tokens.filter(t => t.includes('ref-size'));
const space = tokens.filter(t => t.includes('ref-space'));
const color = tokens.filter(t => t.includes('ref-color'));
const borderRadius = tokens.filter(t => t.includes('ref-border-radius'));
const borderColor = tokens.filter(t => t.includes('ref-border-color'));
const borderWidth = tokens.filter(t => t.includes('ref-border-width'));
const opacity = tokens.filter(t => t.includes('ref-opacity'));
const status = tokens.filter(t => t.includes('sys-status'));
const accent = tokens.filter(t => t.includes('sys-accent'));
const text = tokens.filter(t => t.includes('sys-text') && t.includes('color'));
const interaction = tokens.filter(t => t.includes('sys-interaction'));
const layer = tokens.filter(t => t.includes('sys-layer'));
const fontSize = tokens.filter(t => t.includes('ref-font-size'));
// const fontFamily = tokens.filter(t => t.includes('ref-font-family'));
// const fontWeight = tokens.filter(t => t.includes('ref-font-weight'));
// const fontLineHeight = tokens.filter(t => t.includes('ref-font-line-height'));

describe('theme visual', () => {
  test('size should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.size',
      size.map(token => `<div style="width: var(${token}); height: 24px; background: #000"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('space should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.space',
      space.map(token => `<div style="width: var(${token}); height: 24px; background: #000"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('font size should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.font-size',
      fontSize
        .map(token => `<div style="width: var(${token}); height: var(${token}); background: #000"></div>`)
        .join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('color should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.color',
      color.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('border-radius should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.border-radius',
      borderRadius
        .map(token => `<div style="border-radius: var(${token}); height: 24px; outline: 1px solid #000"></div>`)
        .join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('border-color should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.border-color',
      borderColor.map(token => `<div style="border: 4px solid var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('border-width should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.border-width',
      borderWidth.map(token => `<div style="border: var(${token}) solid #000; height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('opacity should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.opacity',
      opacity.map(token => `<div style="opacity: var(${token}); background: #000; height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('status should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.status',
      status.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('accent should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.accent',
      accent.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('text should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.text',
      text.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('interaction should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.interaction',
      interaction.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('layer should match visual baseline', async () => {
    const report = await visualRunner.render(
      'theme.layer',
      layer.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n')
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

const darkThemeScript = `<script type="module">document.documentElement.setAttribute('nve-theme', 'dark');</script>`;

describe('dark theme visual', () => {
  test('color should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.color',
      color.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') + darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('border-color should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.border-color',
      borderColor.map(token => `<div style="border: 4px solid var(${token}); height: 24px;"></div>`).join('\n') +
        darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('opacity should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.opacity',
      opacity.map(token => `<div style="opacity: var(${token}); background: #000; height: 24px;"></div>`).join('\n') +
        darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('status should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.status',
      status.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') + darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('accent should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.accent',
      accent.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') + darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('text should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.text',
      text.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') + darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('interaction should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.interaction',
      interaction.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') +
        darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('layer should match visual baseline', async () => {
    const report = await visualRunner.render(
      'dark.layer',
      layer.map(token => `<div style="background: var(${token}); height: 24px;"></div>`).join('\n') + darkThemeScript
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
