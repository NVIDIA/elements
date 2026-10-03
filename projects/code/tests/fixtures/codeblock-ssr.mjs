// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Share literal templates between Node rendering and browser hydration.
export function codeblockSSRFixture(mode, text) {
  // Lit bindings inside inert templates are unsupported. Escape this source
  // fixture as HTML; the syntax renderer itself only creates native ranges.
  const source =
    mode === 'property'
      ? nothing
      : mode === 'template'
        ? unsafeHTML(
            `<template>${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</template>`
          )
        : mode === 'pre'
          ? html`<pre><code>${text}</code></pre>`
          : text;
  return html`<nve-codeblock
    .code=${mode === 'property' ? text : undefined}
    language="javascript"
    .lineNumbers=${true}
    .highlight=${'1'}
  >${source}<button slot="actions" type="button">Copy</button></nve-codeblock>`;
}
