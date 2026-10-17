// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { getActiveElement } from '@nvidia-elements/core/internal';

import {
  captureTabScroll,
  captureWorkspaceFocus,
  focusWorkspacePanel,
  getPanelLabel,
  isWorkspaceCompositionMutation,
  shouldFocusAfterWorkspaceClose
} from './composition.utils.js';

import type { WorkspacePanel } from '../../panel/panel.js';

import '../../define.js';
import '@nvidia-elements/core/tabs/define.js';

@customElement('workspace-composition-test-host')
class CompositionTestHost extends LitElement {
  content: TemplateResult | typeof nothing = nothing;

  render() {
    return html`${this.content}<slot></slot>`;
  }
}

let fixture: HTMLElement;

afterEach(() => {
  removeFixture(fixture);
  vi.restoreAllMocks();
});

async function setup(content: TemplateResult | typeof nothing) {
  fixture = await createFixture(html`
    <workspace-composition-test-host></workspace-composition-test-host>
    <button id="outside">Outside</button>
  `);
  const host = fixture.querySelector<CompositionTestHost>('workspace-composition-test-host')!;
  host.content = content;
  host.requestUpdate();
  await elementIsStable(host);
  return host;
}

function mutation(host: HTMLElement, change: () => void) {
  const observer = new MutationObserver(() => {});
  observer.observe(host, { subtree: true, childList: true, attributes: true, characterData: true });
  change();
  const records = observer.takeRecords();
  observer.disconnect();
  expect(records).toHaveLength(1);
  return records[0]!;
}

