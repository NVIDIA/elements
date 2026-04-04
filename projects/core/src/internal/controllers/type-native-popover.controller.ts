// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, generateId, getAttributeListChanges } from '../utils/dom.js';
import { attachInternals } from '../utils/a11y.js';
import { focusElement } from '../utils/focus.js';
import { getHostAnchor, getHostTrigger, hasOpenPopover } from './type-native-popover.utils.js';
import type { PopoverType } from '../types/index.js';
import type { InterestEvent } from './type-interest.controller.js';

export interface NativePopover extends ReactiveElement {
  anchor?: HTMLElement | string;
  closeTimeout?: number;
  popoverType?: PopoverType;
  modal?: boolean;
  popoverDismissible?: boolean;
  _activeTrigger?: HTMLElement;
  _internals?: ElementInternals;

  /** @deprecated */
  trigger?: HTMLElement | string;
  /** @deprecated */
  openDelay?: number;
  /** @deprecated */
  behaviorTrigger?: boolean;
}

/**
 * https://open-ui.org/components/popup.research.explainer
 */
export class TypeNativePopoverController<T extends NativePopover> implements ReactiveController {
  get #nativeTriggers(): HTMLElement[] {
    const root = this.host.getRootNode() as HTMLElement;
    const popoverTargetTriggers = Array.from(
      root.querySelectorAll(`[popovertarget="${CSS.escape ? CSS.escape(this.host.id) : this.host.id}"]`)
    ) as HTMLElement[];

    const commandForTriggers = Array.from(
      root.querySelectorAll(`[commandfor="${CSS.escape ? CSS.escape(this.host.id) : this.host.id}"]`)
    ) as HTMLElement[];

    const interestForTriggers = Array.from(
      root.querySelectorAll(`[interestfor="${CSS.escape ? CSS.escape(this.host.id) : this.host.id}"]`)
    ) as HTMLElement[];

