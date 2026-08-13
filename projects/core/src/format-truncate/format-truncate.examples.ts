// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/format-truncate/define.js';

export default {
  title: 'Elements/FormatTruncate',
  component: 'nve-format-truncate'
};

/**
 * @summary Start, center, and end positions keep the most useful part of constrained text. Choose the position that matches how users distinguish each value.
 */
export const Default = {
  render: () => html`
    <div nve-layout="column gap:sm" style="max-width: 16rem">
      <nve-format-truncate position="start">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="end">training-pipeline-2026-08-05-production</nve-format-truncate>
    </div>
  `
};

/**
 * @summary Inherited heading, body, and code styles keep truncated text aligned with surrounding typography. Place the component inside semantic text elements to preserve their visual hierarchy.
 * @tags test-case
 */
export const Typography = {
  render: () => html`
    <div nve-layout="column gap:lg align:stretch" style="max-width: 16rem">
      <h2 nve-text="heading lg"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></h2>
      <p nve-text="body"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></p>
      <code nve-text="code sm muted"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></code>
    </div>
  `
};

/**
 * @summary Center truncation bias keeps units from either the start or end. Use end bias for shared suffixes and start bias for identifiers with meaningful endings.
 * @tags test-case
 */
export const Bias = {
  render: () => html`
    <div nve-layout="column gap:sm" style="max-width: 16rem">
      <nve-format-truncate position="center" bias="start" preserve="10">sha256:1234567890abcdef1234567890abcdef</nve-format-truncate>
      <nve-format-truncate position="center" bias="end" preserve="10">sha256:1234567890abcdef1234567890abcdef</nve-format-truncate>
    </div>
  `
};

/**
 * @summary Character, word, and path strategies preserve complete graphemes or meaningful text units. Match the strategy to identifiers, labels, or file paths.
 * @tags test-case
 */
export const Strategy = {
  render: () => html`
    <div nve-layout="column gap:sm" style="max-width: 16rem">
      <nve-format-truncate position="center" strategy="character" preserve="8">experiment-👩🏽‍💻-0123456789abcdef</nve-format-truncate>
      <nve-format-truncate position="center" strategy="word" preserve="3">NVIDIA autonomous vehicle training pipeline production run</nve-format-truncate>
      <nve-format-truncate position="center" strategy="path" preserve="2">/models/checkpoints/production/model.bin</nve-format-truncate>
    </div>
  `
};


/**
 * @summary Truncate applies inline to adjacent text nodes.
 * @tags test-case
 */
export const Inline = {
  render: () => html`
    <div nve-layout="row gap:sm" style="max-width: 16rem">
      <nve-format-truncate position="start">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="end">training-pipeline-2026-08-05-production</nve-format-truncate>
    </div>
  `
};

/**
 * @summary Truncate applies inline to heading text nodes.
 * @tags test-case
 */
export const Headings = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <h2 nve-text="heading lg" style="width: 100%; max-width: 16rem"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></h2>
      <h2 nve-text="heading" style="width: 100%; max-width: 16rem"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></h2>
      <h2 nve-text="heading sm" style="width: 100%; max-width: 16rem"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></h2>
    </div>
  `
};
