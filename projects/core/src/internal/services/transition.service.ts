// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class TransitionService_ {
  get #hasSpeculationRules() {
    return globalThis.document.querySelector('[type=speculationrules]');
  }

  get #nveTransition() {
    return globalThis.document.documentElement.getAttribute('nve-transition');
  }

  #observer: MutationObserver;

  enable() {
    if (globalThis.document) {
      this.#observer?.disconnect();
      this.#toggleSpeculationRules();
      this.#observer = new MutationObserver(() => this.#toggleSpeculationRules());
      this.#observer.observe(globalThis.document.documentElement, {
        attributeFilter: ['nve-transition']
      });
    }
  }

  disable() {
    this.#removeSpeculationRules();
    this.#observer?.disconnect();
  }

  #toggleSpeculationRules() {
    if (globalThis.document && this.#nveTransition === 'auto') {
      if (!this.#hasSpeculationRules) {
        this.#appendSpeculationRules();
      }
    } else {
      this.#removeSpeculationRules();
    }
  }

  #appendSpeculationRules() {
    const speculationRules = globalThis.document.createElement('script');
    speculationRules.id = 'nve-speculationrules';
    speculationRules.type = 'speculationrules';
    speculationRules.textContent = JSON.stringify({
      prerender: [
        {
          where: { href_matches: '/*' },
          eagerness: 'moderate'
        }
      ]
    });
    globalThis.document.head.appendChild(speculationRules);
  }

  #removeSpeculationRules() {
    globalThis.document?.querySelector('#nve-speculationrules')?.remove();
  }
}

/**
 * The Transition Service provides setup to enable View Transitions APIs.
 * This includes initializing base speculation rules for smooth transition between navigations.
 *
 * https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
 * https://developer.chrome.com/docs/web-platform/prerender-pages#speculation-rules-api
 */
export const TransitionService = new TransitionService_();