describe('workspace composition', () => {
  it('extracts rich title text without prefix or suffix controls', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <nve-workspace-panel id="editor">
        <nve-workspace-panel-header>
          <span slot="prefix">Status</span><span><strong>Editor</strong> notes</span><button slot="suffix">Actions</button>
        </nve-workspace-panel-header>
      </nve-workspace-panel>
    `;
    const panels = [...host.querySelectorAll<WorkspacePanel>('nve-workspace-panel')];

    expect(getPanelLabel(panels, 'editor')).toBe('Editor notes');
  });

  it('falls back to the panel ID when an authored title is unavailable', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <nve-workspace-panel id="empty">
        <nve-workspace-panel-header> </nve-workspace-panel-header>
      </nve-workspace-panel>
      <nve-workspace-panel id="unlabeled"></nve-workspace-panel>
    `;
    const panels = [...host.querySelectorAll<WorkspacePanel>('nve-workspace-panel')];

    expect(getPanelLabel(panels, 'empty')).toBe('empty');
    expect(getPanelLabel(panels, 'unlabeled')).toBe('unlabeled');
    expect(getPanelLabel(panels, 'missing')).toBe('missing');
  });

  it.each(['nve-workspace-panel-header', 'nve-workspace-panel-footer'])(
    'recognizes adding and removing a directly owned %s',
    tag => {
      const host = document.createElement('div');
      const panel = document.createElement('nve-workspace-panel');
      host.append(panel);
      const content = document.createElement(tag);

      expect(
        isWorkspaceCompositionMutation(
          host,
          mutation(host, () => panel.append(content))
        )
      ).toBe(true);
      expect(
        isWorkspaceCompositionMutation(
          host,
          mutation(host, () => content.remove())
        )
      ).toBe(true);
    }
  );

  it('recognizes title text and directly owned slot changes', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <nve-workspace-panel>
        <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
        <button>Actions</button>
      </nve-workspace-panel>
    `;
    const title = host.querySelector('nve-workspace-panel-header')!.firstChild!;
    const action = host.querySelector('button')!;

    expect(
      isWorkspaceCompositionMutation(
        host,
        mutation(host, () => (title.textContent = 'Notes'))
      )
    ).toBe(true);
    expect(
      isWorkspaceCompositionMutation(
        host,
        mutation(host, () => (action.slot = 'suffix'))
      )
    ).toBe(true);
  });

  it('excludes application content and nested workspace header mutations', () => {
    const host = document.createElement('div');
    // This tests selector relationships in a disconnected tree; custom elements are constructed but never connected or rendered.
    host.innerHTML = `
      <nve-workspace-panel>
        <div>Application content</div>
        <nve-workspace>
          <nve-workspace-panel>
            <nve-workspace-panel-header>Nested</nve-workspace-panel-header>
          </nve-workspace-panel>
        </nve-workspace>
      </nve-workspace-panel>
    `;
    const body = host.querySelector('div')!;
    const nestedTitle = host.querySelector('nve-workspace-panel-header')!.firstChild!;

    expect(
      isWorkspaceCompositionMutation(
        host,
        mutation(host, () => body.append(' more content'))
      )
    ).toBe(false);
    expect(
      isWorkspaceCompositionMutation(
        host,
        mutation(host, () => (nestedTitle.textContent = 'Changed'))
      )
    ).toBe(false);
  });
});

describe('workspace tab scroll restoration', () => {
  const strips = (ids: string[]) => html`
    ${ids.map(
      id => html`
      <div class="tablist" data-group=${id} style="width:100px;overflow:auto">
        <div style="width:500px;height:20px"></div>
      </div>
    `
    )}
  `;

  it('restores captured offsets by group identity after rendered strips are replaced and reordered', async () => {
    const ids = ['["a","b"]', '["c","d"]'];
    const host = await setup(strips(ids));
    const original = [...host.shadowRoot!.querySelectorAll<HTMLElement>('.tablist')];
    original[0]!.scrollLeft = 40;
    original[1]!.scrollLeft = 80;
    const saved = original.map(strip => strip.scrollLeft);
    expect(saved.every(offset => offset > 0)).toBe(true);
    const restore = captureTabScroll(host);
    host.content = html`<section>${strips([...ids].reverse())}</section>`;
    host.requestUpdate();
    restore();
    await elementIsStable(host);

    const current = [...host.shadowRoot!.querySelectorAll<HTMLElement>('.tablist')];
    expect(current.every(strip => !original.includes(strip))).toBe(true);
    expect(current.map(strip => strip.scrollLeft)).toEqual([...saved].reverse());
  });

  it('ignores removed groups and leaves newly introduced strip positions alone', async () => {
    const host = await setup(strips(['a']));
    host.shadowRoot!.querySelector<HTMLElement>('.tablist')!.scrollLeft = 40;
    const restore = captureTabScroll(host);
    host.content = strips(['new']);
    host.requestUpdate();
    await elementIsStable(host);
    const current = host.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    current.scrollLeft = 60;
    const saved = current.scrollLeft;
    restore();
    await elementIsStable(host);

    expect(current.scrollLeft).toBe(saved);
  });
});

describe('workspace captured focus', () => {
  it('restores surviving content after focus is lost', async () => {
    const host = await setup(html`<button data-panel="a">Alpha</button>`);
    const control = host.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    control.focus();
    const restore = captureWorkspaceFocus(host)!;
    control.blur();
    restore();
    expect(getActiveElement()).toBe(control);
  });

  it('does not refocus a control that retained focus', async () => {
    const host = await setup(html`<button data-panel="a">Alpha</button>`);
    const control = host.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    control.focus();
    const restore = captureWorkspaceFocus(host)!;
    const focus = vi.spyOn(control, 'focus');
    restore();
    expect(getActiveElement()).toBe(control);
    expect(focus).not.toHaveBeenCalled();
  });

  it.each(['data-panel', 'data-drag-group'])('recovers a replaced control by its %s identity', async attribute => {
    const host = await setup(html`<button>Alpha</button>`);
    const original = host.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    original.setAttribute(attribute, 'a"b');
    original.focus();
    const restore = captureWorkspaceFocus(host)!;
    const replacement = document.createElement('button');
    replacement.setAttribute(attribute, 'a"b');
    original.replaceWith(replacement);
    restore();
    expect(getActiveElement()).toBe(replacement);
  });

  it('preserves newly established meaningful focus instead of restoring an earlier control', async () => {
    const host = await setup(html`<button>Alpha</button>`);
    const original = host.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    original.focus();
    const restore = captureWorkspaceFocus(host)!;
    const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    restore();
    expect(getActiveElement()).toBe(outside);
  });

  it('does not capture focus on the document body or the host itself', async () => {
    const host = await setup(nothing);
    const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    outside.blur();
    expect(captureWorkspaceFocus(host)).toBeUndefined();
    host.tabIndex = 0;
    host.focus();
    expect(captureWorkspaceFocus(host)).toBeUndefined();
  });

  it.each(['hidden', 'disabled'] as const)('does not focus a replacement that is %s', async state => {
    const host = await setup(html`<button data-panel="a">Alpha</button>`);
    const original = host.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
    original.focus();
    const restore = captureWorkspaceFocus(host)!;
    const replacement = document.createElement('button');
    replacement.dataset.panel = 'a';
    replacement[state] = true;
    original.replaceWith(replacement);
    restore();
    expect(getActiveElement()).toBe(document.body);
  });

  it('does not restore connected external focus after the host disconnects', async () => {
    const host = await setup(nothing);
    const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    expect(getActiveElement()).toBe(outside);
    const restore = captureWorkspaceFocus(host)!;
    outside.blur();
    host.remove();
    expect(outside.isConnected).toBe(true);
    expect(outside.checkVisibility({ visibilityProperty: true })).toBe(true);
    expect(getActiveElement()).toBe(document.body);

    restore();

    expect(getActiveElement()).toBe(document.body);
  });

  it('does not restore original-document focus after a connected host is adopted', async () => {
    const host = await setup(nothing);
    const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    expect(getActiveElement()).toBe(outside);
    const restore = captureWorkspaceFocus(host)!;
    outside.blur();
    const other = document.implementation.createHTMLDocument();
    other.body.append(host);
    expect(host.isConnected).toBe(true);
    expect(host.ownerDocument).toBe(other);
    expect(outside.ownerDocument).toBe(document);
    expect(outside.checkVisibility({ visibilityProperty: true })).toBe(true);
    expect(getActiveElement()).toBe(document.body);

    restore();

    expect(getActiveElement()).toBe(document.body);
    host.remove();
  });
});

describe('workspace panel focus', () => {
  it('waits for rendered selection before focusing and revealing its tab', async () => {
    const host = await setup(nothing);
    host.content = html`
      <div style="width:100px;overflow:auto">
        <div style="width:500px;display:flex">
          <div style="width:300px;flex:none"></div>
          <div class="tab-entry" style="width:100px;flex:none">
            <nve-tabs><nve-tabs-item data-panel="a" selected>Alpha</nve-tabs-item></nve-tabs>
          </div>
        </div>
      </div>
    `;
    host.requestUpdate();
    await focusWorkspacePanel(host);
    const tab = host.shadowRoot!.querySelector<HTMLElement>('nve-tabs-item')!;
    expect(host.shadowRoot!.activeElement).toBe(tab);
    expect(host.shadowRoot!.querySelector('div')!.scrollLeft).toBeGreaterThan(0);
  });

  it('focuses an explicit tab without changing the existing scroll position', async () => {
    const host = await setup(html`
      <div style="width:100px;overflow:auto">
        <div style="width:500px;display:flex">
          <div style="width:300px;flex:none"></div>
          <div class="tab-entry" style="width:100px;flex:none">
            <nve-tabs><nve-tabs-item data-panel="a" selected>Alpha</nve-tabs-item></nve-tabs>
          </div>
        </div>
      </div>
    `);
    const strip = host.shadowRoot!.querySelector('div')!;
    strip.scrollLeft = 20;
    const saved = strip.scrollLeft;
    await focusWorkspacePanel(host, { id: 'a', group: true, preserveScroll: true });
    expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector('nve-tabs-item'));
    expect(strip.scrollLeft).toBe(saved);
  });

  it('prefers the group grip when group focus is requested', async () => {
    const host = await setup(html`
      <button data-drag-group="a">Move group</button>
      <nve-tabs><nve-tabs-item data-panel="a" selected>Alpha</nve-tabs-item></nve-tabs>
    `);
    await focusWorkspacePanel(host, { id: 'a', group: true });
    expect(getActiveElement()).toBe(host.shadowRoot!.querySelector('button'));
  });

  it('falls back to the visible singleton body instead of focusing its passive title', async () => {
    const host = await setup(html`<span class="panel-title" data-panel="a">Alpha</span>`);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'a';
    panel.style.cssText = 'width:200px;height:80px';
    host.append(panel);
    panel._configure({
      selected: true,
      offset: 0,
      animate: false,
      tabWidth: 200,
      headerHeight: 0,
      suffixEnd: 0,
      clipLeft: 0,
      clipWidth: 200,
      scrollLeft: 0
    });
    await elementIsStable(panel);
    await focusWorkspacePanel(host);
    expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body'));
  });

  it('leaves existing focus alone when no selected or requested target exists', async () => {
    const host = await setup(nothing);
    const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    await focusWorkspacePanel(host);
    await focusWorkspacePanel(host, { id: 'missing' });
    expect(getActiveElement()).toBe(outside);
  });
});

describe('workspace close focus policy', () => {
  it.each([
    { target: 'content', id: 'a', expected: true },
    { target: 'content', id: 'b', expected: false },
    { target: 'tab', id: 'a', expected: true },
    { target: 'close', id: 'a', expected: true },
    { target: 'tab', id: 'b', expected: false },
    { target: 'outside', id: 'a', expected: false },
    { target: 'none', id: 'a', expected: true }
  ])('decides recovery for $id when focus is on $target', async ({ target, id, expected }) => {
    const host = await setup(html`
      <button id="tab" data-panel="a">Alpha</button>
      <button id="close" data-close="a">Close Alpha</button>
    `);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'a';
    const input = document.createElement('input');
    panel.append(input);
    const other = document.createElement('nve-workspace-panel');
    other.id = 'b';
    host.append(panel, other);
    await elementIsStable(panel);
    if (target === 'content') {
      panel._configure({
        selected: true,
        offset: 0,
        animate: false,
        tabWidth: 200,
        headerHeight: 0,
        suffixEnd: 0,
        clipLeft: 0,
        clipWidth: 200,
        scrollLeft: 0
      });
      panel.style.cssText = 'width:200px;height:80px';
      await elementIsStable(panel);
      input.focus();
      expect(getActiveElement()).toBe(input);
    } else if (target === 'outside' || target === 'none') {
      const outside = fixture.querySelector<HTMLButtonElement>('#outside')!;
      outside.focus();
      expect(getActiveElement()).toBe(outside);
      if (target === 'none') outside.blur();
    } else {
      const control = host.shadowRoot!.querySelector<HTMLButtonElement>(`#${target}`)!;
      control.focus();
      expect(getActiveElement()).toBe(control);
    }
    expect(shouldFocusAfterWorkspaceClose(host, id)).toBe(expected);
  });
});
