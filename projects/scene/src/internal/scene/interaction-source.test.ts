// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScenePickHit } from '../pick/types.js';
import { SceneInteractionSource } from './interaction-source.js';

const sources: HTMLElement[] = [];

describe(SceneInteractionSource.name, () => {
  afterEach(() => {
    sources.forEach(source => source.remove());
    sources.length = 0;
    vi.restoreAllMocks();
  });

  it('positions and reuses the bound source for the latest hit', () => {
    const source = createSource();
    const project = vi.fn(() => ({ clientX: 80, clientY: 90, depth: 0.5, visibility: 'visible' as const }));
    const interactionSource = new SceneInteractionSource({
      getContainerRect: () => new DOMRect(10, 20, 200, 100),
      project
    });
    interactionSource.bind(source);

    expect(interactionSource.update(createHit())).toBe(source);
    expect(source.hidden).toBe(false);
    expect(source.style.transform).toBe('translate(39.5px, 39.5px)');

    interactionSource.refresh();
    expect(project).toHaveBeenCalledWith([1, 2, 3]);
    expect(source.style.transform).toBe('translate(69.5px, 69.5px)');
  });

  it('deactivates on a miss and keeps the last position when projection is clipped', () => {
    const source = createSource();
    const project = vi.fn(() => ({ clientX: 0, clientY: 0, depth: 2, visibility: 'clipped' as const }));
    const interactionSource = new SceneInteractionSource({
      getContainerRect: () => new DOMRect(10, 20, 200, 100),
      project
    });
    interactionSource.bind(source);
    interactionSource.update(createHit());

    interactionSource.refresh();
    expect(source.style.transform).toBe('translate(39.5px, 39.5px)');

    expect(interactionSource.update(null)).toBe(source);
    expect(source.hidden).toBe(true);
    expect(source.style.transform).toBe('');
  });
});

function createSource(): HTMLElement {
  const source = document.createElement('span');
  source.hidden = true;
  document.body.append(source);
  sources.push(source);
  return source;
}

function createHit(): ScenePickHit {
  const layer = document.createElement('div');
  const hit: ScenePickHit = {
    clientX: 50,
    clientY: 60,
    element: layer,
    featureId: 0,
    layer,
    target: { index: 0, kind: 'instance' },
    worldPosition: Object.freeze([1, 2, 3] as const)
  };
  return Object.freeze(hit);
}
