// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { finiteOr, nonnegativeFiniteOr } from '@nvidia-elements/core/internal';
import type { ViewportAnimationOptions, ViewportPoint, ViewportTransform } from './viewport.types.js';

interface ViewportAnimation {
  frame: number;
  readonly start: ViewportTransform;
  readonly target: ViewportTransform;
  readonly startCenter: ViewportPoint;
  startTime?: number;
  readonly duration: number;
}

interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

export interface ViewportAnimationDelegate {
  readonly commitTransform: (transform: ViewportTransform) => void;
  readonly clampScale: (value: number) => number;
  readonly getTransform: () => ViewportTransform;
  readonly getViewportSize: () => ViewportSize;
}

export class ViewportAnimationController implements ReactiveController {
  readonly #delegate: ViewportAnimationDelegate;
  #animation?: ViewportAnimation;

  constructor(reactiveHost: ReactiveControllerHost, delegate: ViewportAnimationDelegate) {
    this.#delegate = delegate;
    reactiveHost.addController(this);
  }

  get destinationScale(): number | undefined {
    return this.#animation?.target.scale;
  }

  animateTo(target: Partial<ViewportTransform>, options: ViewportAnimationOptions = {}): void {
    const start = this.#delegate.getTransform();
    const next: ViewportTransform = {
      x: finiteOr(target.x, start.x),
      y: finiteOr(target.y, start.y),
      scale: this.#delegate.clampScale(target.scale ?? start.scale)
    };
    this.cancel();
    if (transformsEqual(start, next)) return;
    const duration = nonnegativeFiniteOr(options.duration, defaultAnimationDuration(start.scale, next.scale));
    if (duration === 0 || prefersReducedMotion()) {
      this.#delegate.commitTransform(next);
      return;
    }
    const viewport = this.#delegate.getViewportSize();
    const animation: ViewportAnimation = {
      duration,
      frame: 0,
      start,
      startCenter: viewportCenter(start, viewport),
      target: next
    };
    this.#animation = animation;
    animation.frame = requestAnimationFrame(this.#animateFrame);
  }

  cancel(): void {
    const animation = this.#animation;
    if (!animation) return;
    cancelAnimationFrame(animation.frame);
    this.#animation = undefined;
  }

  hostDisconnected(): void {
    this.cancel();
  }

  #animateFrame = (time: number): void => {
    const animation = this.#animation;
    if (!animation) return;
    if (animation.startTime === undefined) return this.#startAnimation(animation, time);
    const progress = Math.min(1, Math.max(0, (time - animation.startTime) / animation.duration));
    const eased = standardEasing(progress);
    const viewport = this.#delegate.getViewportSize();
    const targetCenter = viewportCenter(animation.target, viewport);
    const scale = 1 / lerp(1 / animation.start.scale, 1 / animation.target.scale, eased);
    const centerX = lerp(animation.startCenter.x, targetCenter.x, eased);
    const centerY = lerp(animation.startCenter.y, targetCenter.y, eased);
    this.#delegate.commitTransform({
      scale,
      x: centerX - viewport.width / (2 * scale),
      y: centerY - viewport.height / (2 * scale)
    });
    if (progress >= 1) {
      this.#animation = undefined;
      this.#delegate.commitTransform(animation.target);
    } else {
      animation.frame = requestAnimationFrame(this.#animateFrame);
    }
  };

  #startAnimation(animation: ViewportAnimation, time: number): void {
    animation.startTime = time;
    animation.frame = requestAnimationFrame(this.#animateFrame);
  }
}

function defaultAnimationDuration(startScale: number, targetScale: number): number {
  return Math.min(400, Math.max(150, 150 + Math.abs(Math.log2(targetScale / startScale)) * 100));
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function standardEasing(progress: number): number {
  let parameter = progress;
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const x = cubicBezier(parameter, 0.4, 0.2) - progress;
    const slope = cubicBezierSlope(parameter, 0.4, 0.2);
    if (Math.abs(slope) < 1e-7) break;
    parameter = Math.min(1, Math.max(0, parameter - x / slope));
  }
  return cubicBezier(parameter, 0, 1);
}

function transformsEqual(first: ViewportTransform, second: ViewportTransform): boolean {
  return first.x === second.x && first.y === second.y && first.scale === second.scale;
}

function viewportCenter(transform: ViewportTransform, viewport: ViewportSize): ViewportPoint {
  return {
    x: transform.x + viewport.width / (2 * transform.scale),
    y: transform.y + viewport.height / (2 * transform.scale)
  };
}

function cubicBezier(parameter: number, firstControl: number, secondControl: number): number {
  const inverse = 1 - parameter;
  return 3 * inverse ** 2 * parameter * firstControl + 3 * inverse * parameter ** 2 * secondControl + parameter ** 3;
}

function cubicBezierSlope(parameter: number, firstControl: number, secondControl: number): number {
  const inverse = 1 - parameter;
  return (
    3 * inverse ** 2 * firstControl +
    6 * inverse * parameter * (secondControl - firstControl) +
    3 * parameter ** 2 * (1 - secondControl)
  );
}
