// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LABEL_CHILD_BOXLESS, LABEL_CHILD_COUNT, LABEL_FRAME_UNRESOLVED, LABEL_PARENT } from '../../errors.js';
import { getFrameWorldMatrix, getNamedSceneFrame } from '../../internal/frame-state.js';
import { getLabelConfiguration, setLabelSceneState } from '../../internal/label/state.js';
import { projectLabel } from './projection.js';
import { scenePlatform } from '../../internal/gpu/platform.js';
import { transformPointMat4 } from '../../internal/math/mat4.js';
import type { Mat4 } from '../../internal/types.js';

const LABEL_SELECTOR = 'nve-scene-label';
const probeLabels = new WeakSet<HTMLElement>();

/** Marks a disposable capability-probe label so owning-scene discovery ignores it. */
export function markLabelProbe(label: HTMLElement): void {
  probeLabels.add(label);
}

/** Lazily loaded direct-label overlay and projection owner for a Scene. */
export class LabelSceneController {
  #diagnostics = new WeakMap<HTMLElement, Set<string>>();
  #labels: HTMLElement[] = [];
  #slots = new Map<HTMLElement, HTMLSlotElement>();
  #depth = new WeakMap<HTMLElement, number>();
  #projected = new Set<HTMLElement>();
  #transforms = new WeakMap<HTMLElement, readonly [number, number]>();

  constructor(
    private readonly host: HTMLElement,
    private readonly getOverlay: () => HTMLElement | undefined,
    private readonly requestRender: () => void
  ) {}

  get labels(): readonly HTMLElement[] {
    return this.#labels;
  }

  getSlot(label: HTMLElement): HTMLSlotElement | undefined {
    return this.#slots.get(label);
  }

  getDepth(label: HTMLElement): number | undefined {
    return this.#depth.get(label);
  }

  isProjected(label: HTMLElement): boolean {
    return this.#projected.has(label);
  }

