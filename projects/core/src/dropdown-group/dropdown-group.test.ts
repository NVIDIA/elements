// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import type { MenuItem } from '@nvidia-elements/core/menu';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/input/define.js';

describe(DropdownGroup.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('cascading menus', () => {
    let element: DropdownGroup;
    let dropdown: HTMLElement;
    let trigger: MenuItem;
    let childItem: HTMLElement;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-button popovertarget="outer-menu">Actions</nve-button>
        <nve-dropdown-group>
          <nve-dropdown id="outer-menu">
            <nve-menu>
              <nve-menu-item popovertarget="secondary-menu"><span>Move</span></nve-menu-item>
            </nve-menu>
          </nve-dropdown>
          <nve-dropdown id="secondary-menu" position="right">
            <nve-menu>
              <nve-menu-item disabled>Unavailable</nve-menu-item>
              <nve-menu-item>Left</nve-menu-item>
            </nve-menu>
          </nve-dropdown>
        </nve-dropdown-group>
      `);
      element = fixture.querySelector('nve-dropdown-group');
      dropdown = fixture.querySelector('#secondary-menu');
      trigger = element.querySelector('nve-menu-item');
      childItem = dropdown.querySelector('nve-menu-item:not([disabled])');
      await elementIsStable(element);
      const outer = fixture.querySelector('nve-dropdown');
      const opened = untilEvent(outer, 'open');
      outer.showPopover({ source: fixture.querySelector('nve-button') });
      await opened;
    });

    it('should configure assigned dropdowns as manual popovers', () => {
      element.querySelectorAll('nve-dropdown').forEach(assignedDropdown => {
        expect(assignedDropdown.popoverType).toBe('manual');
      });
    });

    describe('keyboard navigation', () => {
      it.each([
        { direction: 'ltr', openKey: 'ArrowRight', closeKey: 'ArrowLeft' },
        { direction: 'rtl', openKey: 'ArrowLeft', closeKey: 'ArrowRight' }
      ])('should open and close a submenu in $direction layouts', async ({ direction, openKey, closeKey }) => {
        element.dir = direction;
        const opened = untilEvent(dropdown, 'open');
        trigger.querySelector('span').dispatchEvent(
          new KeyboardEvent('keydown', {
            code: openKey,
            bubbles: true,
            composed: true
          })
        );
        await opened;
        expect(dropdown.matches(':popover-open')).toBe(true);
        expect(document.activeElement).toBe(childItem);

        const closed = untilEvent(dropdown, 'close');
        childItem.dispatchEvent(new KeyboardEvent('keydown', { code: closeKey, bubbles: true, composed: true }));
        await closed;
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(document.activeElement).toBe(trigger);
        expect(fixture.querySelector('#outer-menu').matches(':popover-open')).toBe(true);
      });

      it('should ignore disabled submenu triggers', () => {
        trigger.setAttribute('disabled', '');
        trigger.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
        expect(dropdown.matches(':popover-open')).toBe(false);
      });

      it('should handle nested label origins without propagating submenu arrows', async () => {
        const label = document.createElement('span');
        const root = label.attachShadow({ mode: 'open' });
        root.innerHTML = '<span>Move</span>';
        trigger.append(label);
        const openKey = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          bubbles: true,
          composed: true,
          cancelable: true
        });
        const escaped: Event[] = [];
        fixture.addEventListener('keydown', event => escaped.push(event));
        const opened = untilEvent(dropdown, 'open');
        root.querySelector('span').dispatchEvent(openKey);
        await opened;
        expect(openKey.defaultPrevented).toBe(true);
        expect(escaped).toHaveLength(0);

        const childLabel = document.createElement('span');
        childItem.append(childLabel);
        const closed = untilEvent(dropdown, 'close');
        childLabel.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'ArrowLeft',
            bubbles: true,
            composed: true,
            cancelable: true
          })
        );
        await closed;
        expect(document.activeElement).toBe(trigger);
        expect(escaped).toHaveLength(0);
      });

      it('should resolve a target assigned through the invoker property', async () => {
        trigger.removeAttribute('popovertarget');
        trigger.popoverTargetElement = dropdown;
        const opened = untilEvent(dropdown, 'open');
        trigger.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
        await opened;
        expect(document.activeElement).toBe(childItem);
      });

      it('should remove closed cascading menus from layout without closing the parent', async () => {
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const child = dropdown;
        await elementIsStable(parent);
        await elementIsStable(child);
        expect(child.getClientRects()).toHaveLength(0);
        expect(document.activeElement).toBe(parent.querySelector('nve-menu-item'));
        const childOpened = untilEvent(child, 'open');
        parent.querySelector('nve-menu-item').dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'ArrowRight',
            bubbles: true
          })
        );
        await childOpened;
        expect(document.activeElement).toBe(childItem);
        expect(parent.getClientRects()).toHaveLength(1);
        expect(child.getClientRects()).toHaveLength(1);
        childItem.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'ArrowLeft',
            bubbles: true
          })
        );
        await elementIsStable(child);
        await expect.poll(() => child.getClientRects().length).toBe(0);
        expect(parent.matches(':popover-open')).toBe(true);
        expect(parent.getClientRects()).toHaveLength(1);
        element.close();
        await elementIsStable(parent);
        await expect.poll(() => parent.getClientRects().length).toBe(0);
      });
    });

    describe('focus restoration', () => {
      it('should return focus to the root invoker when the parent closes', async () => {
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const closed = untilEvent(parent, 'close');
        parent.hidePopover();
        await closed;
        expect(document.activeElement).toBe(fixture.querySelector('nve-button'));
      });

      it('should restore focus after click opening and keyboard closing', async () => {
        const opened = untilEvent(dropdown, 'open');
        trigger.click();
        await opened;
        const closed = untilEvent(dropdown, 'close');
        childItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true }));
        await closed;
        expect(document.activeElement).toBe(trigger);
      });

      it('should replace the saved invoker on each opening', async () => {
        const other = document.createElement('button');
        fixture.append(other);
        for (const source of [trigger, other]) {
          const opened = untilEvent(dropdown, 'open');
          dropdown.showPopover({ source });
          await opened;
          const closed = untilEvent(dropdown, 'close');
          dropdown.hidePopover();
          await closed;
          expect(document.activeElement).toBe(source);
        }
      });

      it('should restore the root after opening a cascade in the same turn', async () => {
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const button = fixture.querySelector('nve-button');
        const parentClosed = untilEvent(parent, 'close');
        parent.hidePopover();
        await parentClosed;
        const opened = [untilEvent(parent, 'open'), untilEvent(dropdown, 'open')];
        parent.showPopover({ source: button });
        dropdown.showPopover({ source: trigger });
        await Promise.all(opened);
        const closed = [untilEvent(parent, 'close'), untilEvent(dropdown, 'close')];
        element.close();
        await Promise.all(closed);
        expect(document.activeElement).toBe(button);
      });

      it.each(['root', 'group'])('should capture the root opener again after closing the %s', async scope => {
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const closed = untilEvent(parent, 'close');
        if (scope === 'root') {
          parent.hidePopover();
        } else {
          element.close();
        }
        await closed;
        const source = document.createElement('button');
        fixture.append(source);
        const opened = untilEvent(parent, 'open');
        parent.showPopover({ source });
        await opened;
        const childOpened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await childOpened;
        const dismissed = [untilEvent(parent, 'close'), untilEvent(dropdown, 'close')];
        element.close();
        await Promise.all(dismissed);
        expect(document.activeElement).toBe(source);
      });

      it('should preserve outside focus when dismissing the group by pointer', async () => {
        const outside = document.createElement('button');
        fixture.append(outside);
        const opened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await opened;
        outside.focus();
        const closed = untilEvent(dropdown, 'close');
        outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: -100, clientY: -100 }));
        await closed;
        expect(document.activeElement).toBe(outside);
      });

      it.each(['submenu', 'cascade'])('should preserve focus moved after hiding the %s', async scope => {
        const outside = document.createElement('button');
        fixture.append(outside);
        const opened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await opened;
        const closed = untilEvent(dropdown, 'close');
        if (scope === 'cascade') {
          element.close();
        } else {
          dropdown.hidePopover();
        }
        outside.focus();
        await closed;
        expect(document.activeElement).toBe(outside);
      });
      it('should preserve focus moved by application code while the cascade is hiding', async () => {
        const outside = document.createElement('button');
        fixture.append(outside);
        const opened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await opened;
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        parent.addEventListener(
          'beforetoggle',
          event => {
            if (event.newState === 'closed') outside.focus();
          },
          { once: true }
        );
        const closed = untilEvent(dropdown, 'close');
        element.close();
        await closed;
        expect(document.activeElement).toBe(outside);
      });
    });

    describe('deeper cascades', () => {
      let deepest: HTMLElement;
      let deepestItem: HTMLElement;

      beforeEach(async () => {
        deepest = document.createElement('nve-dropdown');
        deepest.id = 'deepest-menu';
        deepest.append(dropdown.querySelector('nve-menu').cloneNode(true));
        childItem.setAttribute('popovertarget', deepest.id);
        element.append(deepest);
        await elementIsStable(deepest);
        const childOpened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await childOpened;
        const deepestOpened = untilEvent(deepest, 'open');
        deepest.showPopover({ source: childItem });
        await deepestOpened;
        deepestItem = deepest.querySelector('nve-menu-item:not([disabled])');
      });

      it('should return to the immediate parent on a backward arrow', async () => {
        const closed = untilEvent(deepest, 'close');
        deepestItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true }));
        await closed;
        expect(document.activeElement).toBe(childItem);
        expect(dropdown.matches(':popover-open')).toBe(true);
      });

      it.each(['Escape', 'close'])('should return to the root invoker after %s', async action => {
        const dropdowns = element.querySelectorAll('nve-dropdown');
        const closed = Array.from(dropdowns, item => untilEvent(item, 'close'));
        if (action === 'Escape') {
          deepestItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, composed: true }));
        } else {
          element.close();
        }
        await Promise.all(closed);
        dropdowns.forEach(item => expect(item.matches(':popover-open')).toBe(false));
        expect(document.activeElement).toBe(fixture.querySelector('nve-button'));
      });
    });

    describe('dismissal', () => {
      beforeEach(async () => {
        const opened = untilEvent(dropdown, 'open');
        dropdown.showPopover({ source: trigger });
        await opened;
      });

      it('should close the cascade when the pointer is outside every dropdown', async () => {
        const closed = untilEvent(dropdown, 'close');
        document.dispatchEvent(new PointerEvent('pointerup', { clientX: -100, clientY: -100 }));
        await closed;
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(fixture.querySelector('#outer-menu').matches(':popover-open')).toBe(false);
      });

      it('should dismiss the root at the viewport origin when its submenu is closed', async () => {
        const childClosed = untilEvent(dropdown, 'close');
        dropdown.hidePopover();
        await childClosed;
        await expect.poll(() => dropdown.getClientRects().length).toBe(0);
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const bounds = parent.getBoundingClientRect();
        expect(bounds.left > 0 || bounds.top > 0).toBe(true);
        document.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 }));
        await expect.poll(() => parent.matches(':popover-open')).toBe(false);
      });

      it('should keep the cascade open when the pointer is inside a dropdown', () => {
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const bounds = parent.getBoundingClientRect();
        parent.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            clientX: bounds.x + bounds.width / 2,
            clientY: bounds.y + bounds.height / 2
          })
        );
        expect(parent.matches(':popover-open')).toBe(true);
        expect(dropdown.matches(':popover-open')).toBe(true);
      });

      it.each(['Escape', 'close'])('should return to the external invoker after cascade %s', async action => {
        const closed = untilEvent(dropdown, 'close');
        const parent = fixture.querySelector('nve-dropdown#outer-menu');
        const parentClosed = untilEvent(parent, 'close');
        expect(document.activeElement).toBe(childItem);
        if (action === 'Escape') {
          childItem.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, composed: true }));
        } else {
          element.close();
        }
        await closed;
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(fixture.querySelector('#outer-menu').matches(':popover-open')).toBe(false);
        await parentClosed;
        expect(document.activeElement).toBe(fixture.querySelector('nve-button'));
      });
    });

    describe('ownership', () => {
      it('should ignore dropdown targets outside the group', async () => {
        const outsideFixture = await createFixture(html`
          <nve-button popovertarget="outside-menu">Outside actions</nve-button>
          <nve-dropdown id="outside-menu">Other content</nve-dropdown>
        `);
        fixture.append(outsideFixture);
        const outside = outsideFixture.querySelector('nve-dropdown');
        await elementIsStable(outside);
        trigger.popoverTargetElement = outside;
        const key = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          bubbles: true,
          composed: true,
          cancelable: true
        });
        trigger.dispatchEvent(key);
        expect(key.defaultPrevented).toBe(false);
        expect(outside.matches(':popover-open')).toBe(false);
        expect(dropdown.matches(':popover-open')).toBe(false);
      });

      it('should navigate to the current dropdown after replacement with the same id', async () => {
        const replacement = document.createElement('nve-dropdown');
        replacement.id = dropdown.id;
        replacement.append(dropdown.querySelector('nve-menu').cloneNode(true));
        dropdown.replaceWith(replacement);
        await elementIsStable(replacement);
        await elementIsStable(element);
        const opened = untilEvent(replacement, 'open');
        trigger.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
        await opened;
        const item = replacement.querySelector('nve-menu-item:not([disabled])');
        expect(replacement.matches(':popover-open')).toBe(true);
        expect(dropdown.matches(':popover-open')).toBe(false);
        expect(document.activeElement).toBe(item);
        const closed = untilEvent(replacement, 'close');
        item.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true, composed: true }));
        await closed;
        expect(document.activeElement).toBe(trigger);
      });

      it('should ignore keyboard events from an independently managed nested dropdown', async () => {
        const nestedFixture = await createFixture(html`
          <nve-button popovertarget="independent-menu">Independent actions</nve-button>
          <nve-dropdown id="independent-menu" .popoverType=${'manual'}>
            <nve-menu><nve-menu-item popovertarget="secondary-menu">Nested action</nve-menu-item></nve-menu>
          </nve-dropdown>
        `);
        const outer = fixture.querySelector('#outer-menu');
        outer.append(nestedFixture);
        const nested = nestedFixture.querySelector('nve-dropdown');
        await elementIsStable(nested);
        const opened = untilEvent(nested, 'open');
        nested.showPopover({ source: nestedFixture.querySelector('nve-button') });
        await opened;
        const item = nested.querySelector('nve-menu-item');
        item.focus();
        expect(document.activeElement).toBe(item);
        for (const code of ['ArrowRight', 'ArrowLeft', 'Escape']) {
          const key = new KeyboardEvent('keydown', { code, bubbles: true, composed: true, cancelable: true });
          item.dispatchEvent(key);
          expect(key.defaultPrevented).toBe(false);
          expect(nested.matches(':popover-open')).toBe(true);
          expect(outer.matches(':popover-open')).toBe(true);
          expect(dropdown.matches(':popover-open')).toBe(false);
        }
      });

      describe('nested groups', () => {
        let outer: HTMLElement;
        let nestedGroup: DropdownGroup;
        let nested: HTMLElement;

        beforeEach(async () => {
          const nestedFixture = await createFixture(html`
            <nve-button popovertarget="nested-menu">Nested actions</nve-button>
            <nve-dropdown-group>
              <nve-dropdown id="nested-menu">
                <nve-menu><nve-menu-item>Nested action</nve-menu-item></nve-menu>
              </nve-dropdown>
            </nve-dropdown-group>
          `);
          outer = fixture.querySelector('#outer-menu');
          outer.append(nestedFixture);
          nestedGroup = nestedFixture.querySelector('nve-dropdown-group');
          nested = nestedFixture.querySelector('nve-dropdown');
          await elementIsStable(nested);
          const opened = untilEvent(nested, 'open');
          nested.showPopover({ source: trigger });
          await opened;
        });

        it.each(['item', 'group'])('should isolate Escape from the nested %s', async origin => {
          const target = origin === 'item' ? nested.querySelector('nve-menu-item') : nestedGroup;
          const closed = untilEvent(nested, 'close');
          target.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, composed: true }));
          await closed;
          expect(nested.matches(':popover-open')).toBe(false);
          expect(outer.matches(':popover-open')).toBe(true);
          expect(document.activeElement).toBe(trigger);
        });

        it('should dismiss descendants and keep them closed when the parent reopens', async () => {
          const nestedClosed = untilEvent(nested, 'close');
          const outerClosed = untilEvent(outer, 'close');
          element.close();
          await Promise.all([nestedClosed, outerClosed]);
          expect(nested.matches(':popover-open')).toBe(false);
          expect(document.activeElement).toBe(fixture.querySelector('nve-button'));

          const reopened = untilEvent(outer, 'open');
          outer.showPopover({ source: fixture.querySelector('nve-button') });
          await reopened;
          expect(nested.matches(':popover-open')).toBe(false);
        });
      });
    });
  });

  describe('interactive dropdown content', () => {
    let dropdown: HTMLElement;
    let details: HTMLElement;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-button popovertarget="controls">Controls</nve-button>
        <nve-dropdown-group>
          <nve-dropdown id="controls">
            <nve-button>Action</nve-button>
            <nve-input><input aria-label="Value" /></nve-input>
            <nve-button popovertarget="details">Details</nve-button>
          </nve-dropdown>
          <nve-dropdown id="details">
            <nve-button>Confirm</nve-button>
          </nve-dropdown>
        </nve-dropdown-group>
      `);
      const group = fixture.querySelector('nve-dropdown-group');
      dropdown = fixture.querySelector('#controls');
      details = fixture.querySelector('#details');
      await elementIsStable(group);
      await elementIsStable(fixture.querySelector('nve-input'));
      const opened = untilEvent(dropdown, 'open');
      dropdown.showPopover({ source: fixture.querySelector('nve-button') });
      await opened;
    });

    it.each([
      { name: 'button', selector: 'nve-button:not([popovertarget])' },
      { name: 'input', selector: 'input' }
    ])('should leave arrow events and focus with the $name', ({ selector }) => {
      const control = dropdown.querySelector<HTMLElement>(selector);
      control.focus();
      expect(document.activeElement).toBe(control);
      const escaped: Event[] = [];
      fixture.addEventListener('keydown', event => escaped.push(event));
      for (const code of ['ArrowRight', 'ArrowLeft']) {
        const key = new KeyboardEvent('keydown', { code, bubbles: true, composed: true, cancelable: true });
        control.dispatchEvent(key);
        expect(key.defaultPrevented).toBe(false);
        expect(dropdown.matches(':popover-open')).toBe(true);
        expect(details.matches(':popover-open')).toBe(false);
        expect(document.activeElement).toBe(control);
      }
      expect(escaped).toHaveLength(2);
    });

    it('should honor a focused button invoker outside a menu', async () => {
      const button = dropdown.querySelector('nve-button[popovertarget]');
      button.focus();
      expect(document.activeElement).toBe(button);
      const opened = untilEvent(details, 'open');
      button.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, composed: true }));
      await opened;
      expect(details.matches(':popover-open')).toBe(true);
      expect(document.activeElement).toBe(details.querySelector('nve-button'));
    });
  });
});
