import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import type { IconName } from '@nvidia-elements/core/icon';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

describe(Icon.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon></nve-icon>`);
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
});