  refresh(): void {
    this.#labels = [...this.host.querySelectorAll<HTMLElement>(LABEL_SELECTOR)].filter(
      label => label.closest(this.host.localName) === this.host && !probeLabels.has(label)
    );
  }

  // eslint-disable-next-line max-statements -- Slot retirement and creation share the same ownership pass.
  syncSlots(onRemoved: (label: HTMLElement, slot: HTMLSlotElement) => void): void {
    const overlay = this.getOverlay();
    if (!overlay) return;
    for (const label of this.#labels) this.#validate(label, getLabelChild(label));
    const visible = new Set(this.#labels.filter(label => this.#isVisible(label)));
    for (const [label, slot] of this.#slots) {
      if (visible.has(label)) continue;
      onRemoved(label, slot);
      slot.remove();
      this.#slots.delete(label);
      this.#depth.delete(label);
      this.#projected.delete(label);
      this.#transforms.delete(label);
    }
    for (const label of visible) {
      if (this.#slots.has(label)) continue;
      const slot = globalThis.document.createElement('slot');
      slot.assign(label);
      overlay.append(slot);
      this.#slots.set(label, slot);
    }
  }

  // eslint-disable-next-line max-statements, complexity -- Projection keeps every light-DOM label synchronized.
  synchronize(
    viewProjection: Mat4,
    viewport: { readonly height: number; readonly width: number },
    onRemoved: (label: HTMLElement, slot: HTMLSlotElement) => void
  ): void {
    this.refresh();
    this.syncSlots(onRemoved);
    this.#projected.clear();
    for (const label of this.#labels) {
      const slot = this.#slots.get(label);
      const child = getLabelChild(label);
      const valid = this.#validate(label, child);
      if (!slot) continue;
      if (!valid || !child || label.closest('[hidden]') !== null) {
        this.#setOverlay(label);
        hide(slot);
        continue;
      }
      const size = { height: child.offsetHeight, width: child.offsetWidth };
      if (size.width === 0 || size.height === 0 || viewport.width === 0 || viewport.height === 0) {
        this.#setOverlay(label);
        hide(slot);
        continue;
      }
      const configuration = getLabelConfiguration(label);
      const frame = configuration.frame ? getNamedSceneFrame(this.host, configuration.frame) : undefined;
      const position = frame
        ? transformPointMat4(getFrameWorldMatrix(frame), configuration.position)
        : configuration.position;
      const projection = projectLabel({
        anchor: configuration.anchor,
        offset: configuration.offset,
        position,
        size,
        viewProjection,
        viewport
      });
      if (!projection.visible) {
        this.#setOverlay(label);
        hide(slot);
        continue;
      }
      this.#projected.add(label);
      this.#depth.set(label, projection.depth);
      show(slot, label, projection, this.#transforms);
    }
  }

  setOverlay(label: HTMLElement): void {
    this.#setOverlay(label);
  }

  dispose(): void {
    this.#labels = [];
    this.#slots.clear();
    this.#projected.clear();
  }

  #isVisible(label: HTMLElement): boolean {
    return (
      label.parentElement === this.host &&
      label.closest('[hidden]') === null &&
      this.#validate(label, getLabelChild(label))
    );
  }

  // eslint-disable-next-line complexity -- Each declarative label contract has its own recovery episode.
  #validate(label: HTMLElement, child: HTMLElement | undefined): boolean {
    const configuration = getLabelConfiguration(label);
    const frame = configuration.frame === null ? undefined : getNamedSceneFrame(this.host, configuration.frame);
    setLabelSceneState(label, { occluded: false, stale: frame?.hasAttribute('stale') ?? false });
    const direct = label.parentElement === this.host;
    this.#diagnose(label, LABEL_PARENT, !direct, 'Scene labels must be direct children of their owning scene.');
    if (!direct) return false;
    const childValid = child !== undefined && getLabelElementChildren(label).length === 1 && !hasLabelText(label);
    this.#diagnose(
      label,
      LABEL_CHILD_COUNT,
      !childValid,
      'Scene labels must contain exactly one element child and no nonwhitespace direct text.'
    );
    if (!childValid || !child) return false;
    const boxless = ['none', 'contents'].includes(scenePlatform.getComputedStyle(child).display);
    this.#diagnose(label, LABEL_CHILD_BOXLESS, boxless, 'The scene label child must create a layout box.');
    const resolved = configuration.frame === null || frame !== undefined;
    this.#diagnose(
      label,
      LABEL_FRAME_UNRESOLVED,
      !resolved,
      'The scene label frame must resolve to one uniquely named frame in this scene.'
    );
    return !boxless && resolved;
  }

  #setOverlay(label: HTMLElement): void {
    setLabelSceneState(label, { occluded: false, stale: label.hasAttribute('stale') });
  }

  // eslint-disable-next-line max-params -- A diagnostic is intentionally represented by its code, state, and message.
  #diagnose(label: HTMLElement, code: string, active: boolean, message: string): void {
    const codes = this.#diagnostics.get(label) ?? new Set<string>();
    if (!active) {
      codes.delete(code);
      return;
    }
    if (codes.has(code)) return;
    codes.add(code);
    this.#diagnostics.set(label, codes);
    console.error(`[${code}] ${message}`, label);
    label.dispatchEvent(
      new CustomEvent('nve-scene-error', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { code, element: label, message, severity: 'error' }
      })
    );
    this.requestRender();
  }
}

function getLabelChild(label: HTMLElement): HTMLElement | undefined {
  return getLabelElementChildren(label)[0];
}

function getLabelElementChildren(label: HTMLElement): HTMLElement[] {
  return [...label.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function hasLabelText(label: HTMLElement): boolean {
  return [...label.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
}

function hide(slot: HTMLSlotElement): void {
  slot.style.opacity = '0';
  slot.style.pointerEvents = 'none';
}

// eslint-disable-next-line max-params -- Transform cache belongs to the controller, not the DOM slot.
function show(
  slot: HTMLSlotElement,
  label: HTMLElement,
  position: { readonly x: number; readonly y: number },
  transforms: WeakMap<HTMLElement, readonly [number, number]>
): void {
  slot.style.opacity = '1';
  slot.style.pointerEvents = 'auto';
  const previous = transforms.get(label);
  if (previous && Math.abs(previous[0] - position.x) < 1e-4 && Math.abs(previous[1] - position.y) < 1e-4) return;
  slot.style.transform = `translate(${position.x}px, ${position.y}px)`;
  transforms.set(label, [position.x, position.y]);
}
