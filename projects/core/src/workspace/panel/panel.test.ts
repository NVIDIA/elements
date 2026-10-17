// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspacePanel } from '@nvidia-elements/core/workspace';
import '@nvidia-elements/core/workspace/define.js';

const configuration = {
  selected: true,
  offset: 12,
  animate: false,
  tabWidth: 160,
  headerHeight: 36,
  suffixEnd: 32,
  clipLeft: 4,
  clipWidth: 140,
  scrollLeft: 0
};

describe(WorkspacePanel.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: WorkspacePanel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace-panel>
        <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
        <input value="Application content">
        <nve-workspace-panel-footer>Status</nve-workspace-panel-footer>
      </nve-workspace-panel>
    `);
    element = fixture.querySelector<WorkspacePanel>('nve-workspace-panel')!;
    await elementIsStable(element);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(WorkspacePanel.metadata.tag)).toBeDefined();
  });

  it('should reflect application minimum dimensions', async () => {
    element.minWidth = 180;
    element.minHeight = 100;
    await elementIsStable(element);

    expect(element.getAttribute('min-width')).toBe('180');
    expect(element.getAttribute('min-height')).toBe('100');
  });

  it('should show selected content and its frame without recreating application content', async () => {
    const input = element.querySelector('input')!;
    const content = element.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const frame = element.shadowRoot!.querySelector<HTMLElement>('.frame')!;

    expect(content.hidden).toBe(true);
    expect(frame.hidden).toBe(true);

    element._configure(configuration);
    await elementIsStable(element);

    expect(content.hidden).toBe(false);
    expect(frame.hidden).toBe(false);
    expect(content.style.top).toBe('36px');

    element._configure({ ...configuration, selected: false });
    await elementIsStable(element);

    expect(content.hidden).toBe(true);
    expect(frame.hidden).toBe(true);
    expect(element.querySelector('input')).toBe(input);
  });

  it('should forward configuration to its header and tolerate its absence', () => {
    const header = element.querySelector('nve-workspace-panel-header')!;
    const configure = vi.spyOn(header, '_configure');

    element._configure(configuration);
    expect(configure).toHaveBeenCalledExactlyOnceWith(configuration);

    header.remove();

    expect(() => element._configure(configuration)).not.toThrow();
  });

  it('should toggle the presentation state', () => {
    element._present(true);
    expect(element._internals.states.has('workspace-presented')).toBe(true);

    element._present(false);
    expect(element._internals.states.has('workspace-presented')).toBe(false);
  });
});
