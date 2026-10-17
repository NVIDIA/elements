// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { WorkspacePanelFooter } from '@nvidia-elements/core/workspace';
import '@nvidia-elements/core/workspace/define.js';

describe(WorkspacePanelFooter.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: WorkspacePanelFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-workspace-panel>
        <nve-workspace-panel-footer>
          <span>Application content</span>
        </nve-workspace-panel-footer>
      </nve-workspace-panel>
    `);
    element = fixture.querySelector<WorkspacePanelFooter>('nve-workspace-panel-footer')!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(WorkspacePanelFooter.metadata.tag)).toBeDefined();
  });

  it('should project supplied content through its default slot', () => {
    const slot = element.shadowRoot!.querySelector('slot')!;
    expect(slot.assignedElements()).toEqual([element.querySelector('span')]);
  });

  it('should assign itself to the footer slot', () => {
    expect(element.slot).toBe('footer');
  });
});
