// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceCompositionController } from './workspace-composition.controller.js';

import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspacePresentedGroup } from '../utils/presentation/groups.utils.js';

import '../define.js';

describe('workspace composition controller', () => {
  let controller: WorkspaceCompositionController;

  afterEach(() => {
    controller?.stopObserving();
  });

  function setup(getLayout: () => WorkspaceLayout | undefined = () => undefined) {
    // Observation and ownership relationships do not require a connected or rendered workspace.
    const host = Object.assign(document.createElement('div'), {
      addController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true)
    });
    host.innerHTML = `<nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header><p>Content</p></nve-workspace-panel>`;
    const contentChanged = vi.fn();
    controller = new WorkspaceCompositionController(host, {
      getPanels: () => [],
      getGroups: () => [],
      getLayout,
      getPreview: () => undefined,
      scrollChanged: vi.fn(),
      contentChanged
    });
    return { host, panel: host.querySelector('nve-workspace-panel')!, contentChanged };
  }

  it('refreshes committed strip ownership on root replacement and disconnect', () => {
    let layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'a' },
      closed: []
    };
    const { panel } = setup(() => layout);
    const group: WorkspacePresentedGroup = {
      key: 'root',
      panels: [panel],
      active: 'a',
      rect: { x: 0, y: 0, width: 100, height: 100 },
      gripWidth: 0,
      tabbed: true
    };
    const original = controller.getGroupIdentity(group);
    layout = { ...layout, root: { type: 'group', panels: ['b', 'a'], active: 'b' } };
    expect(controller.getGroupIdentity(group)).toBe(original);
    layout = { ...layout, root: { type: 'group', panels: ['a', 'c'], active: 'a' } };
    const changed = controller.getGroupIdentity(group);
    expect(changed).not.toBe(original);
    controller.hostDisconnected();
    if (layout.root?.type !== 'group') throw new Error('Expected a group');
    layout.root.panels.push('d');
    expect(controller.getGroupIdentity(group)).not.toBe(changed);
  });

  it.each(['id', 'min-width', 'min-height', 'slot'])(
    'reports directly owned panel %s changes as panel inputs',
    async attribute => {
      const { panel, contentChanged } = setup();
      controller.startObserving();
      panel.setAttribute(attribute, 'changed');
      await Promise.resolve();
      expect(contentChanged.mock.calls).toEqual([['panels']]);
    }
  );

  it.each(['id', 'min-width', 'min-height', 'slot'])('reports host %s changes as chrome inputs', async attribute => {
    const { host, contentChanged } = setup();
    controller.startObserving();
    host.setAttribute(attribute, 'changed');
    await Promise.resolve();
    expect(contentChanged.mock.calls).toEqual([['chrome']]);
  });

  it('reports supplied panel additions and removals', async () => {
    const { host, panel, contentChanged } = setup();
    controller.startObserving();
    panel.remove();
    await Promise.resolve();
    host.append(panel);
    await Promise.resolve();
    expect(contentChanged.mock.calls).toEqual([['panels'], ['panels']]);
  });

  it('reports header text and authored accessory changes as chrome', async () => {
    const { panel, contentChanged } = setup();
    controller.startObserving();
    panel.querySelector('nve-workspace-panel-header')!.firstChild!.textContent = 'Notes';
    await Promise.resolve();
    panel.querySelector('p')!.slot = 'suffix';
    await Promise.resolve();
    expect(contentChanged.mock.calls).toEqual([['chrome'], ['chrome']]);
  });

  it('reports one panel-input change for a batch containing panel and chrome changes', async () => {
    const { panel, contentChanged } = setup();
    controller.startObserving();
    panel.setAttribute('min-width', '300');
    panel.querySelector('nve-workspace-panel-header')!.textContent = 'Notes';
    await Promise.resolve();
    expect(contentChanged.mock.calls).toEqual([['panels']]);
  });

  it('ignores application content, nested workspace headers and unobserved attributes', async () => {
    const { panel, contentChanged } = setup();
    const nested = document.createElement('nve-workspace');
    nested.innerHTML = `<nve-workspace-panel id="nested"><nve-workspace-panel-header>Nested</nve-workspace-panel-header></nve-workspace-panel>`;
    panel.querySelector('p')!.append(nested);
    controller.startObserving();
    panel.querySelector('p')!.append(' body edit');
    nested.querySelector('nve-workspace-panel-header')!.textContent = 'Nested edit';
    panel.setAttribute('aria-label', 'Application label');
    await Promise.resolve();
    expect(contentChanged).not.toHaveBeenCalled();
  });

  it('discards pending changes on stop and starts a fresh observation period', async () => {
    const { panel, contentChanged } = setup();
    panel.id = 'before-start';
    controller.startObserving();
    panel.id = 'pending';
    controller.stopObserving();
    panel.id = 'after-stop';
    await Promise.resolve();
    expect(contentChanged).not.toHaveBeenCalled();
    controller.startObserving();
    panel.id = 'after-restart';
    await Promise.resolve();
    expect(contentChanged.mock.calls).toEqual([['panels']]);
  });
});
