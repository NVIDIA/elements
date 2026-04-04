// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

let isExampleViewer = false;
let isIframe = false;
let editor = false;

try {
  isIframe = globalThis.window.self !== globalThis.window.top;
  isExampleViewer = !!globalThis.window.top?.location?.href?.includes('/examples/');
} catch {
  editor = true;
}

if ((isExampleViewer && isIframe) || editor) {
  const links = globalThis.document.getElementById('iframe-links')!;
  if (links) {
    links.hidden = false;
  }
}
