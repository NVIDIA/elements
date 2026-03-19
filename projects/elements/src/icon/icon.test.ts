// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import type { IconName } from '@nvidia-elements/core/icon';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

describe(Icon.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon></nve-icon>`); /* eslint-disable-line @nvidia-elements/lint/no-missing-icon-name */
    element = fixture.querySelector(Icon.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should define element', () => {
    expect(customElements.get(Icon.metadata.tag)).toBeDefined();
  });

  it('should provide a aria role of img', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('img');
  });

  it('should use aria-hidden to semantically hide the SVG in favor of the host element role', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[internal-host]').getAttribute('aria-hidden')).toBe('true');
  });

  it('should update svg reference when "name" is updated', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.shadowRoot.innerHTML).includes('<div internal-host=""');
  });

  it('should reflect name attribute for CSS selectors', async () => {
    expect(element.name).eq(undefined);
    element.name = 'book';
    await elementIsStable(element);
    expect(element.getAttribute('name')).toBe('book');
  });

  it('should allow icon aliasing', async () => {
    /** @deprecated aliases */
    Icon.alias({
      'chevron-up': 'chevron',
      'chevron-right': 'chevron',
      'chevron-down': 'chevron',
      'chevron-left': 'chevron',
      'additional-actions': 'more-actions',
      analytics: 'pie-chart',
      annotation: 'transparent-box',
      'app-switcher': 'switch-apps',
      assist: 'chat-bubble',
      attached: 'paper-clip',
      breadcrumb: 'checron-right',
      'category-list': 'bars-3-bottom-left',
      checkmark: 'check',
      chop: 'scissors',
      collection: 'rectangle-stack-vertical',
      'dark-mode': 'moon',
      dashboard: 'add-grid',
      date: 'calendar',
      docs: 'book',
      domains: 'globe-alt-stroke',
      'expand-full-screen': 'maximize',
      expand: 'maximize',
      'expand-panel': 'arrow-stop',
      'collapse-panel': 'arrow-stop',
      'failed-badge': 'x-circle',
      failed: 'x-circle',
      'favorite-filled': 'star',
      'favorite-outline': 'star-stroke',
      feedback: 'megaphone',
      'filter-ouline': 'filter-stroke',
      flagged: 'flag',
      'free-text': 'edit',
      help: 'question-mark-circle',
      hidden: 'eye-hidden',
      'important-badge': 'exclamation-circle',
      'inbox-1': 'carousel-vertical',
      information: 'information-circle-stroke',
      interaction: 'cursor-rays',
      'light-mode': 'sun',
      mail: 'envelope',
      maintenance: 'wrench',
      'minus-badge': 'miunus-circle',
      'navigate-back': 'arrow',
      'navigate-to': 'arrow',
      notification: 'bell',
      obstacle: 'traffic-cone',
      'open-external-link': 'arrow-angle',
      organization: 'office-building',
      pan: 'hand',
      'passed-or-success': 'checkmark-circle',
      location: 'map-pin',
      'pinned-1': 'pin',
      'plugin-store': 'plug',
      plugins: 'plug',
      'plus-badge': 'plus-circle',
      plus: 'add',
      project: 'folder',
      'refresh-1': 'redo',
      retry: 'redo',
      reset: 'undo',
      schedule: 'clock',
      'set-priority': 'chart-bar',
      settings: 'gear',
      shortcut: 'lightning-bolt',
      'success-badge': 'checkmark-circle',
      support: 'chat-bubble',
      'system-status': 'chip',
      transparency: 'circle-half',
      team: 'person-3',
      user: 'person',
      'video-pause': 'pause',
      'video-play': 'play',
      'video-stop': 'stop',
      'view-as-list': 'bars-4',
      'view-as-table-outline': 'table',
      visible: 'eye',
      warning: 'exclamation-triangle',
      tutorial: 'academic-cap',
      debugging: 'bug',
      insights: 'projector',
      beginning: 'arrow-stop',
      end: 'arrow-stop',
      'carousel-vertical': 'carousel',
      'carousel-horizontal': 'carousel',
      'thumbs-down-stroke': 'thumb-stroke',
      'thumbs-down': 'thumb',
      'thumbs-up-stroke': 'thumb-stroke',
      'thumbs-up': 'thumb'
    });

    await elementIsStable(element);
    expect((customElements.get(Icon.metadata.tag) as typeof Icon)['_iconsRegistry']['chevron-up']).toStrictEqual(
      (customElements.get(Icon.metadata.tag) as typeof Icon)['_iconsRegistry']['chevron']
    );
  });

  it('should allow icons to be registered', async () => {
    await (customElements.get(Icon.metadata.tag) as typeof Icon).add({
      'test-svg': { svg: () => '<svg id="test-svg"><path d=""/></svg>' }
    });

    expect((customElements.get(Icon.metadata.tag) as typeof Icon)._icons['test-svg']).toBeDefined();
  });

  it('should requestUpdate when new icon is registered', async () => {
    const spy = vi.spyOn(element, 'requestUpdate');
    element.name = 'test-svg-request-update' as IconName;
    await elementIsStable(element);

    const event = untilEvent(document, 'nve-icon-test-svg-request-update');

    await (customElements.get(Icon.metadata.tag) as typeof Icon).add({
      'test-svg-request-update': { svg: () => '<svg id="test-svg-request-update"><path d=""/></svg>' }
    });

    expect(await event).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should fetch icon if using an svg extension', async () => {
    const original = window.fetch;
    window.fetch = vi
      .fn()
      .mockImplementation(() => new Promise(r => r({ text: () => '<svg id="test.svg"><path d=""/></svg>' })));

    element.name = 'test.svg' as IconName;
    await elementIsStable(element);
    expect(window.fetch).toHaveBeenCalled();
    window.fetch = original;
  });

  it('should dispatch event with icons detail when adding icons', async () => {
    const iconName = 'test-svg-with-detail';
    let receivedDetail: unknown;

    const eventPromise = new Promise<void>(resolve => {
      document.addEventListener(`${Icon.metadata.tag}-${iconName}`, ((event: CustomEvent) => {
        receivedDetail = event.detail;
        resolve();
      }) as EventListener);
    });

    await (customElements.get(Icon.metadata.tag) as typeof Icon).add({
      [iconName]: { svg: () => '<svg id="test-svg-with-detail"><path d=""/></svg>' }
    });

    await eventPromise;
    expect(receivedDetail).toBeDefined();
    expect((receivedDetail as { svg: () => string }).svg).toBeDefined();
  });

  it('should only requestUpdate when event detail contains the icon name', async () => {
    const spy = vi.spyOn(element, 'requestUpdate');
    element.name = 'test-svg-specific-icon' as IconName;
    await elementIsStable(element);
    spy.mockClear();

    // Add a different icon - should NOT trigger requestUpdate for this element
    await (customElements.get(Icon.metadata.tag) as typeof Icon).add({
      'different-icon': { svg: () => '<svg id="different-icon"><path d=""/></svg>' }
    });

    // Wait for any potential async updates
    await new Promise(resolve => setTimeout(resolve, 50));
    await elementIsStable(element);

    // The element should not have called requestUpdate since the added icon
    // does not match the element's name
    expect(spy).not.toHaveBeenCalled();
  });

  it('should requestUpdate only when matching icon is added', async () => {
    const iconName = 'test-svg-matching' as IconName;
    // Create a new fixture with the name already set so the event listener is registered correctly
    removeFixture(fixture);
    fixture = await createFixture(html`<nve-icon name=${iconName}></nve-icon>`);
    const el = fixture.querySelector<Icon>(Icon.metadata.tag);
    await elementIsStable(el);

    const spy = vi.spyOn(el, 'requestUpdate');

    await (customElements.get(Icon.metadata.tag) as typeof Icon).add({
      [iconName]: { svg: () => '<svg id="test-svg-matching"><path d=""/></svg>' }
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalled();
  });
});
