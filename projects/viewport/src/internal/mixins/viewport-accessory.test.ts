// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { ViewportAccessoryMixin } from './viewport-accessory.js';
import type { ViewportTarget, ViewportTransform, ViewportRect } from '../viewport.types.js';

class ViewportAccessoryTestTarget extends LitElement implements ViewportTarget {
  @property({ type: Number }) scale = 1;
  @property({ type: Boolean }) zoomable = false;
  readonly minScale = 0.25;
  readonly maxScale = 4;
  readonly pannable = false;

  getTransform(): ViewportTransform {
    return { x: 0, y: 0, scale: this.scale };
  }

  getVisibleRect(): ViewportRect {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this.dispatchEvent(new Event('viewportready', { bubbles: true, composed: true }));
  }

  protected override firstUpdated(): void {
    if (this.isConnected) this.dispatchEvent(new Event('viewportready', { bubbles: true, composed: true }));
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!this.isConnected) return;
    if (changed.has('scale') && changed.get('scale') !== undefined) {
      this.dispatchEvent(new Event('viewportchange', { bubbles: true, composed: true }));
    }
    if (changed.has('zoomable') && changed.get('zoomable') !== undefined) {
      this.dispatchEvent(new Event('capabilitieschange', { bubbles: true, composed: true }));
    }
  }
}

customElements.define('nve-viewport', ViewportAccessoryTestTarget);

class ViewportAccessoryTestHost extends ViewportAccessoryMixin(LitElement) {
  readonly connect = vi.fn((target: ViewportTarget) => target.getTransform());
  readonly updateTarget = vi.fn((target: ViewportTarget) => target.getTransform());
  readonly disconnect = vi.fn();

  override resolveViewport(): ViewportTarget | null {
    return super.resolveViewport();
  }

  protected override viewportConnected(target: ViewportTarget): void {
    this.connect(target);
  }

  protected override viewportChanged(target: ViewportTarget): void {
    this.updateTarget(target);
  }

  protected override viewportDisconnected(): void {
    this.disconnect();
  }
}

const tag = 'viewport-accessory-mixin-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportAccessoryTestHost);

