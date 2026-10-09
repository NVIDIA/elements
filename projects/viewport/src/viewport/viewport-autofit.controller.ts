// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { getChildren, getCustomElementRegistry } from '@nvidia-elements/core/internal';
import type { ViewportClientRect } from './viewport-fitting.utils.js';

interface ViewportAutoFitHost extends ReactiveControllerHost, HTMLElement {
  readonly autoFit: boolean;
  readonly hasUpdated: boolean;
}

type ApplyInitialFit = (clientRects: readonly ViewportClientRect[]) => void;

/** Coordinates one initial fit once default-slot children have definitions and measurable layout. */
export class ViewportAutoFitController implements ReactiveController {
  readonly #applyInitialFit: ApplyInitialFit;
  readonly #host: ViewportAutoFitHost;
  #children?: readonly Element[];
  #consumed = false;
  #frame?: number;
  #generation = 0;
  #observer?: ResizeObserver;

  constructor(host: ViewportAutoFitHost, applyInitialFit: ApplyInitialFit) {
    this.#host = host;
    this.#applyInitialFit = applyInitialFit;
    host.addController(this);
  }

  hostConnected(): void {
    if (this.#host.hasUpdated) this.#start();
  }

  hostDisconnected(): void {
    this.#cancelPending();
  }

  hostUpdated(): void {
    if (this.#host.autoFit) {
      this.#start();
    } else {
      this.#cancelPending();
    }
  }

  contentChanged = (event: Event): void => {
    if (!(event.target instanceof HTMLSlotElement)) return;
    this.#start(event.target);
  };

  consume(): void {
    if (!this.#host.autoFit || this.#consumed) return;
    this.#consumed = true;
    this.#children = undefined;
    this.#generation += 1;
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  #cancelPending(): void {
    this.#generation += 1;
    this.#children = undefined;
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  #start(slot?: HTMLSlotElement): void {
    if (!this.#host.autoFit || this.#consumed || this.#children || !this.#host.isConnected) return;
    const children = (slot ? getChildren(slot) : Array.from(this.#host.children).filter(child => !child.slot)).filter(
      child => !(child instanceof HTMLElement && child.hidden)
    );
    this.#children = children;
    const generation = ++this.#generation;
    void this.#waitForDefinitions(children).then(() => this.#waitForLayout(generation));
  }

  async #waitForDefinitions(children: readonly Element[]): Promise<void> {
    const definitions = new Map<CustomElementRegistry, Set<string>>();
    for (const child of children) {
      for (const element of [child, ...child.querySelectorAll(':not(:defined)')]) {
        if (
          element.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
          !element.localName.includes('-') ||
          isExplicitlyHidden(element, child)
        ) {
          continue;
        }
        const registry = getCustomElementRegistry(element);
        if (!registry) continue;
        const names = definitions.get(registry) ?? new Set<string>();
        names.add(element.localName);
        definitions.set(registry, names);
      }
    }
    await Promise.all(
      Array.from(definitions, ([registry, names]) =>
        Promise.all(Array.from(names, name => whenDefined(registry, name)))
      )
    );
  }

  #waitForLayout(generation: number): void {
    if (!this.#isCurrent(generation)) return;
    if (typeof ResizeObserver === 'undefined') {
      queueMicrotask(() => this.#fit(generation));
      return;
    }
    this.#observer?.disconnect();
    this.#observer = new ResizeObserver(() => this.#scheduleFit(generation));
    this.#observer.observe(this.#host);
  }

  #scheduleFit(generation: number): void {
    if (!this.#isCurrent(generation) || this.#host.clientWidth <= 0 || this.#host.clientHeight <= 0) return;
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.#fit(generation);
    });
  }

  #fit(generation: number): void {
    if (!this.#isCurrent(generation) || this.#host.clientWidth <= 0 || this.#host.clientHeight <= 0) return;
    const children = this.#children;
    if (!children) return;
    const measurableBounds = this.#measurableClientRects(children);
    this.consume();
    if (measurableBounds.length) this.#applyInitialFit(measurableBounds);
  }

  #measurableClientRects(children: readonly Element[]): ViewportClientRect[] {
    const assigned = new Set(Array.from(this.#host.children).filter(child => !child.slot));
    const measurableBounds: ViewportClientRect[] = [];
    for (const child of children) {
      if (!assigned.has(child) || (child instanceof HTMLElement && child.hidden)) continue;
      const bounds = child.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) {
        measurableBounds.push({ height: bounds.height, left: bounds.left, top: bounds.top, width: bounds.width });
      }
    }
    return measurableBounds;
  }

  #isCurrent(generation: number): boolean {
    return (
      generation === this.#generation &&
      this.#host.autoFit &&
      !this.#consumed &&
      this.#children !== undefined &&
      this.#host.isConnected
    );
  }
}

async function whenDefined(registry: CustomElementRegistry, name: string): Promise<void> {
  try {
    await registry.whenDefined(name);
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'SyntaxError') throw error;
  }
}

function isExplicitlyHidden(element: Element, child: Element): boolean {
  for (let current: Element | null = element; current; current = current.parentElement) {
    if (current instanceof HTMLElement && current.hidden) return true;
    if (current === child) return false;
  }
  return false;
}
