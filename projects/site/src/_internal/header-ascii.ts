// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAsciiRenderer } from './ascii-eye.js';

const logo = globalThis.document.querySelector<HTMLElement>('.docs-ascii-logo');
const output = logo?.querySelector('pre');
const renderFrame = createAsciiRenderer();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let yaw = 0;
let frame = 0;
let lastTime = 0;

function render() {
  if (output) output.textContent = renderFrame(yaw);
}

// Measure before scaling so font rounding cannot stretch or clip the eye.
function fit() {
  if (!logo || !output || !output.offsetWidth || !output.offsetHeight) return;
  const { width, height } = logo.getBoundingClientRect();
  output.style.transform = `scale(${width / output.offsetWidth}, ${height / output.offsetHeight})`;
}

function tick(time: number) {
  if (time - lastTime >= 1000 / 24) {
    yaw += lastTime ? Math.min((time - lastTime) / 1000, 0.1) * 1.2 : 0;
    lastTime = time;
    render();
  }
  frame = requestAnimationFrame(tick);
}

function update() {
  cancelAnimationFrame(frame);
  lastTime = 0;
  if (logo?.matches(':hover') && !reducedMotion.matches && !globalThis.document.hidden) {
    frame = requestAnimationFrame(tick);
  } else {
    yaw = 0;
    render();
  }
}

if (logo && output) {
  render();
  fit();
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(logo);
  resizeObserver.observe(output);
  logo.addEventListener('pointerenter', update);
  logo.addEventListener('pointerleave', update);
  reducedMotion.addEventListener('change', update);
  globalThis.document.addEventListener('visibilitychange', update);
}
