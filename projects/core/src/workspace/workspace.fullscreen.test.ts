// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';

import type { WorkspacePanel } from './panel/panel.js';
import type { Workspace } from './workspace.js';

import './define.js';

const initial = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 2],
    children: [
      { type: 'group', panels: ['a', 'companion'], active: 'a' },
      { type: 'group', panels: ['b'], active: 'b' }
    ]
  }
});

describe('workspace group fullscreen', () => {
  let fixture: HTMLElement;

  let native: Element | null;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function createFullscreenWorkspace(fullscreenable = true) {
    fixture = await createFixture(
      html`<nve-workspace ?fullscreenable=${fullscreenable} groupable rearrangeable resizable closable style="width:700px;height:300px" .value=${initial}>${['a', 'companion', 'b'].map(id => html`<nve-workspace-panel id=${id}><nve-workspace-panel-header>${id}</nve-workspace-panel-header><input .value=${id}></nve-workspace-panel>`)}</nve-workspace>`
    );
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    native = null;
    const matches = workspace.matches;

    vi.spyOn(workspace, 'matches').mockImplementation(selector =>
      selector === ':fullscreen' ? native === workspace : matches.call(workspace, selector)
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => native);
    const request = vi.spyOn(workspace, 'requestFullscreen').mockImplementation(async () => {
      native = workspace;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const exit = vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const saved = workspace.value;
    const changed = vi.fn();
    workspace.addEventListener('change', changed);
    return { workspace, request, exit, changed, saved };
  }

  async function invoke(workspace: Workspace, command: string, id = 'a') {
    workspace.querySelector(`#${id}`)!.dispatchEvent(new CommandEvent('command', { command }));
    await elementIsStable(workspace);
  }

  for (const fullscreenable of [false, true]) {
    it(`preserves application-owned native fullscreen with capability ${fullscreenable}`, async () => {
      const { workspace, request, exit, saved, changed } = await createFullscreenWorkspace(fullscreenable);
      await workspace.requestFullscreen();
      await elementIsStable(workspace);
      expect(request).toHaveBeenCalledOnce();
      expect(native).toBe(workspace);
      expect(exit).not.toHaveBeenCalled();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
      expect(workspace.shadowRoot!.querySelector('[part~="fullscreen-button"]')?.getAttribute('aria-label')).not.toBe(
        'exit full screen'
      );
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await elementIsStable(workspace);
    });
  }

  describe('capability and availability', () => {
    it('requires the reflected capability for new entry and leaves availability queries pure', async () => {
      const { workspace, request, exit, saved, changed } = await createFullscreenWorkspace(false);
      const availability = vi.fn();
      workspace.addEventListener('commandavailabilitychange', availability);
      expect(workspace.fullscreenable).toBe(false);
      expect(workspace.hasAttribute('fullscreenable')).toBe(false);
      for (const command of ['--enter-fullscreen', '--toggle-fullscreen', '--exit-fullscreen']) {
        expect(workspace.isCommandAvailable(command, { value: 'a' })).toBe(false);
        await invoke(workspace, command);
      }
      expect(workspace.shadowRoot!.querySelector('.group-chrome [part~="fullscreen-button"]')).toBeNull();
      expect(request).not.toHaveBeenCalled();
      expect(exit).not.toHaveBeenCalled();
      expect(availability).not.toHaveBeenCalled();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });

    it('ignores unknown commands while fullscreen is available or active', async () => {
      const { workspace, request, exit, saved, changed } = await createFullscreenWorkspace();
      for (const active of [false, true]) {
        if (active) {
          await invoke(workspace, '--enter-fullscreen');
        }
        expect(workspace.isCommandAvailable('--unknown', { value: 'a' })).toBe(false);
        await invoke(workspace, '--unknown');
        expect(request).toHaveBeenCalledTimes(active ? 1 : 0);
        expect(exit).not.toHaveBeenCalled();
        expect(workspace.value).toBe(saved);
        expect(changed).not.toHaveBeenCalled();
      }
    });

    it('queries fullscreen availability only when a group control is shown', async () => {
      const { workspace } = await createFullscreenWorkspace(false);
      const available = vi.spyOn(workspace, 'isCommandAvailable');
      workspace.requestUpdate();
      await elementIsStable(workspace);
      expect(available).not.toHaveBeenCalled();

      workspace.fullscreenable = true;
      await elementIsStable(workspace);
      expect(available).toHaveBeenCalledWith('--toggle-fullscreen', { value: 'a' });
      expect(available).toHaveBeenCalledWith('--toggle-fullscreen', { value: 'b' });
      expect(workspace.shadowRoot!.querySelectorAll('.group-chrome [part~="fullscreen-button"]')).toHaveLength(2);
    });

    it('reports fullscreen availability without requesting browser admission', async () => {
      const { workspace, request, changed } = await createFullscreenWorkspace();
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
      expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'a' })).toBe(true);
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(false);
      vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(false);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'a' })).toBe(false);
      expect(request).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('group controls', () => {
    it('keeps one command control across tab switches and supports singleton groups', async () => {
      const { workspace, request, exit } = await createFullscreenWorkspace();
      const buttons = [
        ...workspace.shadowRoot!.querySelectorAll<HTMLElement>('.group-chrome [part~="fullscreen-button"]')
      ];
      expect(buttons).toHaveLength(2);
      const button = buttons[0]!;
      expect(button.getAttribute('aria-label')).toBe('enter full screen');
      expect(button.closest('.tablist')).toBeNull();
      expect(button.tabIndex).toBe(0);
      expect(button.hasAttribute('aria-pressed')).toBe(false);
      await invoke(workspace, '--select', 'companion');
      expect(workspace.shadowRoot!.querySelector('.group-chrome [part~="fullscreen-button"]')).toBe(button);
      expect(button).toHaveProperty('commandForElement', workspace.querySelector('#companion'));
      await emulateClick(button);
      await elementIsStable(workspace);
      expect(request).toHaveBeenCalledOnce();
      expect(button.getAttribute('aria-label')).toBe('exit full screen');
      expect(button.getAttribute('icon-name')).toBe('minimize');
      workspace.fullscreenable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('.group-chrome [part~="fullscreen-button"]')).toBe(button);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(false);
      expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'b' })).toBe(false);
      await emulateClick(button);
      await elementIsStable(workspace);
      expect(exit).toHaveBeenCalledOnce();
      expect(workspace.shadowRoot!.querySelector('.group-chrome [part~="fullscreen-button"]')).toBeNull();
    });

    it('reserves measured group controls beside authored suffixes when tabs overflow', async () => {
      const { workspace } = await createFullscreenWorkspace();
      const header = workspace.querySelector<HTMLElement>('#a nve-workspace-panel-header')!;
      const suffix = document.createElement('span');
      suffix.slot = 'suffix';
      suffix.style.cssText = 'display:block;width:50px';
      suffix.textContent = 'Actions';
      header.append(suffix);
      workspace.style.width = '220px';
      await elementIsStable(workspace);
      const group = workspace.shadowRoot!.querySelector<HTMLElement>('.group-chrome')!;
      const strip = group.querySelector<HTMLElement>('.tablist')!;
      const action = group.querySelector<HTMLElement>('.group-actions')!;
      await vi.waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
      await vi.waitFor(() =>
        expect(strip.getBoundingClientRect().right).toBeCloseTo(
          header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().left
        )
      );
      const suffixRect = header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      expect(suffixRect.right).toBeCloseTo(actionRect.left);
      expect(strip.getBoundingClientRect().right).toBeCloseTo(suffixRect.left);
      expect(header.shadowRoot!.querySelector('.label-viewport')!.getBoundingClientRect().right).toBeCloseTo(
        suffixRect.left
      );
      expect(actionRect.right).toBeCloseTo(group.getBoundingClientRect().right);
      expect(actionRect.width).toBeGreaterThan(0);
      expect(getComputedStyle(action).borderInlineStartColor).toBe('rgba(0, 0, 0, 0)');
      const singleton = workspace.shadowRoot!.querySelectorAll<HTMLElement>('.group-chrome')[1]!;
      const singletonAction = singleton.querySelector<HTMLElement>('.group-actions')!;
      expect(getComputedStyle(singletonAction).borderInlineStartStyle).toBe('solid');
      expect(getComputedStyle(singletonAction).borderInlineStartColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(singletonAction.getBoundingClientRect().width).toBeCloseTo(actionRect.width);
      expect(singleton.querySelector('.tablist')!.getBoundingClientRect().right).toBeCloseTo(
        singletonAction.getBoundingClientRect().left
      );
      await invoke(workspace, '--select', 'companion');
      expect(getComputedStyle(action).borderInlineStartColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(action.getBoundingClientRect().width).toBeCloseTo(actionRect.width);
      expect(strip.getBoundingClientRect().right).toBeCloseTo(action.getBoundingClientRect().left);
      await invoke(workspace, '--select', 'a');
      expect(getComputedStyle(action).borderInlineStartColor).toBe('rgba(0, 0, 0, 0)');
      const style = document.createElement('style');
      style.textContent = 'nve-workspace::part(fullscreen-button) { --width:48px; }';
      fixture.append(style);
      await vi.waitFor(() => expect(action.getBoundingClientRect().width).toBeGreaterThan(actionRect.width));
      await elementIsStable(workspace);
      expect(header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().right).toBeCloseTo(
        action.getBoundingClientRect().left
      );
      expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);
      const suffixContent = header.shadowRoot!.querySelector('.suffix-content')!;
      workspace.style.setProperty('--header-control-inset', '6px');
      await vi.waitFor(() => expect(getComputedStyle(suffixContent).paddingLeft).toBe('6px'));
      expect(getComputedStyle(suffixContent).paddingRight).toBe('0px');
      header.style.setProperty('--suffix-padding', '12px');
      await vi.waitFor(() => expect(getComputedStyle(suffixContent).paddingRight).toBe('12px'));
      await vi.waitFor(() =>
        expect(strip.getBoundingClientRect().right).toBeCloseTo(
          header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().left
        )
      );
    });

    it('reallocates tab space when shared header control sizing changes', async () => {
      const { workspace } = await createFullscreenWorkspace();
      const group = workspace.shadowRoot!.querySelector<HTMLElement>('.group-chrome')!;
      const strip = group.querySelector<HTMLElement>('.tablist')!;
      const grip = group.querySelector<HTMLElement>('nve-drag-handle')!;
      const action = group.querySelector<HTMLElement>('.group-actions')!;
      const initialWidth = strip.getBoundingClientRect().width;
      workspace.style.setProperty('--header-control-size', '24px');
      workspace.style.setProperty('--header-control-inset', '6px');
      await elementIsStable(workspace);

      await vi.waitFor(() => {
        expect(strip.getBoundingClientRect().width).toBeCloseTo(initialWidth);
        expect(strip.getBoundingClientRect().left).toBeCloseTo(grip.getBoundingClientRect().right);
        expect(strip.getBoundingClientRect().right).toBeCloseTo(action.getBoundingClientRect().left);
        for (const button of group.querySelectorAll('[part~="close-button"], [part~="fullscreen-button"]')) {
          expect(button.getBoundingClientRect().width).toBeCloseTo(24);
          expect(button.getBoundingClientRect().height).toBeCloseTo(24);
        }
      });
      workspace.style.setProperty('--header-control-inset', '4px');
      await vi.waitFor(() => expect(strip.getBoundingClientRect().width).toBeCloseTo(initialWidth + 8));
      expect(strip.getBoundingClientRect().left).toBeCloseTo(grip.getBoundingClientRect().right);
      expect(strip.getBoundingClientRect().right).toBeCloseTo(action.getBoundingClientRect().left);
    });

    it('reserves customized divider widths across groups and container styles', async () => {
      const { workspace } = await createFullscreenWorkspace();
      const header = workspace.querySelector<HTMLElement>('#a nve-workspace-panel-header')!;
      const suffix = document.createElement('span');
      suffix.slot = 'suffix';
      suffix.textContent = 'Actions';
      header.append(suffix);
      await elementIsStable(workspace);
      const groups = workspace.shadowRoot!.querySelectorAll<HTMLElement>('.group-chrome');
      const action = groups[0]!.querySelector<HTMLElement>('.group-actions')!;
      const singleton = groups[1]!;
      const singletonAction = singleton.querySelector<HTMLElement>('.group-actions')!;
      await vi.waitFor(() => expect(action.hasAttribute('data-authored-suffix')).toBe(true));
      const customizedWidth = action.getBoundingClientRect().width;
      workspace.style.setProperty('--tab-border', '5px solid red');
      header.style.setProperty('--suffix-border', '3px dashed blue');
      await vi.waitFor(() => expect(action.getBoundingClientRect().width).toBeCloseTo(customizedWidth + 4));
      await elementIsStable(workspace);
      expect(getComputedStyle(action).borderInlineStartWidth).toBe('5px');
      expect(getComputedStyle(action).borderInlineStartColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(singletonAction).borderInlineStartWidth).toBe('5px');
      expect(singletonAction.getBoundingClientRect().width).toBeCloseTo(action.getBoundingClientRect().width);
      expect(header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().right).toBeCloseTo(
        action.getBoundingClientRect().left
      );
      const suffixContent = header.shadowRoot!.querySelector('.suffix-content')!;
      expect(getComputedStyle(suffixContent).borderInlineStartWidth).toBe('3px');
      expect(getComputedStyle(suffixContent).borderInlineStartStyle).toBe('dashed');
      for (const container of ['flat', 'full']) {
        workspace.setAttribute('container', container);
        workspace.style.setProperty('--gap', '0');
        await elementIsStable(workspace);
        expect(header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().right).toBeCloseTo(
          action.getBoundingClientRect().left
        );
        await vi.waitFor(() =>
          expect(singletonAction.getBoundingClientRect().right).toBeCloseTo(singleton.getBoundingClientRect().right)
        );
        expect(singletonAction.getBoundingClientRect().width).toBeCloseTo(action.getBoundingClientRect().width);
      }
      workspace.style.setProperty('--tab-border', 'none');
      await vi.waitFor(() => expect(action.getBoundingClientRect().width).toBeCloseTo(customizedWidth - 1));
      await elementIsStable(workspace);
      expect(getComputedStyle(singletonAction).borderInlineStartStyle).toBe('none');
      expect(header.shadowRoot!.querySelector('.suffix')!.getBoundingClientRect().right).toBeCloseTo(
        action.getBoundingClientRect().left
      );
    });
  });

  describe('browser admission and group switching', () => {
    it('projects the admitted group without altering its arrangement and restores the current layout on browser exit', async () => {
      const { workspace, request, changed, saved } = await createFullscreenWorkspace();
      const input = workspace.querySelector('#a input');
      await invoke(workspace, '--enter-fullscreen');
      expect(request).toHaveBeenCalledOnce();
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(true);
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
      expect(
        workspace.isCommandAvailable('--place', {
          value: 'a',
          placement: { operation: 'split', target: 'b', position: 'left' }
        })
      ).toBe(false);
      expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(2);
      expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(3);
      expect(workspace.querySelector('#a input')).toBe(input);
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });

    it('switches pending groups without another request and keeps cancellation after disabling entry', async () => {
      const { workspace, request, exit } = await createFullscreenWorkspace();
      const admission = Promise.withResolvers<undefined>();
      request.mockReturnValueOnce(admission.promise);
      await invoke(workspace, '--enter-fullscreen');
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'companion' })).toBe(false);
      expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'companion' })).toBe(true);
      vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(false);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(true);
      await invoke(workspace, '--toggle-fullscreen', 'b');
      expect(request).toHaveBeenCalledOnce();
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(false);
      workspace.fullscreenable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelectorAll('.group-chrome [part~="fullscreen-button"]')).toHaveLength(1);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
      await invoke(workspace, '--toggle-fullscreen', 'b');
      native = workspace;
      admission.resolve(undefined);
      await elementIsStable(workspace);
      expect(exit).toHaveBeenCalledOnce();
    });

    it('admits an accepted pending entry after disabling entry and removing its target', async () => {
      const { workspace, request, exit } = await createFullscreenWorkspace();
      const admission = Promise.withResolvers<undefined>();
      request.mockReturnValueOnce(admission.promise);
      await invoke(workspace, '--enter-fullscreen');
      workspace.fullscreenable = false;
      workspace.querySelector('#a')!.remove();
      await elementIsStable(workspace);
      native = workspace;
      admission.resolve(undefined);
      await elementIsStable(workspace);
      expect(exit).not.toHaveBeenCalled();
      expect(workspace.shadowRoot!.querySelector('[data-panel="companion"]')).not.toBeNull();
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')).toBeNull();
      workspace.querySelector('#companion')!.remove();
      await elementIsStable(workspace);
      expect(exit).toHaveBeenCalledOnce();
    });

    it('projects browser admission before its request promise settles', async () => {
      const { workspace, request } = await createFullscreenWorkspace();
      const admission = Promise.withResolvers<undefined>();
      request.mockReturnValueOnce(admission.promise);
      await invoke(workspace, '--enter-fullscreen');
      native = workspace;
      document.dispatchEvent(new Event('fullscreenchange'));
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')).toBeNull();
      admission.resolve(undefined);
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')).toBeNull();
    });

    it('leaves the normal arrangement visible after failed admission', async () => {
      const { workspace, request, changed, saved } = await createFullscreenWorkspace();
      request.mockRejectedValueOnce(new Error('Denied'));
      await invoke(workspace, '--toggle-fullscreen');
      expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(3);
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });

    it('exits an admission that arrives after a pending request was cancelled', async () => {
      const { workspace, request, exit, changed, saved } = await createFullscreenWorkspace();
      let admit: (() => void) | undefined;
      request.mockImplementationOnce(
        () =>
          new Promise<void>(resolve => {
            admit = () => {
              native = workspace;
              document.dispatchEvent(new Event('fullscreenchange'));
              resolve();
            };
          })
      );
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
      await invoke(workspace, '--enter-fullscreen');
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
      await invoke(workspace, '--exit-fullscreen');
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(false);
      admit?.();
      await elementIsStable(workspace);
      expect(exit).toHaveBeenCalledOnce();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });

    it('ignores rejection of an older request while a newer admission is pending', async () => {
      const { workspace, request, changed, saved } = await createFullscreenWorkspace();
      const older = Promise.withResolvers<undefined>();
      const newer = Promise.withResolvers<undefined>();
      request.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
      await invoke(workspace, '--enter-fullscreen');
      await invoke(workspace, '--exit-fullscreen');
      await invoke(workspace, '--enter-fullscreen', 'b');

      older.reject(new Error('Denied'));
      document.dispatchEvent(new Event('fullscreenerror'));
      await elementIsStable(workspace);
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'b' })).toBe(true);

      native = workspace;
      newer.resolve(undefined);
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')).not.toBeNull();
      expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });

    it('keeps a newer fullscreen group when an older cancelled request succeeds', async () => {
      const { workspace, request, exit, changed, saved } = await createFullscreenWorkspace();
      const older = Promise.withResolvers<undefined>();
      request.mockReturnValueOnce(older.promise);
      await invoke(workspace, '--enter-fullscreen');
      await invoke(workspace, '--exit-fullscreen');
      await invoke(workspace, '--enter-fullscreen', 'b');

      older.resolve(undefined);
      await elementIsStable(workspace);
      expect(exit).not.toHaveBeenCalled();
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')).not.toBeNull();
      expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull();
      expect(workspace.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('availability notifications', () => {
    it('announces pending fullscreen admission and rejection independently of the arrangement', async () => {
      const { workspace, request, changed } = await createFullscreenWorkspace();
      let reject: (() => void) | undefined;
      request.mockImplementationOnce(
        () =>
          new Promise<void>((_, fail) => {
            reject = () => fail(new Error('Denied'));
          })
      );
      const availability = vi.fn();
      workspace.addEventListener('commandavailabilitychange', availability);
      await invoke(workspace, '--enter-fullscreen');
      expect(availability).toHaveBeenCalled();
      expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
      availability.mockClear();
      reject?.();
      await elementIsStable(workspace);
      expect(availability).toHaveBeenCalled();
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
      expect(changed).not.toHaveBeenCalled();
    });

    it('announces logical group switches without another native fullscreen request', async () => {
      const { workspace, request, changed } = await createFullscreenWorkspace();
      await invoke(workspace, '--enter-fullscreen');
      const availability = vi.fn();
      workspace.addEventListener('commandavailabilitychange', availability);
      await invoke(workspace, '--enter-fullscreen', 'b');
      expect(availability).toHaveBeenCalled();
      expect(request).toHaveBeenCalledOnce();
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(false);
      expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
      expect(changed).not.toHaveBeenCalled();
      availability.mockClear();
      await invoke(workspace, '--exit-fullscreen', 'b');
      expect(availability).toHaveBeenCalled();
    });
  });

  describe('focus and supplied panel reconciliation', () => {
    it('preserves focus in panel content when the browser exits fullscreen', async () => {
      const { workspace } = await createFullscreenWorkspace();
      await invoke(workspace, '--enter-fullscreen');
      const input = workspace.querySelector<HTMLInputElement>('#a input')!;
      input.focus();
      expect(document.activeElement).toBe(input);

      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await elementIsStable(workspace);

      expect(document.activeElement).toBe(input);
    });

    it('preserves focus inside shadow content when the browser exits fullscreen', async () => {
      const { workspace } = await createFullscreenWorkspace();
      const content = document.createElement('div');
      const shadow = content.attachShadow({ mode: 'open' });
      const input = document.createElement('input');
      shadow.append(input);
      workspace.querySelector('#a')!.append(content);
      await elementIsStable(workspace);
      await invoke(workspace, '--enter-fullscreen');
      input.focus();
      expect(shadow.activeElement).toBe(input);

      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await elementIsStable(workspace);

      expect(document.activeElement).toBe(content);
      expect(shadow.activeElement).toBe(input);
    });

    it('keeps surviving companions when the target panel is removed', async () => {
      const { workspace, exit } = await createFullscreenWorkspace();
      await invoke(workspace, '--enter-fullscreen');
      const presentOtherGroup = vi.spyOn(workspace.querySelector<WorkspacePanel>('#b')!, '_present');
      workspace.querySelector('#a')!.remove();
      await elementIsStable(workspace);
      expect(exit).not.toHaveBeenCalled();
      expect(presentOtherGroup).not.toHaveBeenCalledWith(true);
      expect(workspace.shadowRoot!.querySelector('[data-panel="companion"]')).not.toBeNull();
    });

    it('keeps a surviving companion fullscreen then exits when its last panel closes', async () => {
      const { workspace, exit } = await createFullscreenWorkspace();
      await invoke(workspace, '--enter-fullscreen');
      await invoke(workspace, '--close');
      expect(exit).not.toHaveBeenCalled();
      expect(workspace.shadowRoot!.querySelector('[data-panel="companion"]')).not.toBeNull();
      await invoke(workspace, '--close', 'companion');
      expect(exit).toHaveBeenCalledOnce();
    });
  });
});
