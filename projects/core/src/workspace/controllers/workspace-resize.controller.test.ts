// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspaceResizeController } from './workspace-resize.controller.js';
import { allocateWorkspace } from '../utils/geometry/allocation.utils.js';

import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';

import type { WorkspaceLayout } from '../utils/model/layout.utils.js';

import '@nvidia-elements/core/resize-handle/define.js';

class ResizeTestHost extends LitElement {
  resizePolicy = 'stop' as const;
  readonly commit = vi.fn();
  readonly layout: WorkspaceLayout = {
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1, 1],
      children: ['a', 'b', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
    }
  };

  readonly resize = new WorkspaceResizeController(this, {
    isEnabled: () => true,
    getLayout: () => this.layout,
    getBoundaries: () => this.boundaries,
    getAvailablePanels: () => ['a', 'b', 'c'],
    getPresentation: () => ({
      measurements: {
        gap: 6,
        width: 912,
        height: 250,
        headerHeight: 30,
        gripWidth: 0,
        actionWidth: 0,
        tabWidth: 100,
        tabMinWidth: 0
      },
      rearrangeable: false,
      closable: false,
      fullscreenable: false
    }),
    cancelForUser: () => this.resize.cancel(),
    commitLayout: layout => this.commit(layout)
  });

  get boundaries() {
    return allocateWorkspace({
      root: (this.resize.preview ?? this.layout).root,
      rect: { x: 0, y: 0, width: 912, height: 250 },
      gap: 6,
      minimum: node => ({ width: node?.type === 'group' && node.panels[0] === 'b' ? 250 : 120, height: 30 }),
      policy: this.resizePolicy
    }).boundaries;
  }

  render() {
    const boundary = this.boundaries[0]!;
    return html`
      <nve-resize-handle
        data-boundary=${boundary.key}
        .min=${boundary.min}
        .max=${boundary.max}
        .value=${boundary.value}
        @input=${(event: Event) => this.resize.input(event, boundary)}
        @change=${(event: Event) => this.resize.change(event, boundary)}></nve-resize-handle>
      <output>${boundary.value}</output>
    `;
  }
}

const tag = 'workspace-resize-test-host';
if (!customElements.get(tag)) customElements.define(tag, ResizeTestHost);

describe('workspace resize input batching', () => {
  let fixture: HTMLElement;
  let host: ResizeTestHost;
  let handle: ResizeHandle;

  beforeEach(async () => {
    fixture = await createFixture(html`<workspace-resize-test-host></workspace-resize-test-host>`);
    host = fixture.querySelector<ResizeTestHost>(tag)!;
    await elementIsStable(host);
    handle = host.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
  });

  afterEach(() => removeFixture(fixture));

  it('uses the latest resize input before rendering an unrelated update', async () => {
    const origin = handle.valueAsNumber;
    for (let delta = 1; delta <= 40; delta++) {
      handle.valueAsNumber = origin + delta;
      handle.dispatchEvent(new Event('input', { bubbles: true }));
    }
    expect(host.resize.preview).toBeUndefined();
    host.requestUpdate();
    await host.updateComplete;
    expect(host.resize.preview).toBeDefined();
    expect(Number(host.shadowRoot!.querySelector('output')!.textContent)).toBeCloseTo(origin + 40);
    expect(handle.valueAsNumber).toBeCloseTo(origin + 40);
  });

  it('reuses the current resize preview for identical input and final change', async () => {
    handle.valueAsNumber += 20;
    handle.dispatchEvent(new Event('input', { bubbles: true }));
    await host.updateComplete;
    const preview = host.resize.preview;
    expect(preview).toBeDefined();
    for (let index = 0; index < 40; index++) {
      handle.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await host.updateComplete;
    expect(host.resize.preview).toBe(preview);
    handle.dispatchEvent(new Event('change', { bubbles: true }));
    expect(host.commit).toHaveBeenCalledOnce();
    expect(host.commit).toHaveBeenCalledWith(preview);
  });

  it.each(['escape', 'restore', 'disconnect'] as const)('discards pending resize input on %s', async action => {
    const layout = structuredClone(host.layout);
    const origin = handle.valueAsNumber;
    handle.valueAsNumber += 20;
    handle.dispatchEvent(new Event('input', { bubbles: true }));
    expect(host.resize.preview).toBeUndefined();
    if (action === 'escape') {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    } else if (action === 'restore') {
      host.resize.resetForRestore();
    } else {
      host.remove();
      fixture.append(host);
    }
    await host.updateComplete;
    host.requestUpdate();
    await host.updateComplete;
    expect(host.resize.preview).toBeUndefined();
    expect(Number(host.shadowRoot!.querySelector('output')!.textContent)).toBe(origin);
    expect(host.layout).toEqual(layout);
    expect(host.commit).not.toHaveBeenCalled();
  });
});
