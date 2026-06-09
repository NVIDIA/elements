// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, generateId, getAttributeListChanges } from '../utils/dom.js';
import { attachInternals } from '../utils/a11y.js';
import { focusElement } from '../utils/focus.js';
import { getHostAnchor, getHostTrigger, hasOpenPopover } from './type-native-popover.utils.js';
import type { InterestEvent, PopoverType } from '../types/index.js';

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
    if (!this.host.isConnected) return;

    this.host.setAttribute('nve-popover', '');
    this.#updateLegacyTriggers();
    this.#setupLegacyTriggers(); // eslint-disable-line @typescript-eslint/no-floating-promises
    this.#setupModalLightDismiss();
    this.host.inert = this.host.matches(':not(:popover-open)') && !!this.#nativeTriggers.length;

    this.host.addEventListener('beforetoggle', this.#onBeforeToggle);
    this.host.addEventListener('toggle', this.#onToggle as EventListener);
    this.host.addEventListener('command', this.#onCommand as EventListener);
    this.host.addEventListener('interest', this.#onInterest as EventListener);
    this.host.addEventListener('loseinterest', this.#onLoseInterest as EventListener);
  }

  #interestTimeout: ReturnType<typeof setTimeout> | null = null;
  #closeTimeout: ReturnType<typeof setTimeout> | null = null;
  #observers: MutationObserver[] = [];
  #previousLegacyTrigger: HTMLButtonElement | null = null;
  #hintTrigger: HTMLButtonElement | null = null;

  async hostUpdated() {
    this.host.popover = this.host.popoverType ?? null;
    this.#updateLegacyTriggers();
  }

  hostDisconnected() {
    this.#observers.forEach(observer => observer.disconnect());
    this.#observers.length = 0;
    this.host.removeEventListener('beforetoggle', this.#onBeforeToggle);
    this.host.removeEventListener('toggle', this.#onToggle as EventListener);
    this.host.removeEventListener('command', this.#onCommand as EventListener);
    this.host.removeEventListener('interest', this.#onInterest as EventListener);
    this.host.removeEventListener('loseinterest', this.#onLoseInterest as EventListener);
    this.host.removeEventListener('pointerdown', this.#onPointerDown);
    this.host.removeEventListener('pointerup', this.#onPointerUp);
    this.#removeHintTrigger();
    this.#clearInterestTimeout();
    this.#clearCloseTimeout();
  }

  #setCloseTimeout() {
    this.#clearCloseTimeout();
    if (this.host.closeTimeout) {
      this.#closeTimeout = setTimeout(() => this.host.hidePopover(), this.host.closeTimeout);
    }
  }

  #clearCloseTimeout() {
    if (this.#closeTimeout) {
      clearTimeout(this.#closeTimeout);
      this.#closeTimeout = null;
    }
  }

  #clearInterestTimeout() {
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
    this.host.removeEventListener('pointerdown', this.#onPointerDown);
    this.host.removeEventListener('pointerup', this.#onPointerUp);
    this.host.addEventListener('pointerdown', this.#onPointerDown);
    this.host.addEventListener('pointerup', this.#onPointerUp);
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

    if (this.#previousLegacyTrigger && this.#previousLegacyTrigger !== trigger) {
      this.#clearLegacyTrigger(this.#previousLegacyTrigger);
    }

    if (this.#hintTrigger && this.#hintTrigger !== trigger) {
      this.#removeHintTrigger();
    }

    if (!trigger) {
      this.#previousLegacyTrigger = null;
      return;
    }

    if (this.host.popoverType === 'hint') {
      this.#setupHintTrigger(trigger);
    } else {
      this.#setupPopoverTargetTrigger(trigger);
    }
    this.#previousLegacyTrigger = trigger;
  }

  #setupHintTrigger(trigger: HTMLButtonElement) {
    if (this.#hintTrigger === trigger) return;

    trigger.addEventListener('mouseenter', this.#onHintMouseEnter);
    trigger.addEventListener('mouseleave', this.#onHintMouseLeave);
    trigger.addEventListener('focusout', this.#onHintMouseLeave);
    this.#hintTrigger = trigger;
  }

  #setupPopoverTargetTrigger(trigger: HTMLButtonElement) {
    this.#removeHintTrigger();
    this.host.id = this.host.id ? this.host.id : generateId();
    trigger.popoverTargetElement = this.host;
    trigger.setAttribute('popovertarget', this.host.id);
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

  #clearLegacyTrigger(trigger: HTMLButtonElement) {
    trigger.popoverTargetElement = null;
    trigger.removeAttribute('popovertarget');
    if (this.#hintTrigger === trigger) {
      this.#removeHintTrigger();
    }
  }

  #removeHintTrigger() {
    this.#hintTrigger?.removeEventListener('mouseenter', this.#onHintMouseEnter);
    this.#hintTrigger?.removeEventListener('mouseleave', this.#onHintMouseLeave);
    this.#hintTrigger?.removeEventListener('focusout', this.#onHintMouseLeave);
    this.#hintTrigger = null;
  }

  #onBeforeToggle = (e: ToggleEvent) => {
    if (e.newState === 'open') {
      this.host._internals!.states.add('transition-start');
    }
  };

  #onToggle = (e: ToggleEvent) => {
    if (this.host.behaviorTrigger) {
      this.host.hidden = e.newState === 'closed';
    }

    if (e.newState === 'open' && this.host.closeTimeout) {
      this.#setCloseTimeout();
    }

    if (e.newState === 'closed') {
      this.#clearInterestTimeout();
      this.#clearCloseTimeout();
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
  };

  #onCommand = (e: CommandEvent) => {
    if (e.command === 'toggle-popover') {
      this.host.togglePopover({ source: e.source as HTMLElement });
    }

    if (e.command === 'hide-popover') {
      this.host.hidePopover();
      this.#clearInterestTimeout();
    }

    if (e.command === 'show-popover') {
      this.host.showPopover({ source: e.source as HTMLElement });
    }
  };

  #onInterest = (e: InterestEvent) => {
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
  };

  #onLoseInterest = (e: InterestEvent) => {
    const isCustomElement = e.source?.localName.includes('-');
    if (isCustomElement) {
      this.host.hidePopover();
    }

    this.#clearInterestTimeout();
  };

  #onPointerDown = (e: PointerEvent) => {
    if (this.host.modal && this.host.matches(':popover-open')) {
      this.#pointerdownWithinModal = clickOutsideElementBounds(e, this.host);
    }
  };

  #onPointerUp = (e: PointerEvent) => {
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
  };

  #onHintMouseEnter = (e: MouseEvent) => {
    this.host.showPopover({ source: e.currentTarget as HTMLElement });
  };

  #onHintMouseLeave = () => {
    this.host.hidePopover();
  };
}