    return [...popoverTargetTriggers, ...commandForTriggers, ...interestForTriggers];
  }

  constructor(private host: T) {
    this.host.addController(this);

    const showPopover = this.host.showPopover;
    this.host.showPopover = (options?: ShowPopoverOptions) => {
      if (this.host.isConnected) {
        // provide legacy fallback for source anchor or trigger if not provided, this can happen if the popover is dynamically created in the DOM without the use of the standard popover api or legacy trigger based api
        let source: HTMLElement | Element | null = options?.source ?? null;
        if (!source) {
          if (this.host.anchor) {
            source = getHostAnchor(this.host);
          } else if (this.host.trigger) {
            source = getHostTrigger(this.host, this.host.trigger);
          } else {
            source = globalThis.document.activeElement;
          }
        }

        showPopover.call(this.host, { source: source as HTMLElement });
      }
    };
  }

  async hostConnected() {
    attachInternals(this.host);
    this.host.popover = this.host.popoverType ?? null;
    await this.host.updateComplete;
    this.host.setAttribute('nve-popover', '');
    this.#updateLegacyTriggers();
    this.#setupLegacyTriggers(); // eslint-disable-line @typescript-eslint/no-floating-promises
    this.#setupModalLightDismiss();
    this.host.inert = this.host.matches(':not(:popover-open)') && !!this.#nativeTriggers.length;

    this.host.addEventListener('beforetoggle', e => {
      if (e.newState === 'open') {
        this.host._internals!.states.add('transition-start');
      }
    });

    this.host.addEventListener('toggle', (e: ToggleEvent) => {
      if (this.host.behaviorTrigger) {
        this.host.hidden = e.newState === 'closed';
      }

      if (e.newState === 'open' && this.host.closeTimeout) {
        setTimeout(() => this.host.hidePopover(), this.host.closeTimeout);
      }

      this.host.inert = this.host.matches(':not(:popover-open)');

      if (this.host.modal) {
        this.#toggleFocus(e.newState === 'open', e.target as HTMLElement);
      }

      this.host.dispatchEvent(
        new CustomEvent(e.newState === 'open' && e.oldState !== 'open' ? 'open' : 'close', {
          bubbles: true,
          composed: true,
          detail: { trigger: e.source }
        })
      );
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API#creating_declarative_popovers
    this.host.addEventListener('command', ((e: CommandEvent) => {
      if (e.command === 'toggle-popover') {
        this.host.togglePopover({ source: e.source as HTMLElement });
      }

      if (e.command === 'hide-popover') {
        this.host.hidePopover();
      }

      if (e.command === 'show-popover') {
        this.host.showPopover({ source: e.source as HTMLElement });
      }
    }) as EventListener);

    // https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers
    this.host.addEventListener('interest', ((e: InterestEvent) => {
      const isCustomElement = e.source?.localName.includes('-');
      if (isCustomElement) {
        const interestDelayStart = this.host.openDelay ?? this.#parseInterestDelay();
        if (interestDelayStart) {
          this.#interestTimeout = setTimeout(() => {
            if (this.host.isConnected) {
              this.host.showPopover({ source: e.source as HTMLElement });
            }
          }, interestDelayStart);
        } else {
          this.host.showPopover({ source: e.source as HTMLElement });
        }
      }
    }) as EventListener);

    this.host.addEventListener('loseinterest', ((e: InterestEvent) => {
      const isCustomElement = e.source?.localName.includes('-');
      if (isCustomElement) {
        this.host.hidePopover();
      }

      if (this.#interestTimeout) {
        clearTimeout(this.#interestTimeout);
        this.#interestTimeout = null;
      }
    }) as EventListener);
  }

  #interestTimeout: ReturnType<typeof setTimeout> | null = null;
  #observers: MutationObserver[] = [];
  #previousLegacyTrigger: HTMLButtonElement | null = null;

  async hostUpdated() {
    this.host.popover = this.host.popoverType ?? null;
    this.#updateLegacyTriggers();
  }

  hostDisconnected() {
    this.#observers.forEach(observer => observer.disconnect());

    if (this.#interestTimeout) {
      clearTimeout(this.#interestTimeout);
      this.#interestTimeout = null;
    }
  }

  #parseInterestDelay(): number {
    const style = getComputedStyle(this.host);
    const raw = (style as unknown as { interestDelayStart: string }).interestDelayStart;
    if (!raw) {
      return 0;
    }
    const value = parseFloat(raw);
    return raw.endsWith('ms') ? value : value * 1000;
  }

  #pointerdownWithinModal = false;

  #setupModalLightDismiss() {
    this.host.addEventListener('pointerdown', e => {
      if (this.host.modal && this.host.matches(':popover-open')) {
        this.#pointerdownWithinModal = clickOutsideElementBounds(e, this.host);
      }
    });

    this.host.addEventListener('pointerup', e => {
      if (
        this.#pointerdownWithinModal &&
        this.host.popoverDismissible &&
        this.host.modal &&
        this.host.matches(':popover-open') &&
        !hasOpenPopover(this.host) &&
        clickOutsideElementBounds(e, this.host)
      ) {
        this.host.hidePopover();
      }
    });
  }

  get #legacyHostTrigger(): HTMLElement | null {
    return this.host.trigger ? (getHostTrigger(this.host, this.host.trigger) as HTMLButtonElement) : null;
  }

  /**
   * @deprecated Legacy behavior that allows popovers to show as open by default when using the legacy trigger based api
   */
  async #setupLegacyTriggers() {
    await new Promise(r => requestAnimationFrame(r));

    // setup hidden updates for legacy triggers
    this.#observers.push(
      getAttributeListChanges(this.host, ['hidden'], () => {
        if (this.host.isConnected && !this.host.hidden && !this.host.matches(':popover-open')) {
          this.host.showPopover();
        }

        if (this.host.isConnected && this.host.hidden && this.host.matches(':popover-open')) {
          this.host.hidePopover();
        }
      })
    );

    // determine if popover is open by default
    if (
      this.host.isConnected &&
      !this.#nativeTriggers.length &&
      !this.host.hidden &&
      !this.host.matches(':popover-open')
    ) {
      this.host.popover = 'manual';
      this.host.showPopover();
    }
  }

  /**
   * @deprecated Legacy behavior that allows popovers to show as open by default when using the legacy trigger based api
   */
  #updateLegacyTriggers() {
    const trigger = this.#legacyHostTrigger as HTMLButtonElement;

    // Clean up previous trigger if it changed
    if (this.#previousLegacyTrigger && this.#previousLegacyTrigger !== trigger) {
      this.#previousLegacyTrigger.popoverTargetElement = null;
      this.#previousLegacyTrigger.removeAttribute('popovertarget');
    }

    // if not a hint type setup native popovertarget
    if (trigger) {
      if (this.host.popoverType === 'hint') {
        trigger.addEventListener('mouseenter', () => this.host.showPopover({ source: trigger as HTMLElement }));
        trigger.addEventListener('mouseleave', () => this.host.hidePopover());
        trigger.addEventListener('focusout', () => this.host.hidePopover());
      } else {
        this.host.id = this.host.id ? this.host.id : generateId();
        trigger.popoverTargetElement = this.host;
        trigger.setAttribute('popovertarget', this.host.id);
      }
      this.#previousLegacyTrigger = trigger;
    }
  }

  #toggleFocus(open: boolean, target: HTMLElement) {
    if (open) {
      // only focus popover if not the active element and not containing the active element already
      if ((this.host.getRootNode() as Document).activeElement !== this.host && !this.host.shadowRoot!.activeElement) {
        focusElement(this.host);
      }
    } else {
      focusElement(target);
    }
  }
}
