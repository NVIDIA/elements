// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { ResizeHandle } from '../resize-handle/resize-handle.js';
import type { Workspace } from './workspace.js';
import type { WorkspacePlacement } from './utils/workspace-command.utils.js';
import type { WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './utils/workspace-layout.utils.js';
import { decidePlacement } from './utils/workspace-placement-decision.utils.js';
import { sizePreferredSplit } from './utils/workspace-split-sizing.utils.js';
import './define.js';

vi.mock('./utils/workspace-placement-decision.utils.js', { spy: true });
vi.mock('./utils/workspace-split-sizing.utils.js', { spy: true });

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: WorkspaceSplit['axis'], weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});

function arrangement(axis: WorkspaceSplit['axis']): WorkspaceLayout {
  return {
    version: 1,
    closed: [],
    root: split(
      axis,
      [1, 4],
      group('outline'),
      split(
        axis === 'horizontal' ? 'vertical' : 'horizontal',
        [3, 2],
        split(axis, [3, 2], group('editor'), group('preview')),
        group('notes')
      )
    )
  };
}

describe('workspace reparented group sizing', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(axis: WorkspaceSplit['axis'] = 'horizontal') {
    fixture = await createFixture(html`
      <nve-workspace groupable rearrangeable resizable .value=${JSON.stringify(arrangement(axis))}
        style="width:1000px;height:800px;--animation-duration:0ms">
        ${['outline', 'editor', 'preview', 'notes'].map(
          id => html`
          <nve-workspace-panel id=${id}>
            <nve-workspace-panel-header>${id}</nve-workspace-panel-header>
            <input aria-label=${id} .value=${id} />
          </nve-workspace-panel>`
        )}
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    await vi.waitFor(() =>
      expect(panelRect(workspace)[axis === 'horizontal' ? 'width' : 'height']).toBeCloseTo(
        axis === 'horizontal' ? 198.8 : 158.8,
        1
      )
    );
    return workspace;
  }

  function panelRect(workspace: Workspace, id = 'outline') {
    return workspace.querySelector('#' + id)!.getBoundingClientRect();
  }

  async function place(workspace: Workspace, placement: WorkspacePlacement, id = 'outline') {
    const source = document.createElement('button');
    Object.assign(source, { placement });
    workspace.querySelector('#' + id)!.dispatchEvent(new CommandEvent('command', { command: '--place', source }));
    await elementIsStable(workspace);
  }

  async function inward(workspace: Workspace, axis: WorkspaceSplit['axis'] = 'horizontal') {
    await place(workspace, {
      operation: 'insert',
      scope: 'arrangement',
      target: 'editor',
      position: axis === 'horizontal' ? 'right' : 'bottom'
    });
  }

  async function reserveOuter(workspace: Workspace) {
    const control = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="outline"]')!;
    const title = control.getBoundingClientRect();
    control.dispatchEvent(pointer('pointerdown', title.x + title.width / 2, title.y + title.height / 2));
    const bounds = workspace.getBoundingClientRect();
    const destination = { x: bounds.x + 1, y: bounds.y + bounds.height / 2 };
    workspace.dispatchEvent(pointer('pointermove', destination.x, destination.y));
    await vi.waitFor(() => {
      const ghost = workspace.shadowRoot!.querySelector<HTMLElement>(
        '[data-destination-ghost][data-reserved-placement]'
      );
      expect(ghost).not.toBeNull();
      expect(ghost!.getAttribute('data-drag-phase')).toBe('detached');
      expect(ghost!.getBoundingClientRect().width).toBeGreaterThan(0);
    });
    return destination;
  }

  it.each(['horizontal', 'vertical'] as const)(
    'uses destination shares through repeated %s command round trips',
    async axis => {
      const workspace = await setup(axis);
      const size = axis === 'horizontal' ? 'width' : 'height';
      const input = workspace.querySelector<HTMLInputElement>('#outline input')!;
      input.value = 'edited application content';
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      let innerSize: number | undefined;
      let outerSize: number | undefined;
      for (let index = 0; index < 3; index++) {
        await inward(workspace, axis);
        const incoming = panelRect(workspace)[size];
        const editor = panelRect(workspace, 'editor')[size];
        const preview = panelRect(workspace, 'preview')[size];
        expect(incoming).toBeCloseTo((editor + preview) / 2, 1);
        expect(editor / preview).toBeCloseTo(3 / 2, 3);
        if (innerSize !== undefined) expect(incoming).toBeCloseTo(innerSize, 1);
        innerSize = incoming;
        await place(workspace, {
          operation: 'insert',
          scope: 'workspace',
          position: axis === 'horizontal' ? 'left' : 'top'
        });
        const outer = panelRect(workspace)[size];
        const extent = axis === 'horizontal' ? workspace.clientWidth : workspace.clientHeight;
        expect(outer).toBeCloseTo((extent - 6) / 2, 1);
        if (outerSize !== undefined) expect(outer).toBeCloseTo(outerSize, 1);
        outerSize = outer;
      }
      expect(workspace.querySelector('#outline input')).toBe(input);
      expect(input.value).toBe('edited application content');
      expect(changed).toHaveBeenCalledTimes(6);
    }
  );

  it.each(['horizontal', 'vertical'] as const)(
    'halves the recipient when moving Editor across its %s sibling axis',
    async axis => {
      const workspace = await setup(axis);
      const crossSize = axis === 'horizontal' ? 'height' : 'width';
      const original = panelRect(workspace, 'preview')[crossSize];
      await place(
        workspace,
        {
          operation: 'split',
          target: 'preview',
          position: axis === 'horizontal' ? 'bottom' : 'right'
        },
        'editor'
      );
      const editor = panelRect(workspace, 'editor')[crossSize];
      const preview = panelRect(workspace, 'preview')[crossSize];
      expect(editor).toBeCloseTo((original - 6) / 2, 1);
      expect(preview).toBeCloseTo(editor, 1);
    }
  );

  it('does not carry an explicit divider size into a different parent', async () => {
    const workspace = await setup();
    const before = panelRect(workspace).width;
    const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('[data-boundary="root:0"]')!;
    handle.valueAsNumber += 60;
    handle.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elementIsStable(workspace);
    handle.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await elementIsStable(workspace);
    expect(panelRect(workspace).width).toBeCloseTo(before + 60, 1);
    await inward(workspace);
    const editor = panelRect(workspace, 'editor').width;
    const preview = panelRect(workspace, 'preview').width;
    expect(panelRect(workspace).width).toBeCloseTo((editor + preview) / 2, 1);
  });

  describe('placement stages', () => {
    it('fits the selected split without refitting hints and commits balanced recipient sizes', async () => {
      const workspace = await setup();
      vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
      const control = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="outline"]')!;
      const title = control.getBoundingClientRect();
      const target = panelRect(workspace, 'preview');
      const point = { x: target.x + target.width / 2, y: target.bottom - 30 };
      vi.mocked(sizePreferredSplit).mockClear();
      control.dispatchEvent(pointer('pointerdown', title.x + title.width / 2, title.y + title.height / 2));
      workspace.dispatchEvent(pointer('pointermove', point.x, point.y));
      await vi.waitFor(() => {
        expect(sizePreferredSplit).toHaveBeenCalled();
        expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).not.toBeNull();
      });
      const shown = workspace.shadowRoot!.querySelector('[data-destination-ghost]')!.getBoundingClientRect();
      // A split overlay depicts the recipient half; committed panels also leave room for the separator.
      expect(shown.height).toBeCloseTo(target.height / 2, 1);
      vi.mocked(sizePreferredSplit).mockClear();
      workspace.requestUpdate();
      await workspace.updateComplete;
      expect(sizePreferredSplit).not.toHaveBeenCalled();
      workspace.dispatchEvent(pointer('pointerup', point.x, point.y));
      await elementIsStable(workspace);
      expect(panelRect(workspace).height).toBeCloseTo((target.height - 6) / 2, 1);
      expect(panelRect(workspace, 'preview').height).toBeCloseTo(panelRect(workspace).height, 1);
    });

    it('discovers preview hints without fitting speculative candidates', async () => {
      const workspace = await setup();
      await inward(workspace);
      vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
      const destination = await reserveOuter(workspace);
      const saved = workspace.value;
      vi.mocked(decidePlacement).mockClear();
      vi.mocked(sizePreferredSplit).mockClear();

      workspace.requestUpdate();
      await workspace.updateComplete;

      expect(decidePlacement).toHaveBeenCalled();
      expect(sizePreferredSplit).not.toHaveBeenCalled();
      expect(workspace.value).toBe(saved);
      workspace.dispatchEvent(pointer('pointercancel', destination.x, destination.y));
      await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
    });

    it('commits destination-based insertion preview geometry and cancels silently', async () => {
      const workspace = await setup();
      await inward(workspace);
      const saved = workspace.value;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});

      const canceled = await reserveOuter(workspace);
      workspace.dispatchEvent(pointer('pointercancel', canceled.x, canceled.y));
      await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();

      vi.mocked(sizePreferredSplit).mockClear();
      const committed = await reserveOuter(workspace);
      expect(sizePreferredSplit).not.toHaveBeenCalled();
      const shown = workspace.shadowRoot!.querySelector('[data-destination-ghost]')!.getBoundingClientRect();
      workspace.dispatchEvent(pointer('pointerup', committed.x, committed.y));
      await elementIsStable(workspace);
      for (const dimension of ['x', 'y', 'width', 'height'] as const)
        expect(panelRect(workspace)[dimension]).toBeCloseTo(shown[dimension], 1);
      expect(changed).toHaveBeenCalledOnce();
    });
  });
});

function pointer(type: string, clientX: number, clientY: number) {
  return new PointerEvent(type, {
    clientX,
    clientY,
    pointerId: 5,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
    bubbles: true,
    composed: true,
    cancelable: true
  });
}