describe('ViewportAccessoryMixin', () => {
  let fixture: HTMLElement;
  let host: ViewportAccessoryTestHost;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = new ViewportAccessoryTestHost();
    fixture.append(host);
    await elementIsStable(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  describe('element-reference reflection', () => {
    it('resolves the current id target on each public association read', () => {
      const target = new ViewportAccessoryTestTarget();
      target.id = 'association-target';
      fixture.append(target);
      host.setAttribute('commandfor', target.id);
      expect(host.commandForElement).toBe(target);

      const replacement = new ViewportAccessoryTestTarget();
      replacement.id = target.id;
      target.replaceWith(replacement);
      expect(host.commandForElement).toBe(replacement);
      replacement.remove();
      expect(host.commandForElement).toBeNull();
    });

    it('sets an empty attribute for an explicit element and removes it when cleared', () => {
      host.commandForElement = fixture;
      expect(host.getAttribute('commandfor')).toBe('');
      expect(host.commandForElement).toBe(fixture);

      host.commandForElement = null;
      expect(host.hasAttribute('commandfor')).toBe(false);
      expect(host.commandForElement).toBeNull();
    });

    it('clears an explicit reference when the attribute is set to the same empty value', () => {
      host.commandForElement = fixture;
      host.setAttribute('commandfor', '');
      expect(host.commandForElement).toBeNull();
    });

    it('ignores namespaced attributes when reflecting an explicit element reference', () => {
      host.commandForElement = fixture;
      host.setAttributeNS('urn:example', 'example:commandfor', 'other-target');
      expect(host.commandfor).toBe('');
      expect(host.commandForElement).toBe(fixture);
    });

    it('replaces an explicit reference when an id attribute is supplied', () => {
      const target = new ViewportAccessoryTestTarget();
      target.id = 'attribute-target';
      fixture.append(target);
      host.commandForElement = fixture;
      host.setAttribute('commandfor', target.id);
      expect(host.commandForElement).toBe(target);
    });
  });

  describe('association scope', () => {
    it('resolves ids within the same shadow root', async () => {
      const container = document.createElement('div');
      const shadow = container.attachShadow({ mode: 'open' });
      const target = new ViewportAccessoryTestTarget();
      target.id = 'shadow-target';
      shadow.append(target, host);
      fixture.append(container);
      host.setAttribute('commandfor', target.id);
      await elementIsStable(host);
      expect(host.commandForElement).toBe(target);
    });

    it('does not resolve ids across a shadow boundary', () => {
      const container = document.createElement('div');
      const target = new ViewportAccessoryTestTarget();
      target.id = 'shadow-target';
      container.attachShadow({ mode: 'open' }).append(target);
      fixture.append(container);
      host.setAttribute('commandfor', target.id);
      expect(host.commandForElement).toBeNull();
    });

    it('allows explicit references into ancestor trees but not unrelated shadow trees', async () => {
      const container = document.createElement('div');
      container.attachShadow({ mode: 'open' }).append(host);
      fixture.append(container);
      host.commandForElement = fixture;
      expect(host.commandForElement).toBe(fixture);

      const other = document.createElement('div');
      const target = new ViewportAccessoryTestTarget();
      other.attachShadow({ mode: 'open' }).append(target);
      fixture.append(other);
      host.commandForElement = target;
      expect(host.commandForElement).toBeNull();
      fixture.append(target);
      expect(host.commandForElement).toBe(target);
      await elementIsStable(host);
    });

    it('resolves an id after adoption into another document', async () => {
      const iframe = document.createElement('iframe');
      fixture.append(iframe);
      const frameDocument = iframe.contentDocument;
      if (!frameDocument) throw new Error('Frame document is missing.');
      const target = frameDocument.createElement('nve-viewport');
      target.id = 'adopted-target';
      frameDocument.body.append(host, target);
      host.setAttribute('commandfor', target.id);
      await elementIsStable(host);
      expect(host.commandForElement).toBe(target);
    });

    it('resolves ids in a disconnected element tree', () => {
      const root = document.createElement('div');
      root.id = 'detached-root';
      root.append(host);
      host.setAttribute('commandfor', root.id);
      expect(host.commandForElement).toBe(root);
    });
  });

  describe('parent defaults', () => {
    it('uses a direct parent viewport only when no explicit association is configured', async () => {
      const parent = new ViewportAccessoryTestTarget();
      fixture.append(parent);
      parent.append(host);
      await elementIsStable(host);
      expect(host.commandForElement).toBe(parent);

      host.setAttribute('commandfor', 'missing-target');
      expect(host.commandForElement).toBeNull();
      host.setAttribute('commandfor', '');
      expect(host.commandForElement).toBeNull();
      host.commandForElement = null;
      expect(host.commandForElement).toBe(parent);
    });

    it('refreshes its parent default on reconnection and clears it on disconnection', async () => {
      const previous = new ViewportAccessoryTestTarget();
      const current = new ViewportAccessoryTestTarget();
      fixture.append(previous, current);
      previous.append(host);
      await elementIsStable(host);
      expect(host.commandForElement).toBe(previous);

      host.remove();
      expect(host.commandForElement).toBeNull();
      current.append(host);
      await elementIsStable(host);
      expect(host.commandForElement).toBe(current);
    });
  });

  describe('target selection', () => {
    it('connects a conformant target without depending on the concrete viewport class', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      target.id = 'control-target';
      host.commandfor = target.id;
      expect(host.resolveViewport()).toBe(target);
      expect(host.connect).toHaveBeenLastCalledWith(target);
      expect(host.connect).toHaveReturnedWith({ x: 0, y: 0, scale: 1 });
    });

    it('uses a direct parent viewport when no explicit target is supplied', async () => {
      const parent = new ViewportAccessoryTestTarget();
      fixture.append(parent);
      await elementIsStable(parent);
      parent.append(host);
      expect(host.resolveViewport()).toBe(parent);
    });

    it('uses an explicit id association instead of the parent', async () => {
      const parent = new ViewportAccessoryTestTarget();
      fixture.append(parent);
      await elementIsStable(parent);
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      target.id = 'explicit-id-target';
      parent.append(host);
      host.commandfor = target.id;
      expect(host.resolveViewport()).toBe(target);
    });

    it('switches between explicit element and id associations', async () => {
      const idTarget = new ViewportAccessoryTestTarget();
      idTarget.id = 'id-target';
      const elementTarget = new ViewportAccessoryTestTarget();
      fixture.append(idTarget, elementTarget);
      await elementIsStable(idTarget);
      await elementIsStable(elementTarget);
      host.commandForElement = elementTarget;
      expect(host.resolveViewport()).toBe(elementTarget);

      host.commandfor = idTarget.id;
      expect(host.resolveViewport()).toBe(idTarget);

      host.commandForElement = null;
      expect(host.resolveViewport()).toBeNull();
    });

    it('does not discover targets for an empty explicit id', () => {
      const addListener = vi.spyOn(host.getRootNode(), 'addEventListener');
      host.commandfor = '';
      expect(host.resolveViewport()).toBeNull();
      expect(addListener).not.toHaveBeenCalledWith('viewportready', expect.any(Function));
    });

    it('rejects a target that is not a viewport', () => {
      host.commandForElement = fixture;
      expect(host.resolveViewport()).toBeNull();
    });

    it('resolves ids within the host shadow root', async () => {
      const container = document.createElement('div');
      const shadow = container.attachShadow({ mode: 'open' });
      const target = new ViewportAccessoryTestTarget();
      target.id = 'shadow-target';
      shadow.append(target, host);
      fixture.append(container);
      await elementIsStable(target);
      host.commandfor = target.id;
      expect(host.resolveViewport()).toBe(target);
    });

    it('skips id lookup while the cached target remains valid', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      target.id = 'cached-target';
      host.commandfor = target.id;
      host.resolveViewport();
      const getElementById = vi.spyOn(document, 'getElementById');
      host.connect.mockClear();
      expect(host.resolveViewport()).toBe(target);
      host.requestUpdate();
      await elementIsStable(host);
      expect(getElementById).not.toHaveBeenCalled();
      expect(host.connect).not.toHaveBeenCalled();
    });
  });

  describe('readiness and discovery', () => {
    it('binds before readiness and synchronizes when the same target becomes ready', async () => {
      const target = new ViewportAccessoryTestTarget();
      host.commandForElement = target;
      expect(target.hasUpdated).toBe(false);
      expect(host.resolveViewport()).toBeNull();
      expect(host.connect).not.toHaveBeenCalled();

      fixture.append(target);
      expect(host.resolveViewport()).toBeNull();
      await elementIsStable(target);

      expect(target.hasUpdated).toBe(true);
      expect(host.resolveViewport()).toBe(target);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
    });

    it('connects an accessory after its conformant target has rendered', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      expect(target.hasUpdated).toBe(true);

      target.append(host);
      await elementIsStable(host);

      expect(host.resolveViewport()).toBe(target);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
      expect(host.connect).toHaveReturnedWith({ x: 0, y: 0, scale: 1 });
    });

    it('connects an explicit element that is inserted after the accessory has settled', async () => {
      const target = new ViewportAccessoryTestTarget();
      host.commandForElement = target;
      await elementIsStable(host);
      expect(host.commandForElement).toBeNull();
      expect(host.resolveViewport()).toBeNull();
      expect(host.connect).not.toHaveBeenCalled();

      fixture.append(target);
      await elementIsStable(target);

      expect(host.commandForElement).toBe(target);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
    });

    it('retries an unresolved id when resolution is requested again', async () => {
      host.commandfor = 'late-target';
      expect(host.resolveViewport()).toBeNull();
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      target.id = host.commandfor ?? '';
      expect(host.resolveViewport()).toBe(target);
    });

    it('discovers a missing id target when that viewport becomes ready', async () => {
      host.commandfor = 'later-target';
      expect(host.resolveViewport()).toBeNull();
      const target = new ViewportAccessoryTestTarget();
      target.id = host.commandfor ?? '';
      fixture.append(target);

      await elementIsStable(target);

      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
      expect(host.resolveViewport()).toBe(target);
    });

    it('removes discovery listeners after binding and on host disconnection', async () => {
      const removeListener = vi.spyOn(host.getRootNode(), 'removeEventListener');
      host.commandfor = 'discovered-target';
      host.resolveViewport();
      const target = new ViewportAccessoryTestTarget();
      target.id = host.commandfor ?? '';
      fixture.append(target);
      await elementIsStable(target);
      expect(removeListener).toHaveBeenCalledWith('viewportready', expect.any(Function));
      removeListener.mockClear();

      host.commandfor = 'missing-target';
      host.resolveViewport();
      host.remove();
      expect(removeListener).toHaveBeenCalledWith('viewportready', expect.any(Function));
    });

    it('does not initialize a previous target that becomes ready after retargeting', async () => {
      const previous = new ViewportAccessoryTestTarget();
      const current = new ViewportAccessoryTestTarget();
      host.commandForElement = previous;
      host.resolveViewport();
      fixture.append(previous, current);
      host.commandForElement = current;
      expect(previous.hasUpdated).toBe(false);
      expect(current.hasUpdated).toBe(false);

      await Promise.all([previous, current].map(target => elementIsStable(target)));

      expect(previous.hasUpdated).toBe(true);
      expect(current.hasUpdated).toBe(true);
      expect(host.resolveViewport()).toBe(current);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(current);
    });

    it('does not initialize a pending target after the host disconnects', async () => {
      const target = new ViewportAccessoryTestTarget();
      host.commandForElement = target;
      host.resolveViewport();
      fixture.append(target);
      expect(target.hasUpdated).toBe(false);
      host.remove();
      host.connect.mockClear();

      await elementIsStable(target);

      expect(target.hasUpdated).toBe(true);
      expect(host.resolveViewport()).toBeNull();
      expect(host.connect).not.toHaveBeenCalled();
    });
  });

  describe('state subscriptions', () => {
    it('reports committed state and capability changes from the bound viewport', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      host.commandForElement = target;
      host.resolveViewport();
      host.updateTarget.mockClear();

      target.scale = 2;
      await elementIsStable(target);
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(target);
      host.updateTarget.mockClear();

      target.zoomable = true;
      await elementIsStable(target);
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(target);
    });

    it('ignores notifications from a nested viewport', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      const nested = new ViewportAccessoryTestTarget();
      fixture.append(nested);
      await elementIsStable(nested);
      target.append(nested);
      host.commandForElement = target;
      host.resolveViewport();
      host.connect.mockClear();
      host.updateTarget.mockClear();

      nested.scale = 2;
      nested.zoomable = true;
      await elementIsStable(nested);
      nested.remove();
      target.append(nested);
      await elementIsStable(nested);

      expect(nested.hasUpdated).toBe(true);
      expect(host.updateTarget).not.toHaveBeenCalled();
      expect(host.connect).not.toHaveBeenCalled();
    });

    it('detaches state listeners when the explicit target changes', async () => {
      const previous = new ViewportAccessoryTestTarget();
      fixture.append(previous);
      await elementIsStable(previous);
      const replacement = new ViewportAccessoryTestTarget();
      fixture.append(replacement);
      await elementIsStable(replacement);
      host.commandForElement = previous;
      host.resolveViewport();
      host.commandForElement = replacement;
      expect(host.resolveViewport()).toBe(replacement);
      host.updateTarget.mockClear();

      previous.scale = 2;
      previous.zoomable = true;
      await elementIsStable(previous);
      expect(host.updateTarget).not.toHaveBeenCalled();

      replacement.scale = 3;
      await elementIsStable(replacement);
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(replacement);
    });
  });

  describe('target lifecycle', () => {
    it('rebinds a same-id replacement and releases the previous subscription', async () => {
      const previous = new ViewportAccessoryTestTarget();
      fixture.append(previous);
      await elementIsStable(previous);
      previous.id = 'replaced-target';
      host.commandfor = previous.id;
      host.resolveViewport();
      const replacement = new ViewportAccessoryTestTarget();
      fixture.append(replacement);
      await elementIsStable(replacement);
      replacement.id = previous.id;
      previous.replaceWith(replacement);
      expect(host.resolveViewport()).toBe(replacement);
      host.connect.mockClear();
      previous.zoomable = true;
      await elementIsStable(previous);
      expect(host.connect).not.toHaveBeenCalled();
      expect(host.updateTarget).not.toHaveBeenCalled();
      replacement.scale = 2;
      await elementIsStable(replacement);
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(replacement);
    });

    it('releases an id target when its id changes', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      target.id = 'original-id';
      host.commandfor = target.id;
      host.resolveViewport();
      target.id = 'changed-id';
      expect(host.resolveViewport()).toBeNull();
      expect(host.disconnect).toHaveBeenCalledOnce();
      host.connect.mockClear();
      target.scale = 2;
      await elementIsStable(target);
      expect(host.updateTarget).not.toHaveBeenCalled();
    });

    it('retains the association while its explicit target disconnects and reconnects', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      host.commandForElement = target;
      expect(host.resolveViewport()).toBe(target);

      target.remove();

      expect(host.resolveViewport()).toBeNull();
      expect(host.disconnect).toHaveBeenCalledOnce();
      host.connect.mockClear();
      fixture.append(target);
      await elementIsStable(target);
      expect(host.resolveViewport()).toBe(target);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
    });

    it('resynchronizes a rendered target on reconnection before its pending update', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      host.commandForElement = target;
      host.resolveViewport();
      target.remove();
      target.scale = 2;
      host.connect.mockClear();
      fixture.append(target);
      expect(target.hasUpdated).toBe(true);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);

      await elementIsStable(target);

      expect(target.hasUpdated).toBe(true);
      expect(host.resolveViewport()).toBe(target);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
      expect(host.disconnect).not.toHaveBeenCalled();
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(target);
    });

    it('resynchronizes target changes rendered while disconnected on reconnection', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      host.commandForElement = target;
      host.resolveViewport();
      await elementIsStable(host);
      target.remove();
      target.scale = 2;
      await elementIsStable(target);
      host.connect.mockClear();
      host.updateTarget.mockClear();

      fixture.append(target);

      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
      expect(host.resolveViewport()?.scale).toBe(2);
      expect(host.disconnect).not.toHaveBeenCalled();
      expect(host.updateTarget).not.toHaveBeenCalled();
    });

    it('releases subscriptions on disconnect and restores them on reconnect', async () => {
      const target = new ViewportAccessoryTestTarget();
      fixture.append(target);
      await elementIsStable(target);
      host.commandForElement = target;
      host.resolveViewport();
      host.remove();
      expect(host.resolveViewport()).toBeNull();
      expect(host.disconnect).toHaveBeenCalledOnce();
      host.connect.mockClear();

      target.scale = 2;
      target.zoomable = true;
      await elementIsStable(target);
      expect(host.connect).not.toHaveBeenCalled();

      fixture.append(host);
      expect(host.connect).toHaveBeenCalledExactlyOnceWith(target);
      host.connect.mockClear();
      target.scale = 3;
      await elementIsStable(target);
      expect(host.updateTarget).toHaveBeenCalledExactlyOnceWith(target);
    });
  });
});
